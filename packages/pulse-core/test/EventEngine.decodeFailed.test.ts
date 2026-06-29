import { describe, it, expect, vi } from "vitest";
import { EventEngine } from "../src/EventEngine.js";

function buildEngine(): {
  engine: EventEngine;
  simulateRecord: (record: unknown) => void;
} {
  const engine = new EventEngine({ network: "testnet" });

  let capturedOnMessage: ((record: unknown) => void) | null = null;

  const originalOperations = (engine as any).server.operations.bind((engine as any).server);

  vi.spyOn((engine as any).server, "operations").mockImplementation(() => {
    const builder = originalOperations();
    vi.spyOn(builder, "cursor").mockReturnValue(builder);
    vi.spyOn(builder, "stream").mockImplementation(((callbacks: {
      onmessage: (r: unknown) => void;
    }) => {
      capturedOnMessage = callbacks.onmessage;
      return () => {};
    }) as any);
    return builder;
  });

  engine.start();

  return {
    engine,
    simulateRecord: (record) => {
      if (!capturedOnMessage) throw new Error("Stream not opened");
      capturedOnMessage(record);
    },
  };
}

function makeUnknownRecord(type: string): Record<string, unknown> {
  return {
    type,
    id: "12345",
    source_account: "GABCDEF123",
    created_at: "2024-01-01T00:00:00Z",
  };
}

describe("EventEngine — event.decode_failed", () => {
  it("emits event.decode_failed for an unrecognized operation type", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcher = engine.subscribe("GABCDEF123");

    const notifications: unknown[] = [];
    watcher.on("event.decode_failed", (n) => notifications.push(n));

    simulateRecord(makeUnknownRecord("unknown_op"));

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      type: "event.decode_failed",
      operationType: "unknown_op",
    });
  });

  it("includes the raw record in the notification", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcher = engine.subscribe("GABCDEF123");

    const notifications: unknown[] = [];
    watcher.on("event.decode_failed", (n) => notifications.push(n));

    const record = makeUnknownRecord("unknown_op");
    simulateRecord(record);

    expect(notifications).toHaveLength(1);
    expect((notifications[0] as any).record).toEqual(record);
  });

  it("emits to all subscribed watchers", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcherA = engine.subscribe("GAAAA");
    const watcherB = engine.subscribe("GBBBB");

    const receivedA: unknown[] = [];
    const receivedB: unknown[] = [];
    watcherA.on("event.decode_failed", (n) => receivedA.push(n));
    watcherB.on("event.decode_failed", (n) => receivedB.push(n));

    simulateRecord(makeUnknownRecord("unknown_op"));

    expect(receivedA).toHaveLength(1);
    expect(receivedB).toHaveLength(1);
  });

  it("does not emit event.decode_failed for known-but-malformed records", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcher = engine.subscribe("GABCDEF123");

    const notifications: unknown[] = [];
    watcher.on("event.decode_failed", (n) => notifications.push(n));

    simulateRecord({ type: "manage_data", source_account: "", data_name: "test" });

    expect(notifications).toHaveLength(0);
  });

  it("does not emit event.decode_failed for valid records", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcher = engine.subscribe("GABC1234");

    const notifications: unknown[] = [];
    watcher.on("event.decode_failed", (n) => notifications.push(n));

    simulateRecord({
      type: "payment",
      to: "GABC1234",
      from: "GOTHER999",
      amount: "100",
      asset_type: "native",
      created_at: "2024-01-01T00:00:00Z",
    });

    expect(notifications).toHaveLength(0);
  });

  it("emits event.decode_failed for records with no type field", () => {
    const { engine, simulateRecord } = buildEngine();
    const watcher = engine.subscribe("GABCDEF123");

    const notifications: unknown[] = [];
    watcher.on("event.decode_failed", (n) => notifications.push(n));

    simulateRecord({ id: "12345" });

    expect(notifications).toHaveLength(0);
  });
});
