export type TXMessage = {
  type: "start"
} | {
  type: "sasm"
} | {
  type: "savm"
}

export type RXMessage = {
  type: "started"
} | {
  type: "terminal.write",
  content: ArrayBuffer
} | {
  type: "process.exit",
}