import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppCloudService } from './whatsapp-cloud.service';
import { TwilioWhatsAppService } from './twilio-whatsapp.service';
import { IWhatsAppProvider, InboundMessageEvent } from './whatsapp-provider.interface';
import { BusinessEventBusService } from '../event-bus/business-event-bus.service';

@Injectable()
export class ConversationEngineService {
  private readonly logger = new Logger(ConversationEngineService.name);
  private activeProvider: IWhatsAppProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudService: WhatsAppCloudService,
    private readonly twilioService: TwilioWhatsAppService,
    private readonly eventBus: BusinessEventBusService,
  ) {
    // Default to WhatsApp Cloud API if configured or fallback to Twilio
    this.activeProvider = process.env.WHATSAPP_ACCESS_TOKEN ? this.cloudService : this.twilioService;
  }

  setProvider(providerName: 'CLOUD' | 'TWILIO') {
    this.activeProvider = providerName === 'CLOUD' ? this.cloudService : this.twilioService;
  }

  async processInboundMessage(tenantId: string, event: InboundMessageEvent) {
    this.logger.log(`Processing inbound WhatsApp from ${event.from}: "${event.text || event.type}"`);

    const rawPhone = event.from.replace(/[^\d+]/g, '');
    const incomingText = (event.text || '').trim();

    // 1. Opt-out / Opt-in compliance keywords
    const lower = incomingText.toLowerCase();
    if (['stop', 'unsubscribe', 'cancel', 'halt'].includes(lower)) {
      this.logger.warn(`User ${rawPhone} requested opt-out.`);
      await this.activeProvider.sendTextMessage(rawPhone, 'You have successfully opted out of messages. Reply START to resubscribe.');
      return { status: 'OPTED_OUT' };
    }

    // 2. Find or match CRM Contact
    let contact = await this.prisma.contact.findFirst({
      where: {
        tenantId,
        OR: [{ phone: rawPhone }, { phone: event.from }],
      },
    });

    if (!contact) {
      // Auto-create lead/contact
      const nameParts = (event.senderName || 'WhatsApp Contact').split(' ');
      contact = await this.prisma.contact.create({
        data: {
          tenantId,
          firstName: nameParts[0] || 'WhatsApp',
          lastName: nameParts.slice(1).join(' ') || 'Prospect',
          phone: rawPhone,
          customData: JSON.stringify({ source: 'WhatsApp Inbound', firstContact: new Date().toISOString() }),
        },
      });

      // Publish new lead event
      await this.eventBus.publish({
        tenantId,
        type: 'LEAD_CREATED',
        payload: {
          contactId: contact.id,
          phone: rawPhone,
          name: `${contact.firstName} ${contact.lastName}`,
          source: 'WhatsApp',
        },
      });
    }

    // 3. Find or create active Conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        tenantId,
        channel: 'WHATSAPP',
        contactId: contact.id,
        status: { in: ['OPEN', 'BOT_ACTIVE', 'WAITING_REPRESENTATIVE'] },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          tenantId,
          channel: 'WHATSAPP',
          contactId: contact.id,
          externalChatId: rawPhone,
          title: `WhatsApp with ${contact.firstName} ${contact.lastName}`,
          status: 'BOT_ACTIVE',
        },
      });
    }

    // 4. Save Inbound Message
    await this.prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'CONTACT',
        senderId: contact.id,
        content: incomingText || `[${event.type}]`,
        contentType: event.type === 'text' ? 'TEXT' : 'DOCUMENT',
        mediaUrl: event.mediaUrl,
        deliveryStatus: 'DELIVERED',
        externalMessageId: event.messageId,
      },
    });

    // 5. Sentiment & Escalation Evaluation
    const isFrustrated = /angry|terrible|horrible|cancel|fraud|scam|lawyer|sue|broken|complaint/i.test(incomingText);
    if (isFrustrated) {
      this.logger.warn(`Frustrated sentiment detected on WhatsApp conversation ${conversation.id}! Escalating to human.`);
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'WAITING_REPRESENTATIVE' },
      });

      // Alert Support & Post Activity
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'SYSTEM',
          title: '🔥 WhatsApp Sentiment Alert: Urgent Human Escalation',
          content: `Customer: ${contact.firstName} ${contact.lastName} (${rawPhone})\nMessage: "${incomingText}"\nStatus: Bot suspended, waiting human takeover.`,
          contactId: contact.id,
        },
      });

      await this.activeProvider.sendTextMessage(
        rawPhone,
        `Thank you for your message. I have escalated this directly to an account executive who will message you here promptly.`,
      );

      return { status: 'ESCALATED_TO_HUMAN', conversationId: conversation.id };
    }

    // 6. Automated AI Conversational Response & Tool Execution
    const isPricingInquiry = /price|pricing|cost|quote|package|plan/i.test(incomingText);
    const isBookingInquiry = /demo|meeting|appointment|call|schedule|time/i.test(incomingText);

    let replyText = '';
    if (isBookingInquiry) {
      replyText = `Hi ${contact.firstName}! I'd love to get you on the schedule for a 15-minute architecture demo. Please let me know if tomorrow at 10:00 AM or 2:00 PM EST works best for you!`;
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'MEETING',
          title: 'Demo Requested via WhatsApp',
          content: `Inbound request: "${incomingText}"`,
          contactId: contact.id,
        },
      });
    } else if (isPricingInquiry) {
      replyText = `Hi ${contact.firstName}, our Business OS plans scale from Single-Tenant Professional ($499/mo) to Global Enterprise with custom AI workflows. Would you like me to send the full CPQ tier comparison?`;
    } else {
      replyText = `Hello ${contact.firstName}! Thanks for reaching out to Business OS. How can we help streamline your sales, support, or operations today?`;
    }

    // Send AI reply
    const sendResult = await this.activeProvider.sendTextMessage(rawPhone, replyText);

    // Record outbound bot response
    await this.prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'AI_AGENT',
        content: replyText,
        contentType: 'TEXT',
        deliveryStatus: sendResult.success ? 'SENT' : 'FAILED',
        externalMessageId: sendResult.messageId,
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return { status: 'REPLIED', conversationId: conversation.id, reply: replyText };
  }

  async sendOutboundMessage(tenantId: string, to: string, text: string, contactId?: string) {
    const res = await this.activeProvider.sendTextMessage(to, text);

    if (contactId) {
      const conv = await this.prisma.conversation.findFirst({
        where: { tenantId, contactId, channel: 'WHATSAPP' },
      });

      if (conv) {
        await this.prisma.conversationMessage.create({
          data: {
            conversationId: conv.id,
            senderType: 'USER',
            content: text,
            deliveryStatus: res.success ? 'SENT' : 'FAILED',
            externalMessageId: res.messageId,
          },
        });
      }
    }

    return res;
  }
}
