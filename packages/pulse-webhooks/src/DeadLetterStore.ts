/**
 * Record of a webhook delivery failure stored in a dead-letter store.
 */
export interface FailureRecord {
  /** "webhook.failed" or "webhook.dropped" */
  eventType: "webhook.failed" | "webhook.dropped";
  /** The webhook identifier (typically the target URL) */
  webhookId: string;
  /** The original event payload that failed delivery */
  payload: unknown;
  /** Why the delivery failed */
  reason: string;
  /** When the failure occurred (epoch ms) */
  timestamp: number;
  /** How many delivery attempts were made */
  attemptCount: number;
}

/**
 * Filter for querying dead-letter records. All fields are optional.
 * When multiple fields are provided they are combined with AND logic.
 */
export interface DeadLetterFilter {
  /** Filter by event type */
  eventType?: "webhook.failed" | "webhook.dropped";
  /** Return only records after this timestamp (epoch ms) */
  since?: number;
  /** Filter by a specific webhook identifier */
  webhookId?: string;
}

/**
 * Dead-letter store interface for persisting and querying webhook delivery failures.
 */
export interface DeadLetterStore {
  /** Persist a delivery failure record. */
  record(failure: FailureRecord): void;
  /** List stored failure records, optionally filtered. */
  list(filter?: DeadLetterFilter): FailureRecord[];
}

/**
 * In-memory dead-letter store backed by a plain array.
 *
 * Capped at 1000 records — when at capacity the oldest record is evicted
 * before the new record is inserted (FIFO eviction).
 *
 * NOT safe for concurrent environments.
 */
export class MemoryDeadLetterStore implements DeadLetterStore {
  private readonly records: FailureRecord[] = [];
  private static readonly CAP = 1000;

  record(failure: FailureRecord): void {
    if (this.records.length >= MemoryDeadLetterStore.CAP) {
      this.records.shift();
    }
    this.records.push(failure);
  }

  list(filter?: DeadLetterFilter): FailureRecord[] {
    if (!filter) {
      return [...this.records];
    }

    return this.records.filter((r) => {
      if (filter.eventType !== undefined && r.eventType !== filter.eventType) {
        return false;
      }
      if (filter.since !== undefined && r.timestamp < filter.since) {
        return false;
      }
      if (filter.webhookId !== undefined && r.webhookId !== filter.webhookId) {
        return false;
      }
      return true;
    });
  }
}
