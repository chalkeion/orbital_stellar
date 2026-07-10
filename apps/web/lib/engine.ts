import { EventEngine, type Network, type NetworkSourceConfig } from "@orbital-stellar/pulse-core";

const g = globalThis as unknown as { __orbitalEngine?: EventEngine };

const SOROBAN_RPC_URLS: Record<Network, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.sorobanrpc.com",
};

// Mirrors both networks simultaneously so the /demo/contracts playground can
// watch mainnet contracts (the preloaded well-known tokens) and testnet
// contracts (e.g. the demo-emitter behind "Fire test event") from the same
// shared engine, without a NEXT_PUBLIC_NETWORK toggle picking one or the
// other.
const NETWORKS: readonly Network[] = ["testnet", "mainnet"];

export function getEngine(): EventEngine {
  if (!g.__orbitalEngine) {
    const sources: NetworkSourceConfig[] = NETWORKS.map((network) => ({
      network,
      soroban: { rpcUrl: SOROBAN_RPC_URLS[network] },
    }));
    const engine = new EventEngine({ network: sources });
    engine.start();
    g.__orbitalEngine = engine;
  }
  return g.__orbitalEngine;
}
