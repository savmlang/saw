import type { Terminal } from "@xterm/xterm";
import { bold, type Context } from ".";

import { requestLs, requestMkdir, requestRm, requestTouch } from "../fsService";
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
  const targets = args.filter((a) => !a.startsWith("-"));
  const flags = new Set(args.filter((a) => a.startsWith("-")));

  if (targets.length === 0) {
    term.writeln([
      bold("rm"),
      "expects at least",
      bold("1"),
      "target operand",
    ].join(" "));
    return;
  }

  // to OPFS all are same
  const rf = flags.has("-rf") || flags.has("-r") || flags.has("-f");

  const matcher = /^[A-Za-z0-9.]*$/;

  for (const dir of targets) {
    try {
      const dirName = dir;
      if (/^\.*$/.test(dirName)) {
        term.writeln([
          bold("Forbidden"),
          "character:",
          bold(dirName),
        ].join(" "));
        return;
      }

      if (!matcher.test(dirName)) {
        term.writeln([
          bold("Invalid"),
          "dirname: ",
          bold(dirName),
        ].join(" "));
        return;
      }

      await requestRm(shell.cwd, dir, rf);
    } catch (e) {
      term.writeln(String(e));
      return;
    }
  }
}

export async function mkdir({ shell }: Context, args: string[], term: Terminal) {
  if (args.length == 0) {
    term.writeln([
      bold("mkdir"),
      "expects atleast",
      bold("1"),
      "argument.",
    ].join(" "));
    return;
  }

  const matcher = /^[A-Za-z0-9.]*$/;

  for (const dirName of args) {
    if (/^\.*$/.test(dirName)) {
      term.writeln([
        bold("Forbidden"),
        "character:",
        bold(dirName),
      ].join(" "));
      return;
    }

    if (!matcher.test(dirName)) {
      term.writeln([
        bold("Invalid"),
        "dirname: ",
        bold(dirName),
      ].join(" "));
      return;
    }

    try {
      await requestMkdir(shell.cwd, dirName);
    } catch (e) {
      term.writeln(String(e));
      return
    }
  }
}
export async function touch({ shell }: Context, args: string[], term: Terminal) {
  if (args.length == 0) {
    term.writeln([
      bold("mkdir"),
      "expects atleast",
      bold("1"),
      "argument.",
    ].join(" "));
    return;
  }

  const matcher = /^[A-Za-z0-9.]*$/;

  for (const dirName of args) {
    if (/^\.*$/.test(dirName)) {
      term.writeln([
        bold("Forbidden"),
        "character:",
        bold(dirName),
      ].join(" "));
      return;
    }

    if (!matcher.test(dirName)) {
      term.writeln([
        bold("Invalid"),
        "dirname: ",
        bold(dirName),
      ].join(" "));
      return;
    }

    try {
      await requestTouch(shell.cwd, dirName);
    } catch (e) {
      term.writeln(String(e));
      return
    }
  }
}