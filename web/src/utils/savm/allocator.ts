import type { MainModule } from "../../../public/savm/saw";
import type { Ptr, usize } from "./core";

export class Allocator {
  private module: MainModule = undefined as unknown as MainModule;

  private allocs: Set<Ptr<void>> = new Set();
  private tracked: (() => void)[] = [];

  setModule(module: MainModule) {
    this.module = module;
  }

  track(free: (() => void)) {
    this.tracked.push(free);
  }

  allocarray(arr: Uint8Array): Ptr<void> {
    const pt = this.alloc(arr.byteLength, 1);
    this.module.writeArrayToMemory(arr, pt);

    return pt;
  }

  allocString(data: string): { pt: Ptr<void>, len: number } {
    const arr = new TextEncoder().encode(data);

    const length = arr.byteLength;
    return { pt: this.allocarray(arr), len: length };
  }

  alloc(size: usize, align: usize): Ptr<void> {
    const alloc = this.module._sa_malloc(size, align) as Ptr<void>;

    this.allocs.add(alloc);

    return alloc;
  }

  free(d: Ptr<void>) {
    this.module._sa_free(d);

    this.allocs.delete(d);

    this.tracked.forEach((cb) => cb());
    this.tracked = []
  }

  unsafe_clear() {
    this.allocs.forEach((dt) => this.module._sa_free(dt));

    this.allocs.clear();
  }
}

export const allocator = new Allocator();