export type TXMessage = {
  type: "start"
} | {
  type: "sasm",
  binarydir: string,
  distdir: string,
} | {
  type: "savm"
}

export type RXMessage = {
  type: "started"
} | {
  type: "terminal.write",
  content: Uint8Array
} | {
  type: "process.exit",
}