/**
 * Minimal structural interface every ABI registry client in this package
 * happens to satisfy (`AbiRegistryClient`, `LocalAbiRegistryClient`,
 * `OnChainAbiRegistryClient`, `BundledWellKnownClient`) - matches
 * pulse-core's `AbiRegistryClientLike` without importing pulse-core (which
 * depends on this package; importing back would be circular).
 */
export interface AbiRegistryReader {
  getSpec(contractId: string): Promise<unknown>;
  getSpecAt?(contractId: string, ledger: number): Promise<unknown>;
}

/**
 * Tries each client in order, returning the first non-null result. Used to
 * compose a resolution chain - e.g. bundled offline specs first, falling
 * through to the on-chain registry for anything not bundled.
 */
export class ChainedAbiRegistryClient implements AbiRegistryReader {
  constructor(private readonly clients: readonly AbiRegistryReader[]) {}

  async getSpec(contractId: string): Promise<unknown> {
    for (const client of this.clients) {
      const result = await client.getSpec(contractId);
      if (result != null) return result;
    }
    return null;
  }

  async getSpecAt(contractId: string, ledger: number): Promise<unknown> {
    for (const client of this.clients) {
      const result = client.getSpecAt
        ? await client.getSpecAt(contractId, ledger)
        : await client.getSpec(contractId);
      if (result != null) return result;
    }
    return null;
  }
}
