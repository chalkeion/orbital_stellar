import { describe, it, expect } from "vitest";
import { createDefaultAbiRegistryClient } from "../src/createDefaultAbiRegistryClient.js";
import { ORBITAL_REGISTRY_TESTNET_CONTRACT_ID } from "../src/registryConstants.js";

const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

describe("createDefaultAbiRegistryClient", () => {
  it("resolves bundled well-known specs offline, with no on-chain registry contract deployed yet", async () => {
    // Documents current repo state — see registryConstants.ts's doc comment.
    // Once contracts/deploy/deploy_testnet.sh has run and this constant is
    // populated, this test's premise (and the second assertion below) will
    // need updating to reflect a live on-chain link.
    expect(ORBITAL_REGISTRY_TESTNET_CONTRACT_ID).toBe("");

    const client = createDefaultAbiRegistryClient();
    const spec = await client.getSpec(USDC);
    expect(spec).not.toBeNull();
    expect((spec as { name: string }).name).toBe("USD Coin (USDC)");
  });

  it("returns null for a contract not in the bundled set (no on-chain link configured yet)", async () => {
    const client = createDefaultAbiRegistryClient();
    const spec = await client.getSpec("CUNKNOWN00000000000000000000000000000000000000000000000");
    expect(spec).toBeNull();
  });
});
