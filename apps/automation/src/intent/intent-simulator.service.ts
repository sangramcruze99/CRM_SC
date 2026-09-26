// apps/automation/src/intent/intent-simulator.service.ts
// Interactive Intent Simulator: Runs test simulation on StructuredIntent with mock inputs

import { Injectable, Logger } from '@nestjs/common';
import { StructuredIntent } from './intent-parser.service';

export interface SimulationStep {
  stepNumber: number;
  phase: 'TRIGGER' | 'AI_EVALUATION' | 'CONDITION_CHECK' | 'HUMAN_APPROVAL' | 'ACTION_EXECUTION' | 'RESULT_DELIVERY';
  title: string;
  detail: string;
  outcome: 'PASSED' | 'FAILED' | 'BRANCHED' | 'ESCALATED' | 'COMPLETED';
  evidence?: string[];
  metrics?: Record<string, any>;
}

export interface SimulationResult {
  intentName: string;
  domain: string;
  overallStatus: 'SUCCESS_APPROVED' | 'SUCCESS_AUTO' | 'REJECTED_CRITERIA' | 'ESCALATED_HUMAN';
  finalSummary: string;
  steps: SimulationStep[];
  outputData: Record<string, any>;
}

@Injectable()
export class IntentSimulatorService {
  private readonly logger = new Logger(IntentSimulatorService.name);

