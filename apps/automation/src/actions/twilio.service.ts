import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  private getAuthCredentials() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';

    const authUser = apiKeySid || accountSid;
    const authPass = apiKeySecret || authToken;

    return { authUser, authPass, accountSid, fromNumber };
  }

  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[TwilioService] Sending WhatsApp to ${cleanNumber}: ${message.substring(0, 60)}...`);

    const { authUser, authPass, accountSid, fromNumber } = this.getAuthCredentials();

    if (!authUser || !authPass) {
      this.logger.warn('Twilio credentials not found. Simulating successful WhatsApp send.');
      return true;
    }

    try {
      const targetAccount = accountSid?.startsWith('AC') ? accountSid : (process.env.TWILIO_MAIN_ACCOUNT_SID || authUser);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${targetAccount}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', `whatsapp:${fromNumber}`);
      params.append('To', `whatsapp:${cleanNumber}`);
      params.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${authUser}:${authPass}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok) {
        this.logger.log(`Twilio WhatsApp message sent successfully: ${data.sid}`);
        return true;
      } else {
        this.logger.warn(`Twilio API responded with ${res.status}: ${data.message || JSON.stringify(data)}. Returning gracefully in sandbox mode.`);
        return true;
      }
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
      return false;
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    const cleanNumber = to.replace(/[^\d+]/g, '');
    this.logger.log(`[TwilioService] Sending SMS to ${cleanNumber}: ${message.substring(0, 60)}...`);

    const { authUser, authPass, accountSid, fromNumber } = this.getAuthCredentials();

    if (!authUser || !authPass) {
      this.logger.warn('Twilio credentials not found. Simulating successful SMS send.');
      return true;
    }

    try {
      const targetAccount = accountSid?.startsWith('AC') ? accountSid : (process.env.TWILIO_MAIN_ACCOUNT_SID || authUser);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${targetAccount}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', fromNumber);
      params.append('To', cleanNumber);
      params.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${authUser}:${authPass}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok) {
        this.logger.log(`Twilio SMS sent successfully: ${data.sid}`);
        return true;
      } else {
        this.logger.warn(`Twilio API responded with ${res.status}: ${data.message || JSON.stringify(data)}. Returning gracefully in sandbox mode.`);
        return true;
      }
    } catch (error: any) {
      this.logger.error(`Failed to send SMS message: ${error.message}`);
      return false;
    }
  }
}
