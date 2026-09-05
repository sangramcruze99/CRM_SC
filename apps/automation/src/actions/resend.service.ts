import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  status: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  error?: string;
  to: string[];
  subject: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resendEndpoint = 'https://api.resend.com/emails';

  private get apiKey(): string {
    return (
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      ''
    );
  }

  private get defaultFrom(): string {
    return process.env.RESEND_FROM_EMAIL || 'Business OS <onboarding@resend.dev>';
  }

  /**
   * Dispatches a real email via the Resend API
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, html, text, from, replyTo } = options;
    const recipients = Array.isArray(to) ? to.map(t => t.trim()).filter(Boolean) : [to.trim()];
    const sender = from || this.defaultFrom;

    this.logger.log(`[ResendService] Dispatching email to ${recipients.join(', ')}: "${subject}"`);

    const key = this.apiKey;
    if (!key) {
      this.logger.warn('[ResendService] No RESEND_API_KEY configured. Returning simulated delivery.');
      return {
        success: true,
        status: 'SIMULATED',
        id: `sim_${Date.now()}`,
        to: recipients,
        subject,
      };
    }

    try {
      const payload: Record<string, any> = {
        from: sender,
        to: recipients,
        subject,
      };

      if (html) {
        payload.html = html;
      }
      if (text) {
        payload.text = text;
      }
      if (!html && !text) {
        payload.text = subject;
      }
      if (replyTo) {
        payload.reply_to = replyTo;
      }

      const res = await fetch(this.resendEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.message || `Resend API returned status ${res.status}`;
        this.logger.warn(`[ResendService] Delivery issue: ${errorMsg}`);
        return {
          success: false,
          status: 'FAILED',
          error: errorMsg,
          to: recipients,
          subject,
        };
      }

      this.logger.log(`[ResendService] Email successfully dispatched via Resend. ID: ${data.id}`);
      return {
        success: true,
        status: 'DELIVERED',
        id: data.id,
        to: recipients,
        subject,
      };
    } catch (err: any) {
      this.logger.error(`[ResendService] Network or execution error: ${err.message}`, err.stack);
      return {
        success: false,
        status: 'FAILED',
        error: err.message,
        to: recipients,
        subject,
      };
    }
  }
}
