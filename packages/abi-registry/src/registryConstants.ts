/**
 * Orbital's canonical on-chain ABI registry contract ID on testnet, and the
 * publisher address specs are published under. Populated once the registry
 * contract (contracts/registry) is deployed - see
 * contracts/deploy/deploy_testnet.sh and the resulting
 * contracts/deployed.testnet.json. Empty until then;
 * {@link createDefaultAbiRegistryClient}'s default resolution chain skips
 * the on-chain link entirely while this is unset, resolving only the
 * bundled well-known specs.
 */
export const ORBITAL_REGISTRY_TESTNET_CONTRACT_ID = "";

/** The publisher address Orbital's own well-known specs are filed under, once seeded. */
export const ORBITAL_REGISTRY_PUBLISHER_ADDRESS = "";

export const ORBITAL_REGISTRY_TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
