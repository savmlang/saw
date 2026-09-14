use core::slice;
use std::mem::MaybeUninit;

use dashmap::DashMap;
use savm::{
  BytecodeResolver, CacheData, Slice as SaSlice, SliceMut as SaSliceMut, SymbolMapTable,
  SymbolMapTableInfo,
};

pub mod vm;

pub type BytecodeResolveFn = extern "C" fn(u64, *mut *mut u8, *mut usize);

pub struct VMResolver {
  pub sections: ISlice<u64>,

  pub rodata: ISlice<u8>,
  pub rwdata: ISlice<u8>,

  pub pgo_critical: ISlice<u64>,
  pub pgo_priority: ISlice<u64>,

  pub cache: DashMap<u64, CacheData>,

  pub get_bytecode: BytecodeResolveFn,
}

// SAFETY NOTE:
// Implementation requirements delegated to the caller
unsafe impl Send for VMResolver {}
unsafe impl Sync for VMResolver {}

#[repr(C)]
pub struct ISlice<T> {
  pub root: *mut T,
  pub len: usize,
}

impl<T> ISlice<T> {
  pub unsafe fn as_slice<'a>(&self) -> &'a mut [T] {
    slice::from_raw_parts_mut(self.root, self.len)
  }
}

impl BytecodeResolver for VMResolver {
  type T<'a>
    = &'a [u8]
  where
    Self: 'a;

  fn sections(&self) -> &[u64] {
    unsafe { self.sections.as_slice() }
  }

  fn heuristic_pgo<'a>(&'a self) -> [&'a [u64]; 2] {
    unsafe { [self.pgo_critical.as_slice(), self.pgo_priority.as_slice()] }
  }

  // for WASM - it is a constant
  fn learn_data(&self, _: u64) -> savm::SymbolMapTableInfo {
    SymbolMapTableInfo::MixedSizedBytecode
  }

  fn rodata(&self) -> SaSlice<u8> {
    SaSlice {
      ptr: self.rodata.root,
      len: self.rodata.len,
    }
  }

  fn rwdata(&self) -> SaSliceMut<u8> {
    SaSliceMut {
      ptr: self.rwdata.root,
      len: self.rwdata.len,
    }
  }

  fn update_cache(&self, section: u64, cache: CacheData) {
    _ = self.cache.insert(section, cache);
  }

  fn resolve_data<'a>(&'a self, section: u64) -> savm::SymbolMapTable<Self::T<'a>> {
    let mut ptr = MaybeUninit::<*mut u8>::uninit();
    let mut len = MaybeUninit::<usize>::uninit();

    unsafe {
      (self.get_bytecode)(section, ptr.as_mut_ptr(), len.as_mut_ptr());

      let ptr = ptr.assume_init();
      let len = len.assume_init();

      SymbolMapTable::MixedSizedBytecode {
        bytecode: slice::from_raw_parts(ptr, len),
      }
    }
  }

  fn get_best_cache(&self, section: u64) -> savm::CacheData {
    self
      .cache
      .get(&section)
      .map_or(CacheData::None, |x| x.value().clone())
  }

  fn get_cache(&self, section: u64, _: savm::CacheLevel) -> CacheData {
    self
      .cache
      .get(&section)
      .map_or(CacheData::None, |x| x.value().clone())
  }

  fn get_libcalls(&self, section: u64) -> Option<savm::LibCalls> {
    self
      .cache
      .get(&section)
      .map(|x| {
        let val = x.value();

        match val {
          CacheData::Pickle { libcalls, .. } => libcalls.as_ref().map(Clone::clone),
          _ => None,
        }
      })
      .flatten()
  }
}
