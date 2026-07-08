import type {
  Meter,
  OtelCounter,
  OtelHistogram,
  WebhookAttemptStatus,
  WebhookMetrics,
  WebhookTerminalOutcome,
} from "./types.js";

/**
 * OpenTelemetry-backed implementation of the `WebhookMetrics` interface.
 *
 * Exposes three metric instruments, the OTel-attribute equivalent of
 * `PrometheusWebhookMetrics`' label-based metric families:
 * - `orbital.webhook.attempts` (counter, attributes: `url`, `status`)
 * - `orbital.webhook.duration` (histogram, unit `ms`, attributes: `url`, `status`)
 * - `orbital.webhook.terminal_outcomes` (counter, attributes: `url`, `outcome`)
 *
 * Accepts any object structurally compatible with `@opentelemetry/api`'s
 * `Meter` interface (see {@link Meter}), matching this package's existing
 * `Tracer`/`Span` pattern — pulse-webhooks does not need a hard dependency
 * on `@opentelemetry/api`. Construct with a real `Meter` from
 * `metrics.getMeter("orbital-pulse-webhooks")` (or any collector adapter
 * exposing the same shape) and export it to your OTel collector as usual.
 *
 * @note `url` is used as an attribute value, which can cause high
 *       cardinality in some backends. See the same caveat on
 *       `PrometheusWebhookMetrics`.
 */
export class OtelWebhookMetrics implements WebhookMetrics {
  private readonly attemptsTotal: OtelCounter;
  private readonly durationMs: OtelHistogram;
  private readonly terminalOutcomesTotal: OtelCounter;

  constructor(meter: Meter) {
    this.attemptsTotal = meter.createCounter("orbital.webhook.attempts", {
      description: "Total number of webhook delivery attempts",
    });
    this.durationMs = meter.createHistogram("orbital.webhook.duration", {
      description: "Duration of webhook delivery attempts in milliseconds",
    });
    this.terminalOutcomesTotal = meter.createCounter("orbital.webhook.terminal_outcomes", {
      description: "Total number of terminal webhook delivery outcomes",
    });
  }

  recordAttempt(
    url: string,
    _attempt: number,
    durationMs: number,
    status: WebhookAttemptStatus,
  ): void {
    this.attemptsTotal.add(1, { url, status });
    this.durationMs.record(durationMs, { url, status });
  }

  recordTerminal(url: string, outcome: WebhookTerminalOutcome): void {
    this.terminalOutcomesTotal.add(1, { url, outcome });
  }
}
