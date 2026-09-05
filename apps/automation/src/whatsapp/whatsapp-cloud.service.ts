import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider, InboundMessageEvent, SendMessageResult } from './whatsapp-provider.interface';

@Injectable()
export class WhatsAppCloudService implements IWhatsAppProvider {
  readonly name = 'WHATSAPP_CLOUD_API';
  private readonly logger = new Logger(WhatsAppCloudService.name);

  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '109823485729103';
  private readonly accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

  async sendTextMessage(to: string, text: string): Promise<SendMessageResult> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[WhatsApp Cloud API] Dispatching text to ${cleanNumber}: ${text.substring(0, 50)}...`);

    if (!this.accessToken) {
      this.logger.warn(`[WhatsApp Cloud API] WHATSAPP_ACCESS_TOKEN not configured. Operating in simulated mode.`);
      return {
        success: true,
        messageId: `wamid_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanNumber,
          type: 'text',
          text: { preview_url: false, body: text },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Meta API returned error');
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp Cloud message: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', components?: any[]): Promise<SendMessageResult> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[WhatsApp Cloud API] Sending template ${templateName} to ${cleanNumber}`);

    if (!this.accessToken) {
      return {
        success: true,
        messageId: `wamid_tmpl_sim_${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanNumber,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components || [],
          },
        }),
      });

      const data = await res.json();
      return {
        success: res.ok,
        messageId: data.messages?.[0]?.id,
        error: !res.ok ? data?.error?.message : undefined,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async sendMediaMessage(to: string, mediaUrl: string, caption?: string, mediaType: string = 'document'): Promise<SendMessageResult> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[WhatsApp Cloud API] Sending media (${mediaType}) to ${cleanNumber}`);

    if (!this.accessToken) {
      return {
        success: true,
        messageId: `wamid_media_sim_${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanNumber,
          type: mediaType,
          [mediaType]: { link: mediaUrl, caption },
        }),
      });

      const data = await res.json();
      return {
        success: res.ok,
        messageId: data.messages?.[0]?.id,
        error: !res.ok ? data?.error?.message : undefined,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  parseInboundWebhook(payload: any): InboundMessageEvent | null {
    try {
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (!message) return null;

      const from = message.from;
      const senderName = change?.contacts?.[0]?.profile?.name;
      const messageId = message.id;
      const timestamp = message.timestamp ? new Date(parseInt(message.timestamp, 10) * 1000).toISOString() : new Date().toISOString();

      let type: InboundMessageEvent['type'] = 'unknown';
      let text: string | undefined;
      let mediaUrl: string | undefined;

      if (message.type === 'text') {
        type = 'text';
        text = message.text?.body;
      } else if (message.type === 'interactive' && message.interactive?.button_reply) {
        type = 'button';
        text = message.interactive.button_reply.title || message.interactive.button_reply.id;
      } else if (message.type === 'image') {
        type = 'image';
        mediaUrl = message.image?.id;
      } else if (message.type === 'document') {
        type = 'document';
        mediaUrl = message.document?.id;
      }

      return {
        from,
        senderName,
        messageId,
        timestamp,
        type,
        text,
        mediaUrl,
        rawPayload: payload,
      };
    } catch (err) {
      this.logger.warn(`Failed to parse WhatsApp Cloud webhook payload`);
      return null;
    }
  }
}
