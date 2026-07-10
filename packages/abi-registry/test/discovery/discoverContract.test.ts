import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { rpc as SorobanRpc } from "@stellar/stellar-sdk";
import { discoverContractSpec } from "../../src/discovery/discoverContract.js";
import { NoEmbeddedSpecError } from "../../src/discovery/parseContractSpec.js";
import { validateSpec } from "../../src/spec.js";

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...actual,
    rpc: { ...actual.rpc, Server: vi.fn() },
  };
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, "../fixtures/demo-emitter.wasm");
const CONTRACT_ID = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

function installMockServer(getContractWasmByContractId: ReturnType<typeof vi.fn>) {
  const server = { getContractWasmByContractId };
  (SorobanRpc.Server as unknown as ReturnType<typeof vi.fn>).mockImplementation(function (
    this: unknown,
  ) {
    return server;
  });
}

describe("discoverContractSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the WASM, parses it, and fills in placeholder version/name plus the given contractId/network", async () => {
    installMockServer(vi.fn().mockResolvedValue(readFileSync(FIXTURE)));

    const spec = await discoverContractSpec({
      rpcUrl: "https://soroban-testnet.stellar.org",
      contractId: CONTRACT_ID,
      network: "testnet",
    });

    expect(spec.contractId).toBe(CONTRACT_ID);
    expect(spec.name).toBe(CONTRACT_ID);
    expect(spec.version).toBe("0.0.0");
    expect(spec.network).toBe("testnet");
    expect(spec.functions.map((f) => f.name)).toEqual(["ping"]);
    expect(spec.events.map((e) => e.name)).toEqual(["Ping"]);

    const result = validateSpec(spec);
    expect(result.valid, result.valid ? "" : JSON.stringify((result as any).errors)).toBe(true);
  });

  it("omits network when not provided", async () => {
    installMockServer(vi.fn().mockResolvedValue(readFileSync(FIXTURE)));

    const spec = await discoverContractSpec({
      rpcUrl: "https://soroban-testnet.stellar.org",
      contractId: CONTRACT_ID,
    });

    expect(spec.network).toBeUndefined();
  });

  it("propagates NoEmbeddedSpecError for a contract with no embedded spec section", async () => {
    const emptyWasm = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
    installMockServer(vi.fn().mockResolvedValue(emptyWasm));

    await expect(
      discoverContractSpec({
        rpcUrl: "https://soroban-testnet.stellar.org",
        contractId: CONTRACT_ID,
      }),
    ).rejects.toThrow(NoEmbeddedSpecError);
  });

  it("treats any WASM-fetch failure as NoEmbeddedSpecError (e.g. SAC contracts with no WASM at all)", async () => {
    // Real behavior verified against a live mainnet USDC lookup: the SDK's
    // getContractWasmByContractId throws an untyped internal error for
    // Stellar Asset Contracts rather than a clean "not a WASM contract".
    installMockServer(vi.fn().mockRejectedValue(new Error("contract not found")));

    await expect(
      discoverContractSpec({
        rpcUrl: "https://soroban-testnet.stellar.org",
        contractId: CONTRACT_ID,
      }),
    ).rejects.toThrow(NoEmbeddedSpecError);
  });
});
