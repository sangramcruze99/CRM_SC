import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VoiceCallTurnRequest {
  callId: string;
  speaker: 'USER' | 'AGENT';
  transcriptText: string;
  contactPhone?: string;
}

@Injectable()
export class VoiceAgentService {
  private readonly logger = new Logger(VoiceAgentService.name);

  // Active call memory cache
  private activeCalls = new Map<string, {
    callId: string;
    tenantId: string;
    contactId?: string;
    phone: string;
    transcript: Array<{ speaker: string; text: string; time: string }>;
    startedAt: string;
  }>();

  constructor(private readonly prisma: PrismaService) {}

  async startCall(tenantId: string, phone: string, direction: 'INBOUND' | 'OUTBOUND') {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.logger.log(`Starting ${direction} Voice Agent Call [${callId}] for ${phone}`);

    let contact = await this.prisma.contact.findFirst({
      where: { tenantId, phone },
    });

    this.activeCalls.set(callId, {
      callId,
      tenantId,
      contactId: contact?.id,
      phone,
      transcript: [
        {
          speaker: 'AGENT',
          text: `Hello! Thank you for contacting Business OS. My name is Maya, your AI executive assistant. How may I direct or assist you today?`,
          time: '00:01',
        },
      ],
      startedAt: new Date().toISOString(),
    });

    return {
      callId,
      greeting: `Hello! Thank you for contacting Business OS. My name is Maya, your AI executive assistant. How may I direct or assist you today?`,
      contact: contact ? { id: contact.id, name: `${contact.firstName} ${contact.lastName}` } : null,
    };
  }

  async processTurn(tenantId: string, req: VoiceCallTurnRequest) {
    const call = this.activeCalls.get(req.callId);
    const userText = req.transcriptText.trim();
    this.logger.log(`Voice Turn for Call ${req.callId}: "${userText}"`);

    const turnTime = '00:' + String(Math.floor((Date.now() - new Date(call?.startedAt || Date.now()).getTime()) / 1000)).padStart(2, '0');

    if (call) {
      call.transcript.push({ speaker: 'USER', text: userText, time: turnTime });
    }

    // Evaluate live conversational response and identify tool needs
    let agentReply = '';
    let toolInvoked: string | null = null;
    let toolResult: any = null;

    if (/pricing|cost|subscription|plans/i.test(userText)) {
      toolInvoked = 'CRM_LOOKUP_PLANS';
      toolResult = { professional: '$499/mo', enterprise: '$1,299/mo' };
      agentReply = 'Our Business OS plans start at $499 per month for the full suite including CRM, AI agent pipelines, and automated accounting. Would you like me to send a proposal directly to your email?';
    } else if (/book|schedule|demo|appointment|meeting/i.test(userText)) {
      toolInvoked = 'CALENDAR_CHECK_AVAILABILITY';
      toolResult = { nextSlot: 'Tomorrow at 10:00 AM EST' };
      agentReply = 'I have an opening with an enterprise solutions architect tomorrow at 10:00 AM Eastern. Shall I lock that in for you?';
    } else if (/ticket|support|issue|broken|help/i.test(userText)) {
      toolInvoked = 'HELPDESK_CREATE_TICKET';
      toolResult = { ticketId: `tkt_${Date.now()}` };
      agentReply = 'I have logged a priority support ticket with our engineering on-call. Your ticket ID is ' + toolResult.ticketId + '. You will receive an SMS update in minutes.';
    } else {
      agentReply = 'Understood. I can coordinate with our account team or guide you through your workspace configurations. Could you tell me a bit more about your company?';
    }

    if (call) {
      call.transcript.push({ speaker: 'AGENT', text: agentReply, time: turnTime });
    }

    return {
      callId: req.callId,
      agentReply,
      toolInvoked,
      toolResult,
      transcript: call?.transcript || [],
    };
  }

  async completeCall(tenantId: string, callId: string, disposition: string = 'QUALIFIED_DEMO_REQUESTED') {
    const call = this.activeCalls.get(callId);
    this.logger.log(`Completing voice call ${callId} with disposition: ${disposition}`);

    const transcriptLines = call?.transcript.map((t) => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n') || 'Call completed.';
    const sentiment = /angry|terrible|frustrated/i.test(transcriptLines) ? 'AT_RISK' : 'POSITIVE';

    // Auto-record to CRM Activity Timeline
    const activity = await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'CALL',
        title: `AI Voice Call Completed (${sentiment})`,
        content: `Phone: ${call?.phone || 'Unknown'}\nDisposition: ${disposition}\nSentiment: ${sentiment}\n\nTranscript:\n${transcriptLines}`,
        contactId: call?.contactId || null,
      },
    });

    this.activeCalls.delete(callId);

    return {
      success: true,
      callId,
      disposition,
      sentiment,
      activityId: activity.id,
    };
  }
}
