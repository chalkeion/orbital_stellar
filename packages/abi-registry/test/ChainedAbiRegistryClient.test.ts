import { describe, it, expect, vi } from "vitest";
import { ChainedAbiRegistryClient } from "../src/ChainedAbiRegistryClient.js";
import type { AbiRegistryReader } from "../src/ChainedAbiRegistryClient.js";

function client(getSpec: unknown, getSpecAt?: unknown): AbiRegistryReader {
  return {
    getSpec: vi.fn().mockResolvedValue(getSpec),
    ...(getSpecAt !== undefined ? { getSpecAt: vi.fn().mockResolvedValue(getSpecAt) } : {}),
  };
}

describe("ChainedAbiRegistryClient", () => {
  it("returns the first non-null result across clients", async () => {
    const a = client(null);
    const b = client({ name: "found in b" });
    const c = client({ name: "should not be reached" });
    const chained = new ChainedAbiRegistryClient([a, b, c]);

    expect(await chained.getSpec("C...")).toEqual({ name: "found in b" });
    expect(c.getSpec).not.toHaveBeenCalled();
  });

  it("returns null when every client misses", async () => {
    const chained = new ChainedAbiRegistryClient([client(null), client(null)]);
    expect(await chained.getSpec("C...")).toBeNull();
  });

  it("returns null with zero clients", async () => {
    const chained = new ChainedAbiRegistryClient([]);
    expect(await chained.getSpec("C...")).toBeNull();
  });

  it("getSpecAt falls back to getSpec for clients that don't implement getSpecAt", async () => {
    const a = client(null);
    const b = client({ name: "fallback via getSpec" }); // no getSpecAt
    const chained = new ChainedAbiRegistryClient([a, b]);

    expect(await chained.getSpecAt("C...", 100)).toEqual({ name: "fallback via getSpec" });
  });

  it("getSpecAt prefers a client's own getSpecAt when implemented", async () => {
    const a = client(null, { name: "from getSpecAt" });
    const chained = new ChainedAbiRegistryClient([a]);

    const result = await chained.getSpecAt("C...", 100);
    expect(result).toEqual({ name: "from getSpecAt" });
    expect(a.getSpecAt).toHaveBeenCalledWith("C...", 100);
  });
});
