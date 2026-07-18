/**
 * Branded address types for the Stellar network.
 *
 * Every string that holds a Stellar address looks identical at runtime, but
 * the three address spaces are semantically distinct:
 *
 *   AccountAddress  - Ed25519 public key, starts with "G"
 *   MuxedAddress    - Multiplexed account, starts with "M"
 *   ContractAddress - Soroban contract ID, starts with "C"
 *
 * Branding is a compile-time-only technique: the runtime value is still a
 * plain `string`, so there is zero overhead and no serialisation impact.
 *
 * @example
 * function pay(to: AccountAddress, from: AccountAddress) { ... }
 *
 * pay(toAccountAddress("GDEST..."), toAccountAddress("GSRC..."));  // ✓
 * pay(toContractAddress("CABC..."), toAccountAddress("GSRC..."));  // ✗ type error
 */

import { StrKey } from "@stellar/stellar-sdk";

// ---------------------------------------------------------------------------
// Branded primitives
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<B> = { readonly [__brand]: B };

/**
 * A Stellar Ed25519 account public key (starts with "G").
 * Validated by `StrKey.isValidEd25519PublicKey`.
 */
export type AccountAddress = string & Brand<"AccountAddress">;

/**
 * A Stellar multiplexed account address (starts with "M").
 * Validated by `StrKey.isValidMed25519PublicKey`.
 */
export type MuxedAddress = string & Brand<"MuxedAddress">;

/**
 * A Soroban smart-contract address (starts with "C").
 * Validated by `StrKey.isValidContract`.
 */
export type ContractAddress = string & Brand<"ContractAddress">;

/**
 * Any valid Stellar address - account, muxed, or contract.
 */
export type StellarAddress = AccountAddress | MuxedAddress | ContractAddress;

// ---------------------------------------------------------------------------
// Type-guard predicates (narrow + brand in one call)
// ---------------------------------------------------------------------------

/**
 * Returns `true` and narrows `s` to `AccountAddress` when `s` is a valid
 * Ed25519 public key (G…).
 */
export function isAccountAddress(s: string): s is AccountAddress {
  return StrKey.isValidEd25519PublicKey(s);
}

/**
 * Returns `true` and narrows `s` to `MuxedAddress` when `s` is a valid
 * multiplexed account address (M…).
 */
export function isMuxedAddress(s: string): s is MuxedAddress {
  return StrKey.isValidMed25519PublicKey(s);
}

/**
 * Returns `true` and narrows `s` to `ContractAddress` when `s` is a valid
 * Soroban contract address (C…).
 */
export function isContractAddress(s: string): s is ContractAddress {
  return StrKey.isValidContract(s);
}

/**
 * Returns `true` and narrows `s` to `StellarAddress` when `s` is any valid
 * Stellar address (account, muxed, or contract).
 */
export function isStellarAddress(s: string): s is StellarAddress {
  return isAccountAddress(s) || isMuxedAddress(s) || isContractAddress(s);
}

// ---------------------------------------------------------------------------
// Unsafe casts - use only at validated trust boundaries (e.g. after Horizon
// has already confirmed the address is well-formed).
// ---------------------------------------------------------------------------

/**
 * Casts a raw string to `AccountAddress` without runtime validation.
 * Only use this at trust boundaries where the value is already known to be
 * a valid Ed25519 public key (e.g. directly from a validated Horizon record).
 */
export function toAccountAddress(s: string): AccountAddress {
  return s as AccountAddress;
}

/**
 * Casts a raw string to `MuxedAddress` without runtime validation.
 * Only use this at trust boundaries where the value is already known to be
 * a valid multiplexed address.
 */
export function toMuxedAddress(s: string): MuxedAddress {
  return s as MuxedAddress;
}

/**
 * Casts a raw string to `ContractAddress` without runtime validation.
 * Only use this at trust boundaries where the value is already known to be
 * a valid Soroban contract address.
 */
export function toContractAddress(s: string): ContractAddress {
  return s as ContractAddress;
}
