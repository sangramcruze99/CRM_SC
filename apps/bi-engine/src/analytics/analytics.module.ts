import { Module } from '@nestjs/common';
import { ComparisonEngine } from './comparison.engine';
import { AnomalyDetector } from './anomaly.detector';
import { SummaryGenerator } from './summary.generator';

@Module({
  providers: [
    { provide: 'ComparisonEngine', useValue: ComparisonEngine },
    { provide: 'AnomalyDetector', useValue: AnomalyDetector },
    { provide: 'SummaryGenerator', useValue: SummaryGenerator },
  ],
  exports: ['ComparisonEngine', 'AnomalyDetector', 'SummaryGenerator'],
})
export class AnalyticsModule {}
