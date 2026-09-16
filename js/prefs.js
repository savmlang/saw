class FileSystemLayer {
  opFsRoot = this.getRoot();

  getRoot() {
    return navigator.storage.getDirectory();
  }

  async fileHandle(path, create = true) {
    const parts = path.split("/").filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) throw new Error(`Invalid file path: "${path}"`);

    let currentDir = await this.opFsRoot;
    for (const dirName of parts) {
      currentDir = await currentDir.getDirectoryHandle(dirName, { create });
    }

    return await currentDir.getFileHandle(fileName, { create });
  }

  async dirHandle(path, create = true) {
    const parts = path.split("/").filter(Boolean);
    const dir = parts.pop();
    if (!dir) {
      return await this.opFsRoot;
    }

    let currentDir = await this.opFsRoot;
    for (const dirName of parts) {
      currentDir = await currentDir.getDirectoryHandle(dirName, { create });
    }

    return await currentDir.getDirectoryHandle(dir, { create });
  }

  async readdir(pathData) {
    const dir = await this.dirHandle(pathData, true);

    let count = 0;
    const entriesData = [];
    // .values() returns an async iterator over the directory contents
    for await (const entry of dir.values()) {
      const name = entry.name;

      const data = new TextEncoder().encode(name);
      const path = new TextEncoder().encode(`${pathData}/${name}`);

      entriesData.push({ data, path });
      count++;
    }

    return {
      count,
      entries: entriesData,
    };
  }
}

class AHQRTAllocator {
  module;
  writeArrayToMemory;

  setup(module, writeArrayToMemory) {
    this.module = module;
    this.writeArrayToMemory = writeArrayToMemory;
  }

  /**
   * @param {Uint8Array} bytes
   */
  allocBytes(bytes) {
    /**
     * @type {number}
     */
    const pointer = this.module["_sa_malloc"](bytes.byteLength, 1);

    this.writeArrayToMemory(bytes, pointer);

    return {
      length: bytes.byteLength,
      pointer,
    };
  }

  allocString(strdata) {
    return this.allocBytes(new TextEncoder().encode(strdata));
  }
}

var AHQRT_fsLayer = new FileSystemLayer();
var AHQRT_alloc = new AHQRTAllocator();
