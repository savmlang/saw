import type { Terminal } from "@xterm/xterm";
import { bold, type Context } from ".";

import { requestLs, requestRm } from "../fsService";
import type { Entries } from "../fs/types";

export async function ls({ shell }: Context, args: string[], term: Terminal) {
  if (args.length > 2) {
    term.writeln([
      bold("ls"),
      "only expects at most",
      bold("2"),
      "arguments. Found ",
      bold(args.length.toString()),
    ].join(" "));
    return;
  }

  let regexp = /.*/;

  if (args.length >= 1) {
    const regexparg = args[0];
    const flags = args[1] || "";

    try {
      regexp = new RegExp(regexparg, flags);
    } catch {
      term.writeln([
        bold("Error:"),
        "invalid regexp passed"
      ].join(" "));
      return;
    }
  }

  try {
    const lsout = await requestLs(shell.cwd) as Entries;

    for (const entry of lsout) {
      if (regexp.test(entry.name)) {
        term.writeln(
          (entry.kind == "dir" ? "d" : "f")
          +
          " ".repeat(2)
          +
          entry.name
        );
      }
    }
  } catch (e) {
    term.writeln(String(e));
  }
}

export async function rm({ shell }: Context, args: string[], term: Terminal) {
  if (args.length < 1 || args.length > 2) {
    term.writeln([
      bold("rm"),
      "only expects at most",
      bold("2"),
      "arguments and at least",
      bold("1"),
      "argument. Found ",
      bold(args.length.toString()),
    ].join(" "));
    return;
  }

  const dir = args[0];
  const rf = args[1] == "-rf";

  try {
    await requestRm(shell.cwd, dir, rf);
  } catch (e) {
    term.writeln(String(e));
  }
}