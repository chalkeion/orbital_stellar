import type { NormalizedEvent } from "../../src/index.js";

// Exhaustive switch test for NormalizedEvent discriminated unions.
//
// This file is type-only: it should not emit or run at runtime.
// The build should fail if NormalizedEvent gets a new `type` member
// and this switch is not updated accordingly.
function exhaustive(event: NormalizedEvent) {
  switch (event.type) {
    case "payment.received": {
      return event.amount;
    }

    case "payment.sent": {
      return event.amount;
    }

    // @ts-expect-error: Intentionally missing handling for "account.options_changed".
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    case "account.options_changed": { // should not be reachable without exhaustive handling

      return event.changes;
    }
  }
}

