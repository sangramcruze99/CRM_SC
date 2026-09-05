export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface InboundMessageEvent {
  from: string;
  senderName?: string;
  messageId: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'button' | 'unknown';
  text?: string;
  mediaUrl?: string;
  rawPayload: any;
}

export interface IWhatsAppProvider {
  name: string;
  sendTextMessage(to: string, text: string): Promise<SendMessageResult>;
  sendTemplateMessage(to: string, templateName: string, languageCode: string, components?: any[]): Promise<SendMessageResult>;
  sendMediaMessage(to: string, mediaUrl: string, caption?: string, mediaType?: string): Promise<SendMessageResult>;
  parseInboundWebhook(payload: any): InboundMessageEvent | null;
}
