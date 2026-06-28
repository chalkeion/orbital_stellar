import type { NormalizedEvent } from "../src/index.js";
import { Watcher } from "../src/Watcher.js";
import type { PaymentEvent, WatcherNotification, DecodeFailedNotification } from "../src/index.js";

type Assert<T extends true> = T;
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/**
 * Type-only exhaustiveness test for the `NormalizedEvent` discriminated union
 * (issue #298 — M3 "discriminated union refinement").
 *
 * This file is never executed. It is compiled by `tsconfig.typetest.json`
 * (wired into the package `test` script) so that the TypeScript compiler — not
 * manual inspection — guarantees every event type is handled. Add a new member
 * to the `NormalizedEvent` union without updating the switch below and the build
 * fails.
 *
 * The mechanism is the standard `never` exhaustiveness assignment: in a `switch`
 * over `event.type`, once every case is handled the value narrows to `never` in
 * the `default` branch, so `const _x: never = event` compiles. Leave a case out
 * and `event` is no longer `never`, so the assignment is a compile error.
 */

// Positive case: a fully exhaustive switch must compile.
export function assertExhaustive(event: NormalizedEvent): string {
  switch (event.type) {
    case "payment.received":
    case "payment.sent":
    case "payment.self":
    case "account.created":
    case "account.options_changed":
    case "account.merged":
    case "account.bump_sequence":
    case "trustline.added":
    case "trustline.removed":
    case "trustline.updated":
    case "trustline.authorized":
    case "trustline.deauthorized":
    case "offer.created":
    case "offer.updated":
    case "offer.deleted":
    case "data.set":
    case "data.cleared":
    case "claimable.created":
    case "claimable.claimed":
    case "lp.deposited":
    case "lp.withdrawn":
    case "contract.invoked":
    case "contract.emitted":
      return event.type;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

// Negative case: an intentionally incomplete switch must NOT compile. Only one
// branch is handled, so in `default` the value is not `never` and the assignment
// is an error — which `@ts-expect-error` asserts. If the union ever shrank to a
// single member (making this exhaustive), the directive would become unused and
// the build would fail, proving the guard genuinely detects unhandled variants.
export function assertIncompleteIsRejected(event: NormalizedEvent): string {
  switch (event.type) {
    case "payment.received":
      return event.type;
    default: {
      // @ts-expect-error - remaining NormalizedEvent variants are unhandled here.
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

export function testWatcherOnInference() {
  const watcher = new Watcher("G...");

  watcher.on("payment.received", (e) => {
    type _IsPaymentEvent = Assert<Equal<typeof e, PaymentEvent & { readonly timestampDate: Date }>>;
    const to = e.to;
    const from = e.from;
    const amount = e.amount;
    const date = e.timestampDate;
  });

  watcher.on("engine.reconnecting", (e) => {
    type _IsWatcherNotification = Assert<Equal<typeof e, WatcherNotification>>;
    const attempt = e.attempt;
  });

  watcher.on("event.decode_failed", (e) => {
    type _IsDecodeFailedNotification = Assert<Equal<typeof e, DecodeFailedNotification>>;
    const error = e.error;
  });

  watcher.on("*", (e) => {
    type _IsFullUnion = Assert<Equal<typeof e, NormalizedEvent | WatcherNotification | DecodeFailedNotification>>;
  });

  watcher.on("unknown.event", (e) => {
    type _IsFullUnion = Assert<Equal<typeof e, NormalizedEvent | WatcherNotification | DecodeFailedNotification>>;
  });
}

