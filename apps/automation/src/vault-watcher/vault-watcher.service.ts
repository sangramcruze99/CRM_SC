import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessEventBusService } from '../event-bus/business-event-bus.service';

export interface ProcessedItem {
  id: string;
  filename: string;
  folder: string;
  agentDispatched: string;
  recordsCount: number;
  timestamp: string;
  status: 'PROCESSED' | 'FAILED';
  details: string;
}

@Injectable()
export class VaultWatcherService implements OnModuleInit {
  private readonly logger = new Logger(VaultWatcherService.name);
  private vaultRoot: string;
  private readonly processedHistory: ProcessedItem[] = [];

  private readonly watchedFolders = [
    {
      id: 'crm_leads',
      relPath: 'inbound/crm_leads',
      agent: 'Ares (Revenue Lead Hunter)',
      eventType: 'CONTACT_CREATED' as const,
    },
    {
      id: 'invoices_scanned',
      relPath: 'documents/invoices_scanned',
      agent: 'Midas (FinOps Reconciliation)',
      eventType: 'INVOICE_CREATED' as const,
    },
    {
      id: 'contracts_incoming',
      relPath: 'documents/contracts_incoming',
      agent: 'Athena (Risk & Legal Sentinel)',
      eventType: 'DOCUMENT_UPLOADED' as const,
    },
    {
      id: 'quotes',
      relPath: 'inbound/quotes',
      agent: 'Hermes (Omnichannel Dispatcher)',
      eventType: 'DEAL_CREATED' as const,
    },
  ];

  constructor(private readonly eventBus: BusinessEventBusService) {
    // Resolve absolute path to vault root: E:\businessos\vault
    const candidatePaths = [
      path.resolve(process.cwd(), 'vault'),
      path.resolve(process.cwd(), '../../vault'),
      path.resolve('E:/businessos/vault'),
    ];

    this.vaultRoot = candidatePaths.find((p) => fs.existsSync(p)) || path.resolve(process.cwd(), 'vault');
  }

  onModuleInit() {
    this.ensureFoldersExist();
    this.logger.log(`Smart Vault Watcher active on root: ${this.vaultRoot}`);
  }

  private ensureFoldersExist() {
    try {
      if (!fs.existsSync(this.vaultRoot)) {
        fs.mkdirSync(this.vaultRoot, { recursive: true });
      }
      for (const folder of this.watchedFolders) {
        const fullPath = path.join(this.vaultRoot, folder.relPath);
        const processedPath = path.join(fullPath, '.processed');
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
        if (!fs.existsSync(processedPath)) fs.mkdirSync(processedPath, { recursive: true });
      }
    } catch (err: any) {
      this.logger.warn(`Could not initialize vault directories: ${err.message}`);
    }
  }

