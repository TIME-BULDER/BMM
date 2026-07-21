declare module "javascript-opentimestamps" {
  export function stamp(file: DetachedTimestampFile): Promise<void>;
  export function verify(
    file: DetachedTimestampFile,
    hash: Buffer,
  ): Promise<unknown>;

  export class DetachedTimestampFile {
    static fromHash(op: Ops.OpSHA256, hash: Buffer): DetachedTimestampFile;
    static deserialize(bytes: Uint8Array): DetachedTimestampFile;
    serializeToBytes(): Uint8Array;
  }

  export namespace Ops {
    class OpSHA256 {}
  }
}
