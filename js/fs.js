addToLibrary({
  js_fs_write: async function (path, path_len, content, content_len) {
    const pathData = UTF8ToString(path, path_len, true);
    const data = HEAPU8.slice(content, content + content_len);

    /**
     * @type {FileSystemFileHandle}
     */
    const fileHwnd = await AHQRT_fsLayer.fileHandle(pathData);

    const writeHwnd = await fileHwnd.createWritable({
      keepExistingData: false,
    });

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
  },

  js_fs_mkdir: async function (path, path_len) {
    const pathData = UTF8ToString(path, path_len, true);
    /**
     * @type {FileSystemDirectoryHandle}
     */
    await AHQRT_fsLayer.dirHandle(pathData, true);

    return true;
  },

  js_fs_readdir: async function (path, path_len, entriesPtr, entries_len) {
    AHQRT_alloc.setup(Module, writeArrayToMemory);

    try {
      const pathData = UTF8ToString(path, path_len, true);

      const { count, entries } = await AHQRT_fsLayer.readdir(pathData);

      const entriesOutPtr = Module["_fs_entries_alloc"](count);
      setValue(entriesPtr, entriesOutPtr, "*");
      setValue(entries_len, count, "i32");

      entries.forEach((entry, index) => {
        const name = AHQRT_alloc.allocBytes(entry.data);
        const path = AHQRT_alloc.allocBytes(entry.path);

        Module["_fs_entry_write"](
          entriesOutPtr,
          index,
          name.pointer,
          name.length,
          path.pointer,
          path.length,
        );
      });
      return true;
    } catch (e) {
      throw e;
    }
  },

  js_fs_read: async function (path, path_len, payload, len) {
    AHQRT_alloc.setup(Module, writeArrayToMemory);

    const pathData = UTF8ToString(path, path_len, true);

    const fileHwnd = await AHQRT_fsLayer.fileHandle(pathData, true);

    const val = await (await fileHwnd.getFile()).bytes();

    const { length, pointer } = AHQRT_alloc.allocBytes(val);

    setValue(payload, pointer, "*");
    setValue(len, length, "i32");

    return true;
  },
});
