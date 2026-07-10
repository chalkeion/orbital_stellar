import { Networks } from "@stellar/stellar-sdk";
import { BundledWellKnownClient } from "./BundledWellKnownClient.js";
import { ChainedAbiRegistryClient } from "./ChainedAbiRegistryClient.js";
import type { AbiRegistryReader } from "./ChainedAbiRegistryClient.js";
import { OnChainAbiRegistryClient } from "./OnChainAbiRegistryClient.js";
import {
  ORBITAL_REGISTRY_TESTNET_CONTRACT_ID,
  ORBITAL_REGISTRY_PUBLISHER_ADDRESS,
  ORBITAL_REGISTRY_TESTNET_RPC_URL,
} from "./registryConstants.js";

/**
 * Builds `EventEngine`'s default registry resolution chain: the bundled
 * well-known specs first (works fully offline, no network), then Orbital's
 * on-chain testnet registry once it's deployed and
 * {@link ORBITAL_REGISTRY_TESTNET_CONTRACT_ID} is populated (empty today).
 *
 * Used when `CoreConfig.abiRegistry` is omitted; pass `abiRegistry: false`
 * to opt out of default resolution entirely and preserve pre-default
 * behavior (`decodedData` never populated).
 */
export function createDefaultAbiRegistryClient(): AbiRegistryReader {
  const clients: AbiRegistryReader[] = [new BundledWellKnownClient()];

  if (ORBITAL_REGISTRY_TESTNET_CONTRACT_ID) {
    clients.push(
      new OnChainAbiRegistryClient({
        contractId: ORBITAL_REGISTRY_TESTNET_CONTRACT_ID,
        rpcUrl: ORBITAL_REGISTRY_TESTNET_RPC_URL,
        networkPassphrase: Networks.TESTNET,
        publisher: ORBITAL_REGISTRY_PUBLISHER_ADDRESS,
      }),
    );
  }

  return new ChainedAbiRegistryClient(clients);
}
