use savm::sart::salloc;
use std::{alloc::GlobalAlloc, ffi::c_void};

pub mod sasmapi;
pub mod savmapi;

#[no_mangle]
extern "C" fn sa_malloc(size: usize, align: usize) -> *mut c_void {
  let align = align.max(4);
  unsafe { salloc::aligned_malloc(size.next_multiple_of(align), align) }
}

#[no_mangle]
extern "C" fn sa_zalloc(size: usize, align: usize) -> *mut c_void {
  unsafe { salloc::aligned_zalloc(size, align) }
}

#[no_mangle]
extern "C" fn sa_realloc(ptr: *mut c_void, size: usize, align: usize) -> *mut c_void {
  unsafe { salloc::aligned_realloc(ptr, size, align) }
}

#[no_mangle]
extern "C" fn sa_free(ptr: *mut c_void) {
  unsafe { salloc::aligned_free(ptr) }
}

#[global_allocator]
static SALLOC: SaAllocator = SaAllocator;

struct SaAllocator;

unsafe impl GlobalAlloc for SaAllocator {
  unsafe fn alloc(&self, layout: std::alloc::Layout) -> *mut u8 {
    sa_malloc(layout.size(), layout.align()) as _
  }

  unsafe fn dealloc(&self, ptr: *mut u8, _layout: std::alloc::Layout) {
    sa_free(ptr as _);
  }

  unsafe fn alloc_zeroed(&self, layout: std::alloc::Layout) -> *mut u8 {
    sa_zalloc(layout.size(), layout.align()) as _
  }
}

fn main() {
  console::set_colors_enabled(true);
}
