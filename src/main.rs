use savm::sart::salloc;
use std::{alloc::GlobalAlloc, ffi::c_void};

#[no_mangle]
extern "C" fn sa_malloc(size: usize, align: usize) -> *mut c_void {
  unsafe { salloc::aligned_malloc(size, align) }
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
    unsafe { sa_malloc(layout.size(), layout.align()) as _ }
  }

  unsafe fn dealloc(&self, ptr: *mut u8, _layout: std::alloc::Layout) {
    unsafe {
      sa_free(ptr as _);
    }
  }

  unsafe fn alloc_zeroed(&self, layout: std::alloc::Layout) -> *mut u8 {
    unsafe { sa_zalloc(layout.size(), layout.align()) as _ }
  }
}

fn main() {}
