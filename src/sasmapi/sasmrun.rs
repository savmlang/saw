use core::slice;
use std::borrow::Cow;

use sasm::PathInfo;

use crate::sasmapi::{JSMkDir, JSReadDir, JSWrite, JsReadToString, MockFS};

#[no_mangle]
pub extern "C" fn sasm_begin(
  bindir_data: *const u8,
  bindir_len: usize,

  distdir_data: *const u8,
  distdir_len: usize,
) {
  unsafe {
    let rt = PathInfo {
      bindir: Cow::Borrowed(str::from_utf8_unchecked(slice::from_raw_parts(
        bindir_data,
        bindir_len,
      ))),
      distdir: Cow::Borrowed(str::from_utf8_unchecked(slice::from_raw_parts(
        distdir_data,
        distdir_len,
      ))),
    };
    let fs = MockFS;

    sasm::sasm(rt, fs);
  }
}
