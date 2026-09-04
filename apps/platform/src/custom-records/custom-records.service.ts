import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateData(tenantId: string, customObjectId: string, data: any) {
    const customObject = await this.prisma.customObject.findFirst({
      where: { id: customObjectId, tenantId },
      include: { fields: true }
    });
    
    if (!customObject) {
      throw new NotFoundException('Custom Object not found');
    }

    const validatedData: any = {};
    const inputData = data.data || {};

    for (const field of customObject.fields) {
      const value = inputData[field.apiName];
      
      // Required check
      if (field.isRequired && (value === undefined || value === null || value === '')) {
        if (field.defaultValue) {
          validatedData[field.apiName] = field.defaultValue;
        } else {
          throw new BadRequestException(`Field ${field.name} (${field.apiName}) is required`);
        }
      } else if (value !== undefined) {
        // Basic type validation (could be expanded)
        if (field.fieldType === 'NUMBER' && isNaN(Number(value))) {
          throw new BadRequestException(`Field ${field.name} must be a number`);
        } else if (field.fieldType === 'SELECT') {
          const options = field.options as any;
          if (options?.choices && !options.choices.includes(value)) {
            throw new BadRequestException(`Field ${field.name} must be one of: ${options.choices.join(', ')}`);
          }
        } else if (field.fieldType === 'RELATION') {
          const options = field.options as any;
          if (options?.targetObjectId) {
            // Verify the related record exists
            const relatedRecord = await this.prisma.customRecord.findFirst({
              where: { id: value, customObjectId: options.targetObjectId, tenantId }
            });
            if (!relatedRecord) {
              throw new BadRequestException(`Invalid reference for ${field.name}: Record not found`);
            }
          }
        }
        validatedData[field.apiName] = value;
      }
    }
    
    // Allow any extra fields? In strict mode we might strip them. For now we will allow them but ensure we validated the known ones.
    return { ...inputData, ...validatedData };
  }

  async create(tenantId: string, customObjectId: string, data: any) {
    const validatedData = await this.validateData(tenantId, customObjectId, data);
    
    return this.prisma.customRecord.create({
      data: {
        tenantId,
        customObjectId,
        data: validatedData
      },
    });
  }

  async findAll(tenantId: string, customObjectId: string) {
    return this.prisma.customRecord.findMany({
      where: { tenantId, customObjectId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(tenantId: string, customObjectId: string, id: string) {
    const record = await this.prisma.customRecord.findFirst({
      where: { id, tenantId, customObjectId }
    });
    if (!record) throw new NotFoundException('Custom Record not found');
    return record;
  }

  async update(tenantId: string, customObjectId: string, id: string, data: any) {
    const record = await this.findOne(tenantId, customObjectId, id);
    
    // Merge new data with existing JSON data
    const existingData = typeof record.data === 'string' ? JSON.parse(record.data) : ((record.data as unknown as object) || {});
    const incomingData = typeof data.data === 'object' && data.data !== null ? data.data : {};
    const mergedData = { data: { ...existingData, ...incomingData } };
    const validatedData = await this.validateData(tenantId, customObjectId, mergedData);

    return this.prisma.customRecord.update({
      where: { id: record.id },
      data: {
        data: validatedData
      },
    });
  }

  async remove(tenantId: string, customObjectId: string, id: string) {
    const record = await this.findOne(tenantId, customObjectId, id);
    return this.prisma.customRecord.delete({
      where: { id: record.id },
    });
  }
}
