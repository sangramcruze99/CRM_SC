export type ConnectorCategory =
  | 'COMMUNICATION'
  | 'CALENDAR'
  | 'AI'
  | 'CRM'
  | 'DATA'
  | 'ECOMMERCE'
  | 'PAYMENTS'
  | 'PRODUCTIVITY';

export interface ConnectorActionDef {
  key: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface ConnectorTriggerDef {
  key: string;
  name: string;
  description: string;
  eventPayloadSchema: Record<string, any>;
}

export interface IConnector {
  key: string;
  name: string;
  category: ConnectorCategory;
  description: string;
  icon: string;
  authType: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'NONE';
  actions: ConnectorActionDef[];
  triggers: ConnectorTriggerDef[];
  testConnection(credentials: Record<string, any>): Promise<{ ok: boolean; message?: string }>;
  executeAction(actionKey: string, credentials: Record<string, any>, params: Record<string, any>): Promise<any>;
}
