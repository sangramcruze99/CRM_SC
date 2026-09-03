import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomObjectsService {
  private static inMemoryCustomObjects: any[] = [
    {
      id: 'cobj_properties',
      tenantId: 'default-tenant',
      name: 'Property',
      pluralName: 'Properties',
      apiName: 'property',
      description: 'Real Estate Listings & Assets',
      icon: 'Building2',
      fields: [
        { id: 'fld_1', name: 'Price', apiName: 'price', fieldType: 'NUMBER', isRequired: true },
        { id: 'fld_2', name: 'Location', apiName: 'location', fieldType: 'TEXT', isRequired: false },
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  async seedDemoData(tenantId: string) {
    return CustomObjectsService.inMemoryCustomObjects;
  }

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const customObject = await tx.customObject.create({
            data: {
              tenantId,
              name: data.name,
              pluralName: data.pluralName,
              apiName: data.apiName,
              description: data.description,
              icon: data.icon,
            },
          });

          if (data.fields && Array.isArray(data.fields)) {
            for (const field of data.fields) {
              await tx.customField.create({
                data: {
                  customObjectId: customObject.id,
                  name: field.name,
                  apiName: field.apiName,
                  fieldType: field.fieldType,
                  isRequired: field.isRequired || false,
                  options: field.options || null,
                  defaultValue: field.defaultValue || null,
                  isUnique: field.isUnique || false,
                  isSearchable: field.isSearchable || false,
                  validationRules: field.validationRules || null,
                },
              });
            }
          }

          return customObject;
        });
      } catch {
        // fallback to memory
      }
    }

    const newObj = {
      id: `cobj_${Date.now()}`,
      tenantId,
      name: data.name,
      pluralName: data.pluralName || data.name,
      apiName: data.apiName,
      description: data.description,
      icon: data.icon || 'Box',
      fields: data.fields || [],
      records: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    CustomObjectsService.inMemoryCustomObjects.unshift(newObj);
    return newObj;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.customObject.findMany({
          where: { tenantId },
          include: { fields: true },
          orderBy: { name: 'asc' }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return CustomObjectsService.inMemoryCustomObjects.filter(
      (o) => o.tenantId === tenantId || o.tenantId === 'default-tenant'
    );
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const object = await this.prisma.customObject.findFirst({
          where: { id, tenantId },
          include: { fields: true }
        });
        if (object) return object;
      } catch {
        // fallback
      }
    }
    const found = CustomObjectsService.inMemoryCustomObjects.find(
      (o) => o.id === id && (o.tenantId === tenantId || o.tenantId === 'default-tenant')
    );
    if (!found) throw new NotFoundException('Custom Object not found');
    return found;
  }

  async update(tenantId: string, id: string, data: any) {
    const object = await this.findOne(tenantId, id);
    
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customObject.update({
        where: { id: object.id },
        data: {
          name: data.name,
          pluralName: data.pluralName,
          description: data.description,
          icon: data.icon,
        },
      });

      // Handle fields update if provided
      if (data.fields && Array.isArray(data.fields)) {
        // Simplified for this scope: in a real app we'd do a complex diff (upsert/delete)
        // Here we'll just allow adding new fields for now, or updating existing
        for (const field of data.fields) {
          if (field.id) {
            await tx.customField.update({
              where: { id: field.id },
              data: {
                name: field.name,
                isRequired: field.isRequired,
                options: field.options,
                defaultValue: field.defaultValue,
                isUnique: field.isUnique,
                isSearchable: field.isSearchable,
                validationRules: field.validationRules,
              }
            });
          } else {
            await tx.customField.create({
              data: {
                customObjectId: object.id,
                name: field.name,
                apiName: field.apiName,
                fieldType: field.fieldType,
                isRequired: field.isRequired || false,
                options: field.options || null,
                defaultValue: field.defaultValue || null,
                isUnique: field.isUnique || false,
                isSearchable: field.isSearchable || false,
                validationRules: field.validationRules || null,
              }
            });
          }
        }
      }
      return updated;
    });
  }

  async remove(tenantId: string, id: string) {
    const object = await this.findOne(tenantId, id);
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.customObject.delete({
          where: { id: object.id },
        });
      } catch {
        // fallback
      }
    }
    const idx = CustomObjectsService.inMemoryCustomObjects.findIndex(o => o.id === object.id);
    if (idx !== -1) CustomObjectsService.inMemoryCustomObjects.splice(idx, 1);
    return object;
  }
}
