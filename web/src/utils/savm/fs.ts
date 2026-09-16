import type { MainModule } from "#wasm/saw.js";
import { allocator } from "./allocator";

export type Ptr<T> = number & { _flair: T }
export type u8 = number;
export type u64 = bigint;
export type usize = number;

const opFsRoot = await navigator.storage.getDirectory();

async function resolveFileHandle(path: string, create: boolean = true): Promise<FileSystemFileHandle> {
  const parts = path.split("/").filter(Boolean);
  const fileName = parts.pop();
  if (!fileName) throw new Error(`Invalid file path: "${path}"`);

  let currentDir = opFsRoot;
  for (const dirName of parts) {
    currentDir = await currentDir.getDirectoryHandle(dirName, { create });
  }

  return await currentDir.getFileHandle(fileName, { create });
}

async function resolveDirHandle(path: string, create: boolean = true): Promise<FileSystemDirectoryHandle> {
  const parts = path.split("/").filter(Boolean);
  const dir = parts.pop();
  if (!dir) {
    return opFsRoot;
  };

  let currentDir = opFsRoot;
  for (const dirName of parts) {
    currentDir = await currentDir.getDirectoryHandle(dirName, { create });
  }

  return await currentDir.getDirectoryHandle(dir, { create });
}

export async function js_fs_write(
  this: MainModule,
  path: Ptr<u8>,
  path_len: usize,

  content: Ptr<u8>,
  content_len: usize
): Promise<boolean> {
  const pathData = this.UTF8ToString(path, path_len, true);

  const hwnd = await resolveFileHandle(pathData, true);
  const writeHwnd = await hwnd.createWritable({
    keepExistingData: false
  });

  const data =
    this.HEAPU8.slice(content, content + content_len);

  let output = true;
  try {
    await writeHwnd.write(data);
  } catch (e) {
    console.log(e);
    output = false;
  } finally {
    await writeHwnd.close();
  }
  return output;
}


export async function js_fs_mkdir(
  this: MainModule,
  path: Ptr<u8>,
  path_len: usize,
): Promise<boolean> {
  try {
    const pathData = this.UTF8ToString(path, path_len, true);
    await resolveDirHandle(pathData, true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function js_fs_readdir(
  this: MainModule,
  path: Ptr<u8>,
  path_len: usize,

  entries: Ptr<Ptr<any>>,
  entries_len: Ptr<usize>
): Promise<boolean> {
  const pathData = this.UTF8ToString(path, path_len, true);

  try {
    const dir = await resolveDirHandle(pathData, true);

    let count = 0;
    const entriesData: { data: Uint8Array, path: Uint8Array }[] = [];
    // .values() returns an async iterator over the directory contents
    for await (const entry of dir.values()) {
      const name = entry.name;

      const data = new TextEncoder().encode(name);
      const path = new TextEncoder().encode(`${pathData}/${name}`);

      entriesData.push({ data, path });
      count++;
    }

    const fsentries = this._fs_entries_alloc(count);
    allocator.track(() => {
      this._fs_entries_free(fsentries);
    });

    entriesData.forEach((entry, index) => {
      const name = allocator.allocarray(entry.data);
      const path = allocator.allocarray(entry.path);

      this._fs_entry_write(
        fsentries,
        index,

        name,
        entry.data.byteLength,

        path,
        entry.path.byteLength
      );
    });

    this.setValue(entries, fsentries, "*");
    this.setValue(entries_len, count, "i32");

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export async function js_fs_read(
  this: MainModule,
  path: Ptr<u8>,
  path_len: usize,

  payload: Ptr<Ptr<u8>>,
  len: Ptr<usize>
): Promise<boolean> {
  const pathData = this.UTF8ToString(path, path_len, true);

  try {
    const file = await resolveFileHandle(pathData, false);

    const content = await (await file.getFile()).bytes();

    const length = content.byteLength;
    const pointer = allocator.allocarray(content);

    this.setValue(payload, pointer, "*");
    this.setValue(len, length, "i32");

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}