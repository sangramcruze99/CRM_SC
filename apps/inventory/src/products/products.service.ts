import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  price?: number;
  costPrice?: number;
  quantity?: number;
  reorderPoint?: number;
  unit?: string;
  categoryId?: string;
  supplierId?: string;
  barcode?: string;
  location?: string;
  status?: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  // In-memory fallback
  private memoryProducts: any[] = [
    {
      id: 'prod_1',
      tenantId: 'default-tenant',
      name: 'Enterprise Cloud Server Rack 42U',
      sku: 'SRV-ECR-900',
      description: 'High-density 42U server cabinet with redundant PDUs and seismic bracing',
      price: 4999.0,
      costPrice: 3200.0,
      quantity: 24,
      reorderPoint: 5,
      unit: 'unit',
      status: 'ACTIVE',
      categoryId: 'cat_hardware',
      supplierId: 'sup_supermicro',
      barcode: '840192830192',
      location: 'Warehouse A - Bay 12',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_2',
      tenantId: 'default-tenant',
      name: 'Optical Network Transceiver 100G QSFP28',
      sku: 'OPT-NT-100',
      description: '100Gbps dual-rate SMF optical transceiver module (1310nm, 10km)',
      price: 299.0,
      costPrice: 165.0,
      quantity: 120,
      reorderPoint: 25,
      unit: 'pcs',
      status: 'ACTIVE',
      categoryId: 'cat_networking',
      supplierId: 'sup_fiberoptics',
      barcode: '840192830208',
      location: 'Warehouse A - Shelf 3B',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_3',
      tenantId: 'default-tenant',
      name: 'Secure Hardware Security Module (HSM) PCIe',
      sku: 'HSM-SEC-50',
      description: 'FIPS 140-2 Level 3 certified cryptographic accelerator module',
      price: 1250.0,
      costPrice: 850.0,
      quantity: 4,
      reorderPoint: 6,
      unit: 'pcs',
      status: 'LOW_STOCK',
      categoryId: 'cat_security',
      supplierId: 'sup_yubico',
      barcode: '840192830314',
      location: 'Secure Vault C - Bin 4',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_4',
      tenantId: 'default-tenant',
      name: 'Managed Core Switch 48-Port 10GbE SFP+',
      sku: 'NET-SW-48X',
      description: 'Layer 3 enterprise spine switch with redundant hot-swap power supplies',
      price: 3450.0,
      costPrice: 2100.0,
      quantity: 12,
      reorderPoint: 4,
      unit: 'unit',
      status: 'ACTIVE',
      categoryId: 'cat_networking',
      supplierId: 'sup_fiberoptics',
      barcode: '840192830421',
      location: 'Warehouse A - Bay 14',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_5',
      tenantId: 'default-tenant',
      name: 'High-Performance NVMe Storage Array 64TB',
      sku: 'STR-NVME-64',
      description: 'All-flash SAN/NAS storage array delivering 1.2M random read IOPS',
      price: 8900.0,
      costPrice: 5900.0,
      quantity: 2,
      reorderPoint: 3,
      unit: 'unit',
      status: 'LOW_STOCK',
      categoryId: 'cat_hardware',
      supplierId: 'sup_supermicro',
      barcode: '840192830538',
      location: 'Warehouse B - Cold Row',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'prod_6',
      tenantId: 'default-tenant',
      name: 'FIDO2 Hardware Security Keys (10-Pack)',
      sku: 'SEC-YUBI-10',
      description: 'Dual-protocol USB-C and NFC physical 2FA security tokens',
      price: 450.0,
      costPrice: 280.0,
      quantity: 0,
      reorderPoint: 10,
      unit: 'pack',
      status: 'OUT_OF_STOCK',
      categoryId: 'cat_security',
      supplierId: 'sup_yubico',
      barcode: '840192830645',
      location: 'Secure Vault C - Bin 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    params?: {
      search?: string;
      categoryId?: string;
      supplierId?: string;
      status?: string;
      lowStockOnly?: boolean;
      limit?: number;
    },
    tenantId = 'default-tenant',
  ) {
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.product.count({ where: { tenantId } });
        if (count === 0) {
          await this.seedDefaults(tenantId);
        }

        const where: any = { tenantId };

        if (params?.categoryId) {
          where.categoryId = params.categoryId;
        }
        if (params?.supplierId) {
          where.supplierId = params.supplierId;
        }
        if (params?.status) {
          where.status = params.status;
        }
        if (params?.lowStockOnly) {
          where.OR = [
            { status: 'LOW_STOCK' },
            { status: 'OUT_OF_STOCK' },
          ];
        }
        if (params?.search) {
          where.OR = [
            { name: { contains: params.search } },
            { sku: { contains: params.search } },
            { description: { contains: params.search } },
          ];
        }

        const products = await this.prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true, contactPerson: true, phone: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: params?.limit ? Number(params.limit) : 100,
        });

        return products;
      } catch (err: any) {
        this.logger.warn(`Failed to query products from DB: ${err.message}`);
      }
    }

    // In-memory fallback
    let list = this.memoryProducts.filter(p => p.tenantId === tenantId);
    if (params?.categoryId) {
      list = list.filter(p => p.categoryId === params.categoryId);
    }
    if (params?.status) {
      list = list.filter(p => p.status === params.status);
    }
    if (params?.lowStockOnly) {
      list = list.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK' || p.quantity <= p.reorderPoint);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return list;
  }

  async getStats(tenantId = 'default-tenant') {
    const products = await this.findAll({}, tenantId);
    const totalProducts = products.length;
    let totalQuantity = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of products) {
      totalQuantity += p.quantity;
      totalValuation += p.quantity * p.price;
      if (p.status === 'OUT_OF_STOCK' || p.quantity === 0) {
        outOfStockCount++;
      } else if (p.status === 'LOW_STOCK' || p.quantity <= p.reorderPoint) {
        lowStockCount++;
      }
    }

    return {
      totalProducts,
      totalQuantity,
      totalValuation: Math.round(totalValuation * 100) / 100,
      lowStockCount,
      outOfStockCount,
      healthyStockCount: totalProducts - (lowStockCount + outOfStockCount),
    };
  }

  async findOne(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.product.findFirst({
          where: { id, tenantId },
          include: {
            category: true,
            supplier: true,
            movements: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to find product ${id}: ${err.message}`);
      }
    }

    return this.memoryProducts.find(p => p.id === id && p.tenantId === tenantId) || null;
  }

  async create(dto: CreateProductDto, tenantId = 'default-tenant') {
    const qty = dto.quantity ?? 0;
    const reorder = dto.reorderPoint ?? 10;
    let status = dto.status || 'ACTIVE';
    if (qty === 0) {
      status = 'OUT_OF_STOCK';
    } else if (qty <= reorder) {
      status = 'LOW_STOCK';
    }

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.product.create({
          data: {
            tenantId,
            name: dto.name,
            sku: dto.sku,
            description: dto.description,
            price: Number(dto.price || 0),
            costPrice: Number(dto.costPrice || 0),
            quantity: Number(qty),
            reorderPoint: Number(reorder),
            unit: dto.unit || 'pcs',
            status,
            categoryId: dto.categoryId,
            supplierId: dto.supplierId,
            barcode: dto.barcode,
            location: dto.location,
          },
          include: {
            category: true,
            supplier: true,
          },
        });
      } catch (err: any) {
        this.logger.warn(`DB product create failed: ${err.message}`);
      }
    }

    const newProd = {
      id: `prod_${Date.now()}`,
      tenantId,
      name: dto.name,
      sku: dto.sku,
      description: dto.description || '',
      price: Number(dto.price || 0),
      costPrice: Number(dto.costPrice || 0),
      quantity: Number(qty),
      reorderPoint: Number(reorder),
      unit: dto.unit || 'pcs',
      status,
      categoryId: dto.categoryId,
      supplierId: dto.supplierId,
      barcode: dto.barcode,
      location: dto.location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memoryProducts.push(newProd);
    return newProd;
  }

  async update(id: string, dto: Partial<CreateProductDto>, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.product.findFirst({ where: { id, tenantId } });
        if (!existing) {
          throw new NotFoundException(`Product ${id} not found`);
        }

        const qty = dto.quantity !== undefined ? Number(dto.quantity) : existing.quantity;
        const reorder = dto.reorderPoint !== undefined ? Number(dto.reorderPoint) : existing.reorderPoint;
        let status = dto.status || existing.status;
        if (qty === 0) {
          status = 'OUT_OF_STOCK';
        } else if (qty <= reorder) {
          status = 'LOW_STOCK';
        } else if (status === 'LOW_STOCK' || status === 'OUT_OF_STOCK') {
          status = 'ACTIVE';
        }

        return await this.prisma.product.update({
          where: { id },
          data: {
            ...dto,
            quantity: qty,
            reorderPoint: reorder,
            status,
          },
          include: {
            category: true,
            supplier: true,
          },
        });
      } catch (err: any) {
        this.logger.warn(`DB product update failed: ${err.message}`);
      }
    }

    const idx = this.memoryProducts.findIndex(p => p.id === id && p.tenantId === tenantId);
    if (idx !== -1) {
      this.memoryProducts[idx] = { ...this.memoryProducts[idx], ...dto, updatedAt: new Date() };
      return this.memoryProducts[idx];
    }
    return null;
  }

  async delete(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.product.delete({
          where: { id },
        });
      } catch (err: any) {
        this.logger.warn(`DB product delete failed: ${err.message}`);
      }
    }

    const idx = this.memoryProducts.findIndex(p => p.id === id && p.tenantId === tenantId);
    if (idx !== -1) {
      const removed = this.memoryProducts.splice(idx, 1);
      return removed[0];
    }
    return { success: true };
  }

  private async seedDefaults(tenantId: string) {
    try {
      this.logger.log(`Seeding initial inventory default data for tenant ${tenantId}...`);

      const categories = [
        { id: 'cat_hardware', name: 'Server Hardware', description: 'Enterprise rack servers, blade systems, and power modules' },
        { id: 'cat_networking', name: 'Optical Networking', description: 'Transceivers, fiber optic patches, switches, and routers' },
        { id: 'cat_security', name: 'Hardware Security', description: 'HSMs, cryptographic accelerators, and physical security keys' },
        { id: 'cat_peripherals', name: 'Datacenter Components', description: 'Cooling units, cables, rails, and chassis accessories' },
      ];
      for (const cat of categories) {
        await this.prisma.category.upsert({
          where: { tenantId_name: { tenantId, name: cat.name } },
          create: { id: cat.id, tenantId, name: cat.name, description: cat.description },
          update: {},
        });
      }

      const suppliers = [
        { id: 'sup_supermicro', name: 'Supermicro Systems Inc.', contactPerson: 'David Chen', email: 'dchen@supermicro-supply.com', phone: '+1 (408) 503-8000', address: '980 Rock Ave, San Jose, CA 95131', status: 'ACTIVE' },
        { id: 'sup_fiberoptics', name: 'Lumentum Photonics Global', contactPerson: 'Sarah Jenkins', email: 'sjenkins@lumentum-parts.com', phone: '+1 (408) 546-5400', address: '1001 Ridder Park Dr, San Jose, CA 95131', status: 'ACTIVE' },
        { id: 'sup_yubico', name: 'Yubico Physical Auth Group', contactPerson: 'Marcus Lindqvist', email: 'enterprise@yubico.com', phone: '+1 (844) 205-6700', address: '530 Lytton Ave, Palo Alto, CA 94301', status: 'ACTIVE' },
      ];
      for (const sup of suppliers) {
        await this.prisma.supplier.upsert({
          where: { id: sup.id },
          create: { id: sup.id, tenantId, name: sup.name, contactPerson: sup.contactPerson, email: sup.email, phone: sup.phone, address: sup.address, status: sup.status },
          update: {},
        });
      }

      for (const p of this.memoryProducts) {
        await this.prisma.product.upsert({
          where: { tenantId_sku: { tenantId, sku: p.sku } },
          create: {
            id: p.id,
            tenantId,
            name: p.name,
            sku: p.sku,
            description: p.description,
            price: p.price,
            costPrice: p.costPrice,
            quantity: p.quantity,
            reorderPoint: p.reorderPoint,
            unit: p.unit,
            status: p.status,
            categoryId: p.categoryId,
            supplierId: p.supplierId,
            barcode: p.barcode,
            location: p.location,
          },
          update: {},
        });
      }

      const initialMovements = [
        { productId: 'prod_1', type: 'IN', quantity: 24, previousQty: 0, newQty: 24, reason: 'PURCHASE', reference: 'PO-2026-0811', actor: 'Automated Procurement' },
        { productId: 'prod_2', type: 'IN', quantity: 150, previousQty: 0, newQty: 150, reason: 'PURCHASE', reference: 'PO-2026-0820', actor: 'Automated Procurement' },
        { productId: 'prod_2', type: 'OUT', quantity: 30, previousQty: 150, newQty: 120, reason: 'DISPATCH', reference: 'SO-8912', actor: 'Datacenter Tech Team' },
        { productId: 'prod_3', type: 'IN', quantity: 10, previousQty: 0, newQty: 10, reason: 'PURCHASE', reference: 'PO-2026-0845', actor: 'Automated Procurement' },
        { productId: 'prod_3', type: 'OUT', quantity: 6, previousQty: 10, newQty: 4, reason: 'DEPLOYMENT', reference: 'DEP-HSM-VAULT', actor: 'SecOps Officer' },
      ];

      for (const m of initialMovements) {
        await this.prisma.stockMovement.create({
          data: {
            tenantId,
            productId: m.productId,
            type: m.type,
            quantity: m.quantity,
            previousQty: m.previousQty,
            newQty: m.newQty,
            reason: m.reason,
            reference: m.reference,
            actor: m.actor,
          },
        });
      }

      this.logger.log('Inventory default data seeded successfully.');
    } catch (err: any) {
      this.logger.error(`Failed to seed inventory data: ${err.message}`, err.stack);
    }
  }
}
