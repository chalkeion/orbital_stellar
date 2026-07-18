import { describe, it, expect, vi } from "vitest";
import { OtelWebhookMetrics } from "../src/OtelWebhookMetrics.js";
import type { Meter, MetricAttributes } from "../src/types.js";

type RecordedPoint = { value: number; attributes?: MetricAttributes };

function makeFakeMeter(): {
  meter: Meter;
  counters: Map<string, RecordedPoint[]>;
  histograms: Map<string, RecordedPoint[]>;
} {
  const counters = new Map<string, RecordedPoint[]>();
  const histograms = new Map<string, RecordedPoint[]>();

  const meter: Meter = {
    createCounter: (name) => {
      counters.set(name, []);
      return {
        add: (value, attributes) => {
          counters.get(name)!.push({ value, attributes });
        },
      };
    },
    createHistogram: (name) => {
      histograms.set(name, []);
      return {
        record: (value, attributes) => {
          histograms.get(name)!.push({ value, attributes });
        },
      };
    },
  };

  return { meter, counters, histograms };
}

describe("OtelWebhookMetrics", () => {
  it("creates the three documented instruments on construction", () => {
    const { meter, counters, histograms } = makeFakeMeter();
    new OtelWebhookMetrics(meter);

    expect(counters.has("orbital.webhook.attempts")).toBe(true);
    expect(histograms.has("orbital.webhook.duration")).toBe(true);
    expect(counters.has("orbital.webhook.terminal_outcomes")).toBe(true);
  });

  it("records an attempt as a counter increment and a duration observation with matching attributes", () => {
    const { meter, counters, histograms } = makeFakeMeter();
    const metrics = new OtelWebhookMetrics(meter);

    metrics.recordAttempt("https://prod.example.com/webhooks/stellar", 1, 123, "success");

    expect(counters.get("orbital.webhook.attempts")).toEqual([
      {
        value: 1,
        attributes: { url: "https://prod.example.com/webhooks/stellar", status: "success" },
      },
    ]);
    expect(histograms.get("orbital.webhook.duration")).toEqual([
      {
        value: 123,
        attributes: { url: "https://prod.example.com/webhooks/stellar", status: "success" },
      },
    ]);
  });

  it("records a terminal outcome as a counter increment with matching attributes", () => {
    const { meter, counters } = makeFakeMeter();
    const metrics = new OtelWebhookMetrics(meter);

    metrics.recordTerminal("https://prod.example.com/webhooks/stellar", "dropped");

    expect(counters.get("orbital.webhook.terminal_outcomes")).toEqual([
      {
        value: 1,
        attributes: { url: "https://prod.example.com/webhooks/stellar", outcome: "dropped" },
      },
    ]);
  });

  it("accepts a structurally-compatible Meter without depending on @opentelemetry/api", () => {
    // Mirrors how a real @opentelemetry/api Meter would be passed, without
    // importing the package - proves the interface is duck-typed.
    const add = vi.fn();
    const record = vi.fn();
    const otelLikeMeter = {
      createCounter: vi.fn().mockReturnValue({ add }),
      createHistogram: vi.fn().mockReturnValue({ record }),
    };

    const metrics = new OtelWebhookMetrics(otelLikeMeter);
    metrics.recordAttempt("https://x.example.com", 1, 50, "failure");

    expect(add).toHaveBeenCalledWith(1, { url: "https://x.example.com", status: "failure" });
    expect(record).toHaveBeenCalledWith(50, { url: "https://x.example.com", status: "failure" });
  });
});
