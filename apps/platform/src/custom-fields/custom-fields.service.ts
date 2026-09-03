import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomFieldsService {
  private static inMemoryCustomFields: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async create(customObjectId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.customField.create({
          data: {
            customObjectId,
            name: data.name,
            apiName: data.apiName,
            fieldType: data.fieldType,
            isRequired: data.isRequired || false,
            options: data.options || {}
          },
        });
      } catch {
        // fallback
      }
    }
    const newField = {
      id: `cfield_${Date.now()}`,
      customObjectId,
      name: data.name,
      apiName: data.apiName,
      fieldType: data.fieldType,
      isRequired: data.isRequired || false,
      options: data.options || {},
    };
    CustomFieldsService.inMemoryCustomFields.push(newField);
    return newField;
  }

  async findAll(customObjectId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.customField.findMany({
          where: { customObjectId }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return CustomFieldsService.inMemoryCustomFields.filter((f) => f.customObjectId === customObjectId);
  }

  async findOne(customObjectId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const field = await this.prisma.customField.findFirst({
          where: { id, customObjectId }
        });
        if (field) return field;
      } catch {
        // fallback
      }
    }
    const found = CustomFieldsService.inMemoryCustomFields.find(
      (f) => f.id === id && f.customObjectId === customObjectId
    );
    if (!found) throw new NotFoundException('Custom Field not found');
    return found;
  }

  async update(customObjectId: string, id: string, data: any) {
    const field = await this.findOne(customObjectId, id);
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.customField.update({
          where: { id: field.id },
          data,
        });
      } catch {
        // fallback
      }
    }
    Object.assign(field, data);
    return field;
  }

  async remove(customObjectId: string, id: string) {
    const field = await this.findOne(customObjectId, id);
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.customField.delete({
          where: { id: field.id },
        });
      } catch {
        // fallback
      }
    }
    const idx = CustomFieldsService.inMemoryCustomFields.findIndex((f) => f.id === field.id);
    if (idx !== -1) CustomFieldsService.inMemoryCustomFields.splice(idx, 1);
    return field;
  }
}
