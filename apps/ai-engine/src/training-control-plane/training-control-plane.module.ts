import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Registry
import { AgentRegistryService } from './registry/agent-registry.service';
import { AgentRegistryController } from './registry/agent-registry.controller';

// Datasets
import { DatasetPipelineService } from './datasets/dataset-pipeline.service';
import { DatasetPipelineController } from './datasets/dataset-pipeline.controller';

// Evaluation
import { EvaluationEngineService } from './evaluation/evaluation-engine.service';
import { EvaluationEngineController } from './evaluation/evaluation-engine.controller';

// Models & Gates
import { ModelRegistryService } from './models/model-registry.service';
import { ModelRegistryController } from './models/model-registry.controller';

// Feedback
import { AgentFeedbackService } from './feedback/agent-feedback.service';
import { AgentFeedbackController } from './feedback/agent-feedback.controller';

// Experiments
import { ExperimentTrackerService } from './experiments/experiment-tracker.service';
import { ExperimentTrackerController } from './experiments/experiment-tracker.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AgentRegistryController,
    DatasetPipelineController,
    EvaluationEngineController,
    ModelRegistryController,
    AgentFeedbackController,
    ExperimentTrackerController,
  ],
  providers: [
    AgentRegistryService,
    DatasetPipelineService,
    EvaluationEngineService,
    ModelRegistryService,
    AgentFeedbackService,
    ExperimentTrackerService,
  ],
  exports: [
    AgentRegistryService,
    DatasetPipelineService,
    EvaluationEngineService,
    ModelRegistryService,
    AgentFeedbackService,
    ExperimentTrackerService,
  ],
})
export class TrainingControlPlaneModule {}
