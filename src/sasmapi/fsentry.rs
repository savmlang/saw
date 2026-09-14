use savm::sart::salloc;

use crate::sasmapi::FSEntry;

#[no_mangle]
pub extern "C" fn fs_entries_alloc(total: usize) -> *mut FSEntry {
  unsafe { salloc::aligned_malloc(size_of::<FSEntry>() * total, align_of::<FSEntry>()) as _ }
}

#[no_mangle]
pub extern "C" fn fs_entries_free(ptr: *mut FSEntry) {
  unsafe {
    salloc::aligned_free(ptr as _);
  }
}

#[no_mangle]
pub extern "C" fn fs_entry_write(
  alloc: *mut FSEntry,
  index: usize,

  name: *const u8,
  name_len: usize,

  path: *const u8,
  path_len: usize,
) {
  let entry = FSEntry {
    name,
    name_len,
    path,
    path_len,
  };

  unsafe {
    core::ptr::write(alloc.add(index), entry);
  }
}
