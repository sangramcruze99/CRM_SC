import { Injectable, Logger } from '@nestjs/common';

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'BDT';

export interface FxConversionResult {
  originalAmount: number;
  originalCurrency: SupportedCurrency;
  convertedAmount: number;
  convertedCurrency: SupportedCurrency;
  exchangeRate: number;
  exchangeRateTimestamp: string;
}

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  // Benchmarked Exchange Rates relative to USD (1 USD = X Currency)
  private readonly EXCHANGE_RATES: Record<SupportedCurrency, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    BDT: 121.5,
  };

  /**
   * List all supported currencies and exchange rates
   */
  getSupportedCurrencies() {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', rateToUsd: 1.0 },
      { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: 0.92 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rateToUsd: 0.79 },
      { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rateToUsd: 121.5 },
    ];
  }

  /**
   * Convert an amount between two currencies with auditable record
   */
  convert(amount: number, from: SupportedCurrency, to: SupportedCurrency): FxConversionResult {
    const rateFrom = this.EXCHANGE_RATES[from] || 1.0;
    const rateTo = this.EXCHANGE_RATES[to] || 1.0;

    // Convert from source to USD, then from USD to target
    const amountInUsd = amount / rateFrom;
    const converted = amountInUsd * rateTo;
    const effectiveRate = Number((rateTo / rateFrom).toFixed(6));

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: Number(converted.toFixed(2)),
      convertedCurrency: to,
      exchangeRate: effectiveRate,
      exchangeRateTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Format currency value
   */
  format(amount: number, currency: SupportedCurrency): string {
    const symbols: Record<SupportedCurrency, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BDT: '৳',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
