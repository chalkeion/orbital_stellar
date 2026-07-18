/**
 * `@stellar/js-xdr` ships no TypeScript types. We only need its streaming
 * reader (to walk multiple concatenated `ScSpecEntry` XDR records out of a
 * WASM `contractspecv0` section - `xdr.ScSpecEntry.fromXDR()` only handles a
 * buffer containing exactly one value). Minimal ambient declaration for the
 * one class we use.
 *
 * It's a CJS module - `import { XdrReader } from "@stellar/js-xdr"` fails at
 * runtime even under Node's ESM/CJS interop (verified). Always import the
 * default and destructure: `import jsXdr from "@stellar/js-xdr"; const {
 * XdrReader } = jsXdr;`.
 */
declare module "@stellar/js-xdr" {
  export class XdrReader {
    constructor(source: Buffer);
    readonly eof: boolean;
    remainingBytes(): number;
    rewind(): void;
  }

  const pkg: { XdrReader: typeof XdrReader };
  export default pkg;
}
