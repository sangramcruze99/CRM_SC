import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  private getTenant(headers: Record<string, string>) {
    return headers['x-tenant-id'] || 'default-tenant';
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() createDealDto: any,
  ) {
    return this.dealsService.create(this.getTenant(headers), createDealDto);
  }

  @Get()
  findAll(@Headers() headers: Record<string, string>) {
    return this.dealsService.findAll(this.getTenant(headers));
  }

  @Get(':id')
  findOne(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.dealsService.findOne(this.getTenant(headers), id);
  }

  @Patch(':id')
  update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() updateDealDto: any,
  ) {
    return this.dealsService.update(this.getTenant(headers), id, updateDealDto);
  }

  @Delete(':id')
  remove(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.dealsService.remove(this.getTenant(headers), id);
  }
}
