import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ValidateCouponResult {
  valid: boolean;
  couponCode: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  currency: string;
  calculatedDiscount: number;
  finalPrice: number;
  reason?: string;
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed default promotional coupons if none exist
   */
  async ensureSeedCoupons() {
    try {
      const count = await this.prisma.coupon.count();
      if (count === 0) {
        await this.prisma.coupon.createMany({
          data: [
            {
              code: 'BUSINESSOS20',
              name: '20% Launch Discount',
              discountType: 'PERCENTAGE',
              value: 20,
              currency: 'USD',
              maxRedemptions: 500,
              timesRedeemed: 0,
              isActive: true,
            },
            {
              code: 'STARTUP50',
              name: '$50 Off First Subscription',
              discountType: 'FIXED',
              value: 50,
              currency: 'USD',
              maxRedemptions: 200,
              timesRedeemed: 0,
              isActive: true,
            },
            {
              code: 'ENTERPRISEVIP',
              name: 'Enterprise VIP 30% Promo',
              discountType: 'PERCENTAGE',
              value: 30,
              currency: 'USD',
              maxRedemptions: 50,
              timesRedeemed: 0,
              isActive: true,
            },
          ],
        });
      }
    } catch {
      // safe fallback
    }
  }

  /**
   * Validate a coupon code against an intended plan price
   */
  async validateCoupon(code: string, originalPrice: number, planKey?: string): Promise<ValidateCouponResult> {
    await this.ensureSeedCoupons();

    const normalizedCode = code?.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return {
        valid: false,
        couponCode: normalizedCode,
        name: '',
        discountType: 'PERCENTAGE',
        value: 0,
        currency: 'USD',
        calculatedDiscount: 0,
        finalPrice: originalPrice,
        reason: 'Coupon code does not exist',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        couponCode: normalizedCode,
        name: coupon.name,
        discountType: coupon.discountType as any,
        value: coupon.value,
        currency: coupon.currency,
        calculatedDiscount: 0,
        finalPrice: originalPrice,
        reason: 'Coupon is no longer active',
      };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return {
        valid: false,
        couponCode: normalizedCode,
        name: coupon.name,
        discountType: coupon.discountType as any,
        value: coupon.value,
        currency: coupon.currency,
        calculatedDiscount: 0,
        finalPrice: originalPrice,
        reason: 'Coupon has expired',
      };
    }

    if (coupon.timesRedeemed >= coupon.maxRedemptions) {
      return {
        valid: false,
        couponCode: normalizedCode,
        name: coupon.name,
        discountType: coupon.discountType as any,
        value: coupon.value,
        currency: coupon.currency,
        calculatedDiscount: 0,
        finalPrice: originalPrice,
        reason: 'Maximum redemption limit reached for this coupon',
      };
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (originalPrice * coupon.value) / 100;
    } else {
      discount = Math.min(coupon.value, originalPrice);
    }
    discount = Number(discount.toFixed(2));
    const finalPrice = Number(Math.max(0, originalPrice - discount).toFixed(2));

    return {
      valid: true,
      couponCode: normalizedCode,
      name: coupon.name,
      discountType: coupon.discountType as any,
      value: coupon.value,
      currency: coupon.currency,
      calculatedDiscount: discount,
      finalPrice,
    };
  }

  /**
   * Redeem a coupon atomically for a tenant
   */
  async redeemCoupon(code: string, tenantId: string, basePrice: number, planKey?: string) {
    const validation = await this.validateCoupon(code, basePrice, planKey);
    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: validation.couponCode },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    // Register redemption
    const redemption = await this.prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        tenantId,
        discountAmount: validation.calculatedDiscount,
      },
    });

    // Increment timesRedeemed
    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { timesRedeemed: { increment: 1 } },
    });

    this.logger.log(`[Coupons] Tenant ${tenantId} redeemed coupon ${code} (Discount: $${validation.calculatedDiscount})`);
    return {
      success: true,
      redemptionId: redemption.id,
      discountApplied: validation.calculatedDiscount,
      finalPrice: validation.finalPrice,
    };
  }
}
