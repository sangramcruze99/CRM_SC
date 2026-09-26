// apps/web-core/src/components/dashboard/DataSourceRegistry.ts
/**
 * UNIVERSAL DATA SOURCE REGISTRY 2.0
 * Connects dashboard widgets to authoritative live backend data sources.
 * Strictly adheres to the REAL DATA RULE: Never return fake metrics or placeholder numbers.
 * When data is unavailable or zero, returns explicit empty states with actionable workflows.
 */

export interface DataSourceResult<T = any> {
  data: T;
  isAvailable: boolean;
  statusText?: string;
  sourceEndpoint: string;
}

export class DataSourceRegistry {
  /**
   * Fetch operational data from the niche store API.
   */
  static async fetchNicheData(niche: string, tenantId: string = 'default-tenant'): Promise<DataSourceResult> {
    try {
      const res = await fetch(`/api/niche/${niche}`, {
        headers: {
          'x-tenant-id': tenantId,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        return {
          data: null,
          isAvailable: false,
          statusText: `API returned status ${res.status}`,
          sourceEndpoint: `/api/niche/${niche}`,
        };
      }

      const json = await res.json();
      return {
        data: json.data || null,
        isAvailable: Boolean(json.data),
        sourceEndpoint: `/api/niche/${niche}`,
      };
    } catch (err: any) {
      return {
        data: null,
        isAvailable: false,
        statusText: err?.message || 'Failed to connect to backend data source',
        sourceEndpoint: `/api/niche/${niche}`,
      };
    }
  }

  /**
   * Format numbers into human-readable compact currency strings.
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    if (isNaN(amount) || amount === 0) return '$0.00';
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Format percentage string.
   */
  static formatPercentage(value: number): string {
    if (isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  }
}
