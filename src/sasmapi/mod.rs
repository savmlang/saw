use core::str;
use std::{iter, mem::MaybeUninit, path::PathBuf, slice, str::FromStr};

use sasm::{DirFsEntry, FileSystemImpl};

pub mod fsentry;
pub mod sasmrun;

#[repr(C)]
pub struct FSEntry {
  pub name: *const u8,
  pub name_len: usize,

  pub path: *const u8,
  pub path_len: usize,
}

extern "C" {
  pub fn js_fs_write(
    path: *const u8,
    path_len: usize,
    content: *const u8,
    content_len: usize,
  ) -> bool;

  pub fn js_fs_mkdir(path: *const u8, path_len: usize) -> bool;

  pub fn js_fs_readdir(
    path: *const u8,
    path_len: usize,
    entries: *mut *mut FSEntry,
    entries_len: *mut usize,
  ) -> bool;

  pub fn js_fs_read_to_string(
    path: *const u8,
    path_len: usize,
    strpayload: *mut *mut u8,
    strlen: *mut usize,
  ) -> bool;
}

pub struct MockFS;

impl FileSystemImpl for MockFS {
  fn write<P: AsRef<std::path::Path>, C: AsRef<[u8]>>(&self, path: P, contents: C) -> Option<()> {
    let pathstr = path.as_ref().to_str()?;
    let contents = contents.as_ref();

    unsafe {
      js_fs_write(
        pathstr.as_ptr(),
        pathstr.len(),
        contents.as_ptr(),
        contents.len(),
      )
      .then_some(())
    }
  }

  fn mkdir<P: AsRef<std::path::Path>>(&self, path: P) -> Option<()> {
    let pathstr = path.as_ref().to_str()?;

    unsafe { js_fs_mkdir(pathstr.as_ptr(), pathstr.len()).then_some(()) }
  }

  fn readdir<P: AsRef<std::path::Path>, T, F>(&self, path: P, cb: F) -> T
  where
    F: FnOnce(&mut dyn Iterator<Item = DirFsEntry>) -> T,
  {
    let Some(pathstr) = path.as_ref().to_str() else {
      return cb(&mut iter::empty());
    };

    let mut entries_ptr = MaybeUninit::uninit();
    let mut entries_len_ptr = MaybeUninit::uninit();
    
    unsafe {
      let Some(()) = js_fs_readdir(
        pathstr.as_ptr(),
        pathstr.len(),
        entries_ptr.as_mut_ptr(),
        entries_len_ptr.as_mut_ptr(),
      )
      .then_some(()) else {
        return cb(&mut iter::empty());
      };

      let entries = entries_ptr.assume_init();
      let entries_len = entries_len_ptr.assume_init();

      let mut itr = slice::from_raw_parts(entries, entries_len)
        .into_iter()
        .map(|x| DirFsEntry {
          name: Box::from(str::from_utf8_unchecked(slice::from_raw_parts(
            x.name, x.name_len,
          ))),
          path: PathBuf::from_str(str::from_utf8_unchecked(slice::from_raw_parts(
            x.path, x.path_len,
          )))
          .unwrap_or_default(),
        });

      return cb(&mut itr);
    }
  }

  fn read_to_string<P: AsRef<std::path::Path>>(&self, path: P) -> Option<String> {
    let pathstr = path.as_ref().to_str()?;

    let mut data_ptr = MaybeUninit::uninit();
    let mut data_len = MaybeUninit::uninit();

    unsafe {
      js_fs_read_to_string(
        pathstr.as_ptr(),
        pathstr.len(),
        data_ptr.as_mut_ptr(),
        data_len.as_mut_ptr(),
      )
      .then_some(())?;

    
      let data = data_ptr.assume_init();
      let len = data_len.assume_init();

      Some(String::from_utf8_unchecked(Vec::from(
        slice::from_raw_parts(data, len),
      )))
    }
  }
}
