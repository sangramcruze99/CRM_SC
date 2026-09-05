import { Controller, Post, Body, Headers } from '@nestjs/common';
import { VoiceAgentService, VoiceCallTurnRequest } from './voice-agent.service';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceAgentService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Post('call/start')
  startCall(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { phone: string; direction?: 'INBOUND' | 'OUTBOUND' },
  ) {
    return this.voiceService.startCall(this.getTenant(tenantIdHeader), body.phone, body.direction || 'OUTBOUND');
  }

  @Post('call/turn')
  processTurn(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: VoiceCallTurnRequest,
  ) {
    return this.voiceService.processTurn(this.getTenant(tenantIdHeader), body);
  }

  @Post('call/complete')
  completeCall(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { callId: string; disposition?: string },
  ) {
    return this.voiceService.completeCall(this.getTenant(tenantIdHeader), body.callId, body.disposition);
  }
}
