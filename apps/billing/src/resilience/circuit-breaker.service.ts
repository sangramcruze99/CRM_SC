import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number; // e.g. 3 consecutive failures
  resetTimeoutMs: number; // e.g. 10000ms before attempting half-open probe
}

interface DependencyCircuit {
  name: string;
  state: CircuitState;
  failureCount: number;
  lastFailureTime?: number;
  successCount: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);

  private readonly circuits: Map<string, DependencyCircuit> = new Map();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 3,
    resetTimeoutMs: 15000,
  };

  constructor() {
    this.initCircuit('STRIPE');
    this.initCircuit('GROQ');
    this.initCircuit('OPENROUTER');
  }

  private initCircuit(name: string) {
    this.circuits.set(name, {
      name,
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
    });
  }

  /**
   * Get telemetry status of all protected circuits
   */
  getCircuitStatuses() {
    const statuses: Array<{ name: string; service: string; state: CircuitState; failureCount: number; failureThreshold: number; status: string }> = [];
    for (const [name, circuit] of this.circuits.entries()) {
      statuses.push({
        name,
        service: name,
        state: circuit.state,
        failureCount: circuit.failureCount,
        failureThreshold: this.defaultOptions.failureThreshold,
        status: circuit.state === 'CLOSED' ? 'HEALTHY' : circuit.state === 'OPEN' ? 'TRIPPED_DEGRADED' : 'PROBING',
      });
    }
    return statuses;
  }

  /**
   * Execute an external dependency call wrapped in circuit breaker protection
   */
  async execute<T>(
    dependencyName: string,
    action: () => Promise<T>,
    fallback?: (error: any) => Promise<T> | T,
  ): Promise<T> {
    const circuit = this.circuits.get(dependencyName) || {
      name: dependencyName,
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
    };
    this.circuits.set(dependencyName, circuit);

    const now = Date.now();

    // If circuit is OPEN, check if resetTimeout has elapsed to transition to HALF_OPEN
    if (circuit.state === 'OPEN') {
      if (circuit.lastFailureTime && now - circuit.lastFailureTime > this.defaultOptions.resetTimeoutMs) {
        circuit.state = 'HALF_OPEN';
        this.logger.log(`[CircuitBreaker] Circuit for ${dependencyName} transitioning from OPEN to HALF_OPEN probe.`);
      } else {
        this.logger.warn(`[CircuitBreaker] Circuit for ${dependencyName} is OPEN. Executing fallback.`);
        if (fallback) {
          return fallback(new ServiceUnavailableException(`${dependencyName} circuit is currently OPEN.`));
        }
        throw new ServiceUnavailableException(`External service ${dependencyName} is currently unavailable (Circuit OPEN).`);
      }
    }

    try {
      const result = await action();

      // Successful execution
      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.failureCount = 0;
        this.logger.log(`[CircuitBreaker] Circuit for ${dependencyName} recovered and closed successfully.`);
      } else {
        circuit.failureCount = 0;
      }
      circuit.successCount++;
      return result;
    } catch (err: any) {
      circuit.failureCount++;
      circuit.lastFailureTime = now;

      if (circuit.failureCount >= this.defaultOptions.failureThreshold) {
        circuit.state = 'OPEN';
        this.logger.error(
          `[CircuitBreaker] Circuit for ${dependencyName} TRIPPED to OPEN after ${circuit.failureCount} consecutive failures. Reason: ${err.message}`,
        );
      }

      if (fallback) {
        return fallback(err);
      }
      throw err;
    }
  }

  /**
   * Manually reset a circuit
   */
  resetCircuit(dependencyName: string) {
    const circuit = this.circuits.get(dependencyName);
    if (circuit) {
      circuit.state = 'CLOSED';
      circuit.failureCount = 0;
      this.logger.log(`[CircuitBreaker] Manually reset circuit for ${dependencyName}.`);
    }
  }
}
