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
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  private getTenant(headers: Record<string, string>) {
    return headers['x-tenant-id'] || 'default-tenant';
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() createCompanyDto: any,
  ) {
    return this.companiesService.create(
      this.getTenant(headers),
      createCompanyDto,
    );
  }

  @Get()
  findAll(@Headers() headers: Record<string, string>) {
    return this.companiesService.findAll(this.getTenant(headers));
  }

  @Get(':id')
  findOne(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.companiesService.findOne(this.getTenant(headers), id);
  }

  @Patch(':id')
  update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() updateCompanyDto: any,
  ) {
    return this.companiesService.update(
      this.getTenant(headers),
      id,
      updateCompanyDto,
    );
  }

  @Delete(':id')
  remove(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.companiesService.remove(this.getTenant(headers), id);
  }
}
