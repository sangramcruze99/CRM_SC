import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateStockMovementDto {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  reference?: string;
  actor?: string;
  notes?: string;
}

@Injectable()
export class StockMovementsService {
  private readonly logger = new Logger(StockMovementsService.name);

  // In-memory fallback
  private memoryMovements: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(productId?: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        const where: any = { tenantId };
        if (productId) {
          where.productId = productId;
        }
        return await this.prisma.stockMovement.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
      } catch (err: any) {
        this.logger.warn(`Failed to query stock movements from DB: ${err.message}`);
      }
    }

    let list = this.memoryMovements.filter(m => m.tenantId === tenantId);
    if (productId) {
      list = list.filter(m => m.productId === productId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(dto: CreateStockMovementDto, tenantId = 'default-tenant') {
    if (dto.quantity <= 0 && dto.type !== 'ADJUSTMENT') {
      throw new BadRequestException('Quantity must be greater than 0 for IN/OUT movements');
    }

    if (this.prisma.isConnected) {
      try {
        const product = await this.prisma.product.findFirst({
          where: { id: dto.productId, tenantId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${dto.productId} not found`);
        }

        const previousQty = product.quantity;
        let newQty = previousQty;

        if (dto.type === 'IN') {
          newQty = previousQty + dto.quantity;
        } else if (dto.type === 'OUT') {
          if (previousQty < dto.quantity) {
            throw new BadRequestException(`Insufficient stock: current is ${previousQty}, requested is ${dto.quantity}`);
          }
          newQty = previousQty - dto.quantity;
        } else if (dto.type === 'ADJUSTMENT') {
          newQty = Math.max(0, dto.quantity);
        }

        let newStatus = product.status;
        if (newQty <= 0) {
          newStatus = 'OUT_OF_STOCK';
        } else if (newQty <= product.reorderPoint) {
          newStatus = 'LOW_STOCK';
        } else if (product.status === 'LOW_STOCK' || product.status === 'OUT_OF_STOCK') {
          newStatus = 'ACTIVE';
        }

        const [movement] = await this.prisma.$transaction([
          this.prisma.stockMovement.create({
            data: {
              tenantId,
              productId: product.id,
              type: dto.type,
              quantity: dto.quantity,
              previousQty,
              newQty,
              reason: dto.reason || 'MANUAL_UPDATE',
              reference: dto.reference,
              actor: dto.actor || 'System Operator',
              notes: dto.notes,
            },
            include: {
              product: true,
            },
          }),
          this.prisma.product.update({
            where: { id: product.id },
            data: {
              quantity: newQty,
              status: newStatus,
            },
          }),
        ]);

        return movement;
      } catch (err: any) {
        this.logger.warn(`Failed to execute DB stock movement: ${err.message}`);
        if (err instanceof BadRequestException || err instanceof NotFoundException) {
          throw err;
        }
      }
    }

    // In-memory fallback
    const movement = {
      id: `mov_${Date.now()}`,
      tenantId,
      productId: dto.productId,
      type: dto.type,
      quantity: dto.quantity,
      previousQty: 0,
      newQty: dto.quantity,
      reason: dto.reason || 'MANUAL_UPDATE',
      reference: dto.reference,
      actor: dto.actor || 'System Operator',
      notes: dto.notes,
      createdAt: new Date(),
    };
    this.memoryMovements.push(movement);
    return movement;
  }
}
