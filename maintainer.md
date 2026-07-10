# Maintainer TODOs — Semantic layer (ABI registry + auto-discovery)

Goal: Orbital stops being a delivery pipe and becomes the layer that knows what
Stellar events *mean* — canonical `contractId → interface`, resolved automatically.
One system, five stages, dependency order. Each stage ships standalone value.

- [ ] **1. Registry contract → testnet** — code complete, blocked on deployment
  - [x] Soroban contract: `publish(contract_id, version, spec_hash, pointer)`, per-version
    lookup, publisher authorization, emits a `spec_published` event.
    (`contracts/registry`, 7 unit tests)
  - [x] Stores hash + pointer (not the full spec) — integrity verifiable on-chain, spec
    blobs live off-chain.
  - [x] Deploy script committed (`contracts/deploy/deploy_testnet.sh`).
  - [ ] **Blocked on maintainer action:** actually run the deploy (needs a funded
    testnet account) and commit the resulting `contracts/deployed.testnet.json`.
  - [ ] **Blocked on maintainer action:** wire `SOROBAN_CONTRACT_ID` +
    `SOROBAN_INVOKER_SECRET` repo secrets — `integration.yml` already forwards them
    and `soroban.test.ts` already defaults to the zero-arg `demo-emitter.ping()` (see
    `contracts/demo-emitter`), so once the secrets exist the nightly test stops
    skipping with zero further code changes.

- [ ] **2. Product wired onto the contract** — code complete, blocked on stage 1 deploy
  - [x] On-chain `RegistryPublisher` implementation: `OnChainRegistryPublisher`
    in `@orbital-stellar/abi-registry`.
  - [x] On-chain resolution path: `OnChainAbiRegistryClient`, wired into pulse-core's
    default registry chain (`createDefaultAbiRegistryClient`).
  - [ ] **Blocked on stage 1 deploy:** seed the registry with the 4 bundled well-known
    specs (USDC, EURC, AQUA, native XLM wrapper — not the `sac-interface.json`
    placeholder) published through the contract. Script is written and tested
    (`packages/abi-registry/scripts/seed-well-known.ts`), just needs a live contract
    to run against.
  - [ ] **Blocked on stage 1 deploy:** testnet integration test invoking the real
    deployed registry — written (`soroban-registry.test.ts` pattern), not yet run live.

- [x] **3. WASM auto-discovery** — done
  - [x] RPC fetch → WASM → parse the embedded `contractspecv0` section → derive the
    interface (`discoverContractSpec`). Verified against real compiled WASM
    (`contracts/registry`, `contracts/demo-emitter`) and against a live mainnet USDC
    lookup (correctly falls back for SAC contracts, which have no WASM at all).
  - [x] Protocol-23+ event schemas, older-contract partial inference,
    `NoEmbeddedSpecError` fallback path all implemented and tested.
  - [x] Output format matches exactly what the registry stores (`ContractSpec`).

- [x] **4. Auto-publish indexer** — done
  - [x] `packages/orbital-indexer`'s `AutoPublishIndexer`: unknown `contractId` →
    auto-discover → publish under Orbital's key → cache, with in-flight dedupe and
    backoff for undiscoverable contracts.
  - [x] Manual `abi-registry publish` stays the override path (publisher-scoped
    on-chain storage, no admin allow-list needed).
  - Runs against a deployed registry once stage 1 is live — the indexer class itself
    is fully built and tested independent of that.

- [x] **5. Default semantic decode + typegen** — done
  - [x] `engine.subscribeContract` resolves the registry and emits `decodedData` by
    default (bundled well-known specs today; on-chain registry once stage 1 is
    live) — `abiRegistry: false` opts out.
  - [x] `orbital typegen <CONTRACT_ID>` — verified live against a real mainnet
    contract.

## Visibility (do alongside stages 1–2)

- [ ] **"Fire test event" button on `/demo/contracts`** — code complete, blocked on
  `demo-emitter` deployment. Button, cooldown, and server route are built and
  return a clean 503 until `DEMO_EMITTER_CONTRACT_ID`/`DEMO_EMITTER_SECRET` are
  configured (part of the stage 1 deploy).
- [x] **Preload the playground with well-known mainnet contracts** — done, verified
  live (a real mainnet USDC transfer streamed through within seconds of clicking):
  - USDC `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75`
  - EURC `CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV`
  - AQUA `CAUIKL3IYGMERDRUN5QQVPKPLZTRNVXV27LFCWQIRNOHSNGB3ZXAEFBX`

## Deferred (deliberately)

- Tx automation ("when event X, invoke contract Y") — key-custody liability;
  2027 roadmap territory.
- Replay/history store beyond RPC's ~7-day window — second-strongest move
  (semantics + memory = the full foundation); start after stage 3.
- Docs polish, OTel/retry hardening, contributor growth, apps/web CI build +
  postcss vuln — background work, never the centerpiece.

## Wave footnote

Stages 1–2 merged to `main` before wave 7 entry (≈ Jul 21–27; treat **Jul 21** as the
cutoff) close the loop gate (~$45 → ~$99/wave). Stages 3–5 are the depth evidence for
the waves after. Work landing mid-window is invisible until the next wave.
