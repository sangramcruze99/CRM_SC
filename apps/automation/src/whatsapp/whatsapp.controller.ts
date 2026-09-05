import { Controller, Get, Post, Body, Query, Headers, Res } from '@nestjs/common';
import { ConversationEngineService } from './conversation-engine.service';
import { WhatsAppCloudService } from './whatsapp-cloud.service';
import { TwilioWhatsAppService } from './twilio-whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly engine: ConversationEngineService,
    private readonly cloudService: WhatsAppCloudService,
    private readonly twilioService: TwilioWhatsAppService,
    private readonly prisma: PrismaService,
  ) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  /**
   * Meta Webhook Verification Endpoint (GET)
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: any,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'business_os_wa_secret';
    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification token mismatch');
  }

  /**
   * Inbound WhatsApp Webhook (POST from Cloud API or Twilio)
   */
  @Post('webhook')
  async handleInboundWebhook(
    @Body() payload: any,
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);

    // Try parsing as Meta Cloud API first, then Twilio
    let event = this.cloudService.parseInboundWebhook(payload);
    if (!event) {
      event = this.twilioService.parseInboundWebhook(payload);
    }

    if (event) {
      return this.engine.processInboundMessage(tenantId, event);
    }

    return { status: 'IGNORED_OR_ACK' };
  }

  /**
   * Outbound Message Dispatch
   */
  @Post('messages')
  sendMessage(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { to: string; message: string; contactId?: string },
  ) {
    return this.engine.sendOutboundMessage(this.getTenant(tenantIdHeader), body.to, body.message, body.contactId);
  }

  /**
   * Query Conversations
   */
  @Get('conversations')
  async getConversations(
    @Headers('x-tenant-id') tenantIdHeader: string,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.prisma.conversation.findMany({
      where: { tenantId, channel: 'WHATSAPP' },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Query Messages for a conversation
   */
  @Get('messages')
  async getMessages(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('conversationId') conversationId: string,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    if (!conversationId) {
      return [];
    }

    return this.prisma.conversationMessage.findMany({
      where: {
        conversationId,
        conversation: { tenantId },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
