import type { MainModule } from "#wasm/saw.js";
import { allocator } from "./allocator";

export async function runSasm(
  module: MainModule,
  binarydir: string,
  distdir: string,
) {
  const {
    pt: bindir_data,
    len: bindir_len
  } = allocator.allocString(binarydir);

  const {
    pt: distdir_data,
    len: distdir_len
  } = allocator.allocString(distdir);

  module._sasm_begin(
    bindir_data,
    bindir_len,

    distdir_data,
    distdir_len
  );
}