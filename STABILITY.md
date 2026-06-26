# Stability pledge

Orbital's public API surface follows semver. Breaking changes within a major version require a documented deprecation window (see [ROADMAP.md](./ROADMAP.md) Phase 1).

## Signing format

Webhook HMAC signatures are part of the stability contract. The format is **unversioned** and fixed per [ADR-003 — HMAC-SHA256 webhook signatures without explicit versioning](./docs/adr/003-hmac-no-versioning.md).

**Construction rule:**

```
signed_payload = `${timestamp}.${body}`
signature      = HMAC-SHA256(secret, signed_payload) encoded as lowercase hex
```

- `timestamp` — value of the `x-orbital-timestamp` header (Unix epoch milliseconds as a decimal string).
- `body` — raw HTTP request body (UTF-8 text).
- `secret` — shared webhook secret (UTF-8 key material for HMAC).

The `x-orbital-signature` header carries only the hex digest. There is no `v1=` prefix or algorithm identifier inside any header.

**Regression fixture** (asserted in `packages/pulse-webhooks/test/signature.regression.test.ts`):

| Field | Value |
|---|---|
| payload | `{"type":"ping"}` |
| secret | `whsec_test_regression_fixture` |
| timestamp | `1717000000000` |
| expected signature | `9c79798b9fb0e2bf9da3c5f0bb8d36977d013f8ed0fe9837cc8a9d3c1017c6c0` |

Changing this construction rule or the pinned fixture output is a breaking change for webhook receivers.