  @Interval(3000)
  async scanDropzones() {
    for (const config of this.watchedFolders) {
      const folderPath = path.join(this.vaultRoot, config.relPath);
      if (!fs.existsSync(folderPath)) continue;

      try {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          // Skip hidden directories, processed folder, and readme files
          if (file.startsWith('.') || file.endsWith('.txt') || file === 'README.md') continue;

          const filePath = path.join(folderPath, file);
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) continue;

          await this.processIncomingFile(config, filePath, file);
        }
      } catch (err: any) {
        this.logger.error(`Error scanning dropzone ${config.relPath}: ${err.message}`);
      }
    }
  }

  private async processIncomingFile(
    config: (typeof this.watchedFolders)[0],
    filePath: string,
    filename: string,
  ) {
    this.logger.log(`New inbound file detected in [${config.relPath}]: ${filename}`);
    const processedDir = path.join(path.dirname(filePath), '.processed');
    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let recordsCount = 1;
      let sampleEntityName = filename;
      let payload: Record<string, any> = { rawFile: filename, source: config.relPath };

      if (filename.endsWith('.json')) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          recordsCount = parsed.length;
          payload = { items: parsed };
          sampleEntityName = parsed[0]?.name || parsed[0]?.company || filename;
        } else {
          payload = parsed;
          sampleEntityName = parsed.name || parsed.company || parsed.invoiceNumber || filename;
        }
      } else if (filename.endsWith('.csv')) {
        const lines = content.split('\n').filter((l) => l.trim().length > 0);
        recordsCount = Math.max(1, lines.length - 1); // minus header
        const firstRow = lines[1]?.split(',') || [];
        sampleEntityName = firstRow[0]?.replace(/"/g, '') || filename;
        payload = { rowCount: recordsCount, sampleRecord: firstRow, rawPreview: lines.slice(0, 3) };
      }

      // 1. Emit standardized Business Event to enterprise event bus
      await this.eventBus.publish({
        tenantId: 'default-tenant',
        type: config.eventType,
        source: `vault:${config.relPath}`,
        payload: {
          ...payload,
          vaultFile: filename,
          vaultFolder: config.relPath,
          ingestedAt: new Date().toISOString(),
        },
        actor: { type: 'AI_AGENT', name: config.agent },
      });

      // 2. Notify AI Engine decision loop
      await this.triggerAiEngineDecision(config, sampleEntityName, payload);

      // 3. Move file to .processed/ archive with timestamp
      const destPath = path.join(processedDir, `${Date.now()}_${filename}`);
      fs.renameSync(filePath, destPath);

      // 4. Record history entry
      this.processedHistory.unshift({
        id: `vault_${Date.now()}`,
        filename,
        folder: config.relPath,
        agentDispatched: config.agent,
        recordsCount,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PROCESSED',
        details: `Successfully ingested ${recordsCount} record(s). Dispatched to ${config.agent}.`,
      });

      if (this.processedHistory.length > 50) this.processedHistory.pop();
      this.logger.log(`Successfully ingested and archived: ${filename}`);
    } catch (err: any) {
      this.logger.error(`Failed to process ${filename}: ${err.message}`);
      // Mark as error
      this.processedHistory.unshift({
        id: `vault_err_${Date.now()}`,
        filename,
        folder: config.relPath,
        agentDispatched: config.agent,
        recordsCount: 0,
        timestamp: new Date().toLocaleTimeString(),
        status: 'FAILED',
        details: `Ingestion failed: ${err.message}`,
      });
    }
  }

  private async triggerAiEngineDecision(
    config: (typeof this.watchedFolders)[0],
    entityName: string,
    payload: any,
  ) {
    try {
      const scenario =
        config.id === 'crm_leads'
          ? 'NEW_LEAD_DISPATCH'
          : config.id === 'invoices_scanned'
          ? 'FINOPS_RECONCILIATION'
          : 'LEGAL_COMPLIANCE';

      // Call internal AI Engine on :3010
      await fetch('http://localhost:3010/agents/decision-loop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          targetEntity: config.id === 'crm_leads' ? 'Contact' : 'Invoice',
          targetId: entityName,
          scenario,
          customParams: {
            sourceVault: config.relPath,
            ...payload,
          },
        }),
      });
    } catch (err: any) {
      this.logger.warn(`AI Engine notification deferred: ${err.message}`);
    }
  }

  getStatus() {
    return {
      status: 'ACTIVE',
      vaultRoot: this.vaultRoot,
      watchedFolders: this.watchedFolders.map((f) => ({
        id: f.id,
        path: path.join(this.vaultRoot, f.relPath),
        relPath: f.relPath,
        agent: f.agent,
        eventType: f.eventType,
      })),
      recentIngestions: this.processedHistory,
      totalProcessed: this.processedHistory.length,
    };
  }

  async simulateDrop(folderId: string = 'crm_leads', sampleData?: any) {
    const target = this.watchedFolders.find((f) => f.id === folderId) || this.watchedFolders[0];
    const folderPath = path.join(this.vaultRoot, target.relPath);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const timestamp = Date.now();
    const filename = `simulated_leads_${timestamp}.csv`;
    const fullPath = path.join(folderPath, filename);

    const defaultCsv =
      'Name,Email,Company,EstimatedValue,Title\n' +
      `"Elena Rostova","elena.rostova@nordictech.io","Nordic Technologies",45000,"VP of Infrastructure"\n` +
      `"Marcus Vance","m.vance@solardynamics.de","Solar Dynamics GmbH",65000,"Chief Operating Officer"\n`;

    const content = sampleData ? (typeof sampleData === 'string' ? sampleData : JSON.stringify(sampleData, null, 2)) : defaultCsv;
    fs.writeFileSync(fullPath, content, 'utf-8');

    // Trigger immediate process without waiting for next interval
    await this.processIncomingFile(target, fullPath, filename);

    return {
      success: true,
      message: `Simulated drop completed for ${filename} into ${target.relPath}`,
      agentAssigned: target.agent,
      vaultPath: fullPath,
    };
  }
}
