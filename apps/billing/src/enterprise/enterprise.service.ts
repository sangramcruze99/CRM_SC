import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from '../entitlements/entitlement.service';

export interface CreateEnterpriseContractDto {
  tenantId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  customPrice: number;
  billingMethod?: string;
  customEntitlements?: Record<string, boolean>;
  customLimits?: Record<string, number>;
  purchaseOrderRef?: string;
  autoRenew?: boolean;
}

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementService: EntitlementService,
  ) {}

  /**
   * Create or update bespoke enterprise contract
   */
  async createContract(dto: CreateEnterpriseContractDto) {
    const {
      tenantId,
      contractNumber,
      startDate,
      endDate,
      customPrice,
      billingMethod = 'INVOICE',
      customEntitlements = {},
      customLimits = {},
      purchaseOrderRef,
      autoRenew = true,
    } = dto;

    // If another contract with this contractNumber already exists (e.g. from previous tests), clean it up
    const existingWithNumber = await this.prisma.enterpriseContract.findUnique({
      where: { contractNumber },
    });
    if (existingWithNumber && existingWithNumber.tenantId !== tenantId) {
      await this.prisma.enterpriseContract.delete({
        where: { id: existingWithNumber.id },
      });
    }

    const contract = await this.prisma.enterpriseContract.upsert({
      where: { tenantId },
      update: {
        contractNumber,
        startDate,
        endDate,
        customPrice,
        billingMethod,
        customEntitlements: JSON.stringify(customEntitlements),
        customLimits: JSON.stringify(customLimits),
        purchaseOrderRef,
        autoRenew,
        status: 'ACTIVE',
      },
      create: {
        tenantId,
        contractNumber,
        startDate,
        endDate,
        customPrice,
        billingMethod,
        customEntitlements: JSON.stringify(customEntitlements),
        customLimits: JSON.stringify(customLimits),
        purchaseOrderRef,
        autoRenew,
        status: 'ACTIVE',
      },
    });

    // Also ensure a local Subscription record reflects ENTERPRISE
    const existingSub = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: 'ENTERPRISE',
          status: 'ACTIVE',
          billingInterval: 'annual',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          tenantId,
          planId: 'ENTERPRISE',
          status: 'ACTIVE',
          billingInterval: 'annual',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });
    }

    this.entitlementService.invalidateCache(tenantId);
    this.logger.log(`[Enterprise] Activated bespoke contract ${contractNumber} for tenant ${tenantId}`);
    return contract;
  }

  /**
   * Set specific tenant override
   */
  async setOverride(params: {
    tenantId: string;
    featureKey: string;
    overrideType: 'BOOLEAN' | 'LIMIT' | 'QUOTA';
    value: string;
    reason?: string;
    createdBy?: string;
  }) {
    const { tenantId, featureKey, overrideType, value, reason, createdBy } = params;

    const override = await this.prisma.tenantEntitlementOverride.upsert({
      where: {
        tenantId_featureKey: {
          tenantId,
          featureKey,
        },
      },
      update: {
        overrideType,
        value,
        reason,
        createdBy,
      },
      create: {
        tenantId,
        featureKey,
        overrideType,
        value,
        reason,
        createdBy,
      },
    });

    this.entitlementService.invalidateCache(tenantId);
    this.logger.log(`[Enterprise] Set override for tenant ${tenantId} [${featureKey}=${value}]`);
    return override;
  }

  async getContract(tenantId: string) {
    const contract = await this.prisma.enterpriseContract.findUnique({
      where: { tenantId },
    });
    if (!contract) return null;

    return {
      ...contract,
      customEntitlements: JSON.parse(contract.customEntitlements || '{}'),
      customLimits: JSON.parse(contract.customLimits || '{}'),
    };
  }
}
