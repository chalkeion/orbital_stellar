import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { wellKnownToContractSpec } from "../src/wellKnown.js";
import type { WellKnownSpecRaw } from "../src/wellKnown.js";
import { validateSpec } from "../src/spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WELL_KNOWN_DIR = resolve(__dirname, "../specs/well-known");

function loadWellKnown(file: string): WellKnownSpecRaw {
  return JSON.parse(readFileSync(resolve(WELL_KNOWN_DIR, file), "utf-8")) as WellKnownSpecRaw;
}

describe("wellKnownToContractSpec", () => {
  it.each([
    "usdc.json",
    "eurc.json",
    "aqua.json",
    "native-asset-wrapper.json",
    "sac-interface.json",
  ])("converts %s into a valid canonical ContractSpec", (file) => {
    const raw = loadWellKnown(file);
    const spec = wellKnownToContractSpec(raw);

    const result = validateSpec(spec);
    expect(result.valid, result.valid ? "" : JSON.stringify((result as any).errors)).toBe(true);

    expect(spec.contractId).toBe(raw.contract_id);
    expect(spec.network).toBe(raw.network);
    expect(spec.functions).toHaveLength(raw.functions.length);
    expect(spec.events).toHaveLength(raw.events?.length ?? 0);
    expect(spec.types).toEqual({});
  });

  it("maps well-known primitive types to canonical lowercase TypeSpec strings", () => {
    const raw = loadWellKnown("usdc.json");
    const spec = wellKnownToContractSpec(raw);

    const transfer = spec.functions.find((fn) => fn.name === "transfer")!;
    expect(transfer.params[0]).toEqual({
      name: "from",
      type: "address",
      doc: "Source account or contract address.",
    });
    expect(transfer.params[2]!.type).toBe("i128");

    const decimals = spec.functions.find((fn) => fn.name === "decimals")!;
    expect(decimals.returns).toBe("u32");

    const noOutput = spec.functions.find((fn) => fn.name === "transfer")!;
    expect(noOutput.returns).toBe("void");
  });

  it("prepends an event-name symbol topic and preserves declared topics/data", () => {
    const raw = loadWellKnown("usdc.json");
    const spec = wellKnownToContractSpec(raw);

    const transferEvent = spec.events.find((ev) => ev.name === "transfer")!;
    expect(transferEvent.topics[0]).toEqual(
      expect.objectContaining({ name: "event_name", type: "symbol" }),
    );
    expect(transferEvent.topics.slice(1).map((t) => t.name)).toEqual(["from", "to"]);
    expect(transferEvent.data).toEqual([
      { name: "amount", type: "i128", doc: "Amount in USDC base units." },
    ]);
  });

  it("gives the native asset wrapper only transfer and approve events (no mint/burn/clawback/set_authorized)", () => {
    const raw = loadWellKnown("native-asset-wrapper.json");
    const spec = wellKnownToContractSpec(raw);
    expect(spec.events.map((ev) => ev.name).sort()).toEqual(["approve", "transfer"]);
  });

  it("throws a clear error for an unsupported well-known type", () => {
    const raw = loadWellKnown("usdc.json");
    const bad: WellKnownSpecRaw = {
      ...raw,
      functions: [{ name: "weird", params: [{ name: "x", type: "Vec<Address>" }], outputs: [] }],
    };
    expect(() => wellKnownToContractSpec(bad)).toThrow(/unsupported well-known type/);
  });

  it("throws when a function declares more than one output", () => {
    const raw = loadWellKnown("usdc.json");
    const bad: WellKnownSpecRaw = {
      ...raw,
      functions: [
        {
          name: "weird",
          params: [],
          outputs: [{ type: "i128" }, { type: "bool" }],
        },
      ],
    };
    expect(() => wellKnownToContractSpec(bad)).toThrow(/at most one value/);
  });
});
