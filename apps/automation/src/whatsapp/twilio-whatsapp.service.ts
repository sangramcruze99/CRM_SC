import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider, InboundMessageEvent, SendMessageResult } from './whatsapp-provider.interface';

@Injectable()
export class TwilioWhatsAppService implements IWhatsAppProvider {
  readonly name = 'TWILIO_WHATSAPP';
  private readonly logger = new Logger(TwilioWhatsAppService.name);

  async sendTextMessage(to: string, text: string): Promise<SendMessageResult> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[Twilio WhatsApp] Sending to ${cleanNumber}: ${text.substring(0, 50)}...`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      this.logger.warn(`Twilio credentials not configured. Operating in simulated mode.`);
      return {
        success: true,
        messageId: `SM_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${fromNumber}`);
      params.append('To', `whatsapp:${cleanNumber}`);
      params.append('Body', text);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      return {
        success: res.ok,
        messageId: data?.sid,
        error: !res.ok ? data?.message : undefined,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', components?: any[]): Promise<SendMessageResult> {
    return this.sendTextMessage(to, `Template: ${templateName}`);
  }

  async sendMediaMessage(to: string, mediaUrl: string, caption?: string, mediaType?: string): Promise<SendMessageResult> {
    return this.sendTextMessage(to, `${caption || 'Media file'}: ${mediaUrl}`);
  }

  parseInboundWebhook(payload: any): InboundMessageEvent | null {
    if (!payload?.From || !payload?.Body) return null;

    const from = String(payload.From).replace('whatsapp:', '');
    return {
      from,
      senderName: payload.ProfileName || 'WhatsApp User',
      messageId: payload.MessageSid || `SM_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'text',
      text: payload.Body,
      rawPayload: payload,
    };
  }
}
