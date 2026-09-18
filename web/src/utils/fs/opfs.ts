import type { Entry } from "./types";

const opFsRoot = navigator.storage.getDirectory();

export async function dirHandle(path: string, create = true): Promise<FileSystemDirectoryHandle> {
  const parts = path.split("/").filter(Boolean);
  const dir = parts.pop();
  if (!dir) {
    return await opFsRoot;
  }

  let currentDir = await opFsRoot;
  for (const dirName of parts) {
    currentDir = await currentDir.getDirectoryHandle(dirName, { create });
  }

  return await currentDir.getDirectoryHandle(dir, { create });
}

export async function ls(dir: FileSystemDirectoryHandle): Promise<Entry[]> {
  const dirEntries: Entry[] = [];
  for await (const [name, entry] of dir.entries()) {
    dirEntries.push({
      name,
      kind: entry.kind === "directory" ? "dir" : "file"
    });
  }
  dirEntries.sort((a, b) => {
    if (a.kind === "dir" && b.kind !== "dir") return -1;
    if (a.kind !== "dir" && b.kind === "dir") return 1;
    return a.name.localeCompare(b.name);
  });

  return dirEntries;
}
