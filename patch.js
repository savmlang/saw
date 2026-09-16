const fs = require('node:fs');

const filePath = './saw.js';
let code = fs.readFileSync(filePath, 'utf8');

const target = 'function growMemViews(){if(wasmMemory.buffer!=HEAP8.buffer){updateMemoryViews()}}';
const replacement = 'function growMemViews(){if(wasmMemory&&wasmMemory.buffer!=HEAP8.buffer){updateMemoryViews()}}';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully patched growMemViews');
}