  /**
   * Simulate execution of intent against mock input data
   */
  async simulate(intent: StructuredIntent, mockInput: Record<string, any>): Promise<SimulationResult> {
    this.logger.log(`[IntentSimulator] Simulating intent "${intent.name}" for domain ${intent.domain}`);

    const steps: SimulationStep[] = [];
    let stepCount = 1;
    let overallStatus: SimulationResult['overallStatus'] = 'SUCCESS_AUTO';
    const outputData: Record<string, any> = { ...mockInput };

    // Step 1: Trigger Received
    steps.push({
      stepNumber: stepCount++,
      phase: 'TRIGGER',
      title: intent.trigger.description || 'Trigger Event Received',
      detail: `Input payload received with ${Object.keys(mockInput).length} fields`,
      outcome: 'PASSED',
      metrics: { timestamp: new Date().toISOString() },
    });

    // Step 2: AI / Domain Evaluation & Rules
    switch (intent.domain) {
      case 'recruitment': {
        const cgpa = Number(mockInput.cgpa ?? 3.42);
        const exp = Number(mockInput.experienceYears ?? 3);
        const skillsCount = Array.isArray(mockInput.skills) ? mockInput.skills.length : 6;
        const targetSkillsCount = intent.ruleGroups[0]?.atLeastNRules?.[0]?.threshold || 5;
        const targetCgpa = Number(intent.ruleGroups[0]?.rules.find((r) => r.field.includes('cgpa'))?.value ?? 3.0);

        const meetsCgpa = cgpa >= targetCgpa;
        const meetsSkills = skillsCount >= targetSkillsCount;

        steps.push({
          stepNumber: stepCount++,
          phase: 'AI_EVALUATION',
          title: 'Resume & Criteria Evaluation',
          detail: `Evaluated: CGPA ${cgpa} vs ≥ ${targetCgpa}, ${skillsCount} skills vs at least ${targetSkillsCount}`,
          outcome: meetsCgpa && meetsSkills ? 'PASSED' : 'FAILED',
          evidence: [
            `Academic: CGPA ${cgpa} (${meetsCgpa ? 'Meets threshold' : 'Below requirement'})`,
            `Experience: ${exp} years verified relevant background`,
            `Skills: ${skillsCount} matching items (${meetsSkills ? 'Threshold met' : 'Insufficient'})`,
          ],
        });

        if (intent.approvalPolicy?.required) {
          steps.push({
            stepNumber: stepCount++,
            phase: 'HUMAN_APPROVAL',
            title: 'Recruiter Review Gateway',
            detail: meetsCgpa && meetsSkills
              ? 'Candidate marked for recruiter sign-off before interview invite'
              : 'Candidate does not meet core requirements; routed for audit review',
            outcome: meetsCgpa && meetsSkills ? 'BRANCHED' : 'FAILED',
          });
          overallStatus = meetsCgpa && meetsSkills ? 'SUCCESS_APPROVED' : 'REJECTED_CRITERIA';
        }
        break;
      }

      case 'finance': {
        const amount = Number(mockInput.amount ?? 7500);
        const threshold = intent.approvalPolicy?.thresholdAmount || 5000;
        const requiresApproval = amount > threshold;

        steps.push({
          stepNumber: stepCount++,
          phase: 'AI_EVALUATION',
          title: 'Invoice OCR & Amount Verification',
          detail: `Invoice Total: $${amount.toLocaleString()} (Threshold: $${threshold.toLocaleString()})`,
          outcome: 'PASSED',
          evidence: [`Vendor: ${mockInput.vendor || 'Global SaaS Corp'}`, `Due Date: ${mockInput.dueDate || '2026-10-15'}`],
        });

        if (requiresApproval) {
          steps.push({
            stepNumber: stepCount++,
            phase: 'HUMAN_APPROVAL',
            title: 'Finance Manager Approval Threshold',
            detail: `Amount of $${amount.toLocaleString()} exceeds threshold of $${threshold.toLocaleString()}; approval card dispatched to Manager`,
            outcome: 'BRANCHED',
          });
          overallStatus = 'SUCCESS_APPROVED';
        } else {
          overallStatus = 'SUCCESS_AUTO';
        }
        break;
      }

      case 'front_desk': {
        const wantsHuman = Boolean(mockInput.wantsHuman);
        const isComplex = String(mockInput.complexity || '').toLowerCase() === 'complex';

        steps.push({
          stepNumber: stepCount++,
          phase: 'AI_EVALUATION',
          title: 'Voice Inquiry Intent Analysis',
          detail: `Caller request analyzed. Wants human: ${wantsHuman}, Complexity: ${isComplex ? 'Complex' : 'Routine'}`,
          outcome: 'PASSED',
        });

        if (wantsHuman || isComplex) {
          steps.push({
            stepNumber: stepCount++,
            phase: 'HUMAN_APPROVAL',
            title: 'Human Staff Handoff Triggered',
            detail: 'Caller warm-transferred to duty officer phone (+1-555-0199)',
            outcome: 'ESCALATED',
          });
          overallStatus = 'ESCALATED_HUMAN';
        } else {
          overallStatus = 'SUCCESS_AUTO';
        }
        break;
      }

      case 'support': {
        const sentiment = String(mockInput.sentiment || 'frustrated').toLowerCase();
        const confidence = String(mockInput.confidence || 'unclear').toLowerCase();
        const isFrustrated = sentiment === 'frustrated' || sentiment === 'angry';
        const isUnsure = confidence === 'unclear' || confidence === 'low';

        steps.push({
          stepNumber: stepCount++,
          phase: 'AI_EVALUATION',
          title: 'Customer Sentiment & AI Confidence Check',
          detail: `Sentiment: "${sentiment}", AI Confidence: "${confidence}"`,
          outcome: isFrustrated || isUnsure ? 'FAILED' : 'PASSED',
        });

        if (isFrustrated || isUnsure) {
          steps.push({
            stepNumber: stepCount++,
            phase: 'HUMAN_APPROVAL',
            title: 'Emergency Live Agent Escalation',
            detail: 'Ticket priority elevated to URGENT; routed to tier-2 human queue',
            outcome: 'ESCALATED',
          });
          overallStatus = 'ESCALATED_HUMAN';
        } else {
          overallStatus = 'SUCCESS_AUTO';
        }
        break;
      }

      default: {
        steps.push({
          stepNumber: stepCount++,
          phase: 'AI_EVALUATION',
          title: 'Business Rule Evaluation',
          detail: 'Simulated business rule checks passed successfully',
          outcome: 'PASSED',
        });
        overallStatus = 'SUCCESS_AUTO';
        break;
      }
    }

    // Step Final: Destination Delivery
    steps.push({
      stepNumber: stepCount++,
      phase: 'RESULT_DELIVERY',
      title: `Result Recorded in ${intent.resultDestination.name}`,
      detail: intent.resultDestination.summary,
      outcome: 'COMPLETED',
    });

    return {
      intentName: intent.name,
      domain: intent.domain,
      overallStatus,
      finalSummary: `Simulation executed with status: ${overallStatus}. Result directed to ${intent.resultDestination.name}.`,
      steps,
      outputData,
    };
  }
}
