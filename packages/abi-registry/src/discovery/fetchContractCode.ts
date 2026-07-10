import { rpc as SorobanRpc } from "@stellar/stellar-sdk";

/**
 * Fetches a deployed contract's WASM bytecode via Soroban RPC's
 * `getContractWasmByContractId`, which resolves `ContractInstance` →
 * `ContractExecutable::Wasm(hash)` → `ContractCode` internally. Throws if
 * the contract or its WASM can't be found on the network.
 */
export async function fetchContractWasm(rpcUrl: string, contractId: string): Promise<Buffer> {
  const server = new SorobanRpc.Server(rpcUrl);
  return server.getContractWasmByContractId(contractId);
}
