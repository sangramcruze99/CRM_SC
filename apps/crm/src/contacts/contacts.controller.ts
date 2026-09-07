import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  private getTenant(headers: any) {
    // In a real app, this comes from the JWT payload via a Guard
    return headers['x-tenant-id'] || 'default-tenant';
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() createContactDto: any,
  ) {
    return this.contactsService.create(
      this.getTenant(headers),
      createContactDto,
    );
  }

  @Get()
  findAll(@Headers() headers: Record<string, string>) {
    return this.contactsService.findAll(this.getTenant(headers));
  }

  @Get(':id')
  async findOne(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const contact = await this.contactsService.findOne(this.getTenant(headers), id);
    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    return contact;
  }

  @Patch(':id')
  update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() updateContactDto: any,
  ) {
    return this.contactsService.update(
      this.getTenant(headers),
      id,
      updateContactDto,
    );
  }

  @Delete(':id')
  remove(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.contactsService.remove(this.getTenant(headers), id);
  }
}
