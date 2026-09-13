use dashmap::DashMap;
use savm::{
  sart::ctr::VMTaskState,
  sync::{VMState, VMSTAT, VM_MAX_VMSTATES},
  VM,
};

use crate::savmapi::{BytecodeResolveFn, VMResolver};

pub type VMType = VM<VMResolver>;

#[no_mangle]
/// Creates a new [savm::VM] instance
///
/// ## SAFETY NOTE:
/// Implementation requirements ([Send], [Sync]) delegated to the caller.
/// `sections_len`, `rodata_len`, and `rwdata_len` must correctly denote
/// the number of elements/bytes valid at their respective root pointers.
pub extern "C" fn savm_setup(
  get_bytecode: BytecodeResolveFn,

  rodata_begin: *mut u8,
  rodata_len: usize,

  rwdata_begin: *mut u8,
  rwdata_len: usize,

  sections_begin: *mut u64,
  sections_len: usize,
) -> *mut VMType {
  let sections = super::ISlice {
    root: sections_begin,
    len: sections_len,
  };

  let capacity = unsafe { sections.as_slice() }
    .iter()
    .copied()
    .sum::<u64>()
    .saturating_sub(1) as usize;

  let data = VMResolver {
    cache: DashMap::with_capacity(capacity),

    get_bytecode,
    rodata: super::ISlice {
      root: rodata_begin,
      len: rodata_len,
    },
    rwdata: super::ISlice {
      root: rwdata_begin,
      len: rwdata_len,
    },
    sections,
  };

  Box::into_raw(Box::new(VM::new(data)))
}

pub type JSCbVMState = extern "C" fn(*mut VMState);

#[no_mangle]
/// Executes a module and then gets the [VMState] that was used
pub extern "C" fn savm_exec_module(vm: *mut VMType, sectionid: u64, cb: JSCbVMState) {
  unsafe {
    let vm = &(*vm);

    vm.dispatch_chocolate::<true>(sectionid);

    savm_get_tls_vmstate(cb);
  }
}

#[no_mangle]
/// Gets the maximum number of [VMTaskState] available
///
/// [savm_vmtaskstate_root]: Pointer to first element
/// [savm_max_vmstates]: Length
pub extern "C" fn savm_max_vmstates() -> usize {
  VM_MAX_VMSTATES
}

#[no_mangle]
/// Gets the [VMTaskState] for the [VMState] pointer
pub extern "C" fn savm_vmtaskstate_root(state: *mut VMState) -> *mut VMTaskState {
  unsafe { (*state).ts.as_mut_ptr() }
}

#[no_mangle]
/// Gets the cindex of [VMState]
pub extern "C" fn savm_vmstate_cindex(state: *mut VMState) -> usize {
  unsafe { (*state).cindex }
}

#[no_mangle]
/// Gets the primed parameter of [VMState]
pub extern "C" fn savm_vmstate_primed(state: *mut VMState) -> bool {
  unsafe { (*state).primed }
}

#[no_mangle]
/// Fetches the [VMState] associated with the TLS of the calling thread.
///
/// ## Note:
/// This [VMState] may NOT be the [VMState] that was used to run the code in
/// [savm_exec_module]
///
/// The [VMState] returned by [savm_exec_module] is guaranteed to be the exact
/// [VMState] that executed the module.
pub extern "C" fn savm_get_tls_vmstate(cb: JSCbVMState) {
  let vmstat = VMSTAT.with(|x| x.get());

  cb(vmstat);
}

#[no_mangle]
/// Frees the [savm::VM] allocated
pub extern "C" fn savm_free(vm: *mut VMType) {
  unsafe {
    drop(Box::from_raw(vm));
  }
}
