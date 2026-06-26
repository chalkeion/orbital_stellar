export { EventEngine } from "./EventEngine.js";
export { Watcher } from "./Watcher.js";
export { StrKey } from "@stellar/stellar-sdk";

export type Network = "mainnet" | "testnet";

export type PaymentEventType = "payment.received" | "payment.sent";
export type WatcherNotificationType =
  | "engine.reconnecting"
  | "engine.reconnected";

/**
 * A normalized Stellar event emitted by a {@link Watcher}.
 *
 * The `type` field is a discriminant — use {@link isEventType} to narrow to a
 * specific event type, or import per-type aliases from the {@link events}
 * namespace (e.g. `events.PaymentReceived`).
 */
export type NormalizedEvent = {
  type: PaymentEventType;
  to: string;
  from: string;
  amount: string;
  asset: string;
  timestamp: string;
  raw: unknown;
};

export type WatcherNotification = {
  type: WatcherNotificationType;
  attempt: number;
  delayMs?: number;
  timestamp: string;
};

export type ReconnectConfig = {
  initialDelayMs?: number;
  maxDelayMs?: number;
  maxRetries?: number;
};

export type CoreConfig = {
  network: Network;
  reconnect?: ReconnectConfig;
};

/**
 * Narrows `event` to the subset of {@link NormalizedEvent} whose `type` field
 * matches one of the provided `types`.
 *
 * @example
 * if (isEventType(event, "payment.received")) {
 *   // event is Extract<NormalizedEvent, { type: "payment.received" }>
 * }
 */
export function isEventType<T extends NormalizedEvent["type"]>(
  event: NormalizedEvent,
  ...types: T[]
): event is Extract<NormalizedEvent, { type: T }> {
  return (types as string[]).includes(event.type);
}

/** Per-event type aliases for use in typed handlers and bus implementations. */
export namespace events {
  export type PaymentReceived = Extract<NormalizedEvent, { type: "payment.received" }>;
  export type PaymentSent = Extract<NormalizedEvent, { type: "payment.sent" }>;
}
