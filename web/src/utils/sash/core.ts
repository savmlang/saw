import type { Terminal } from "@xterm/xterm";
import { bold, underline, type Context } from ".";
import { requestExists } from "../fsService";

const helpData: {
  [key: string]: {
    desc: string,
    optional?: string
  }
} = {
  help: {
    desc: "Shows the help command",
    optional: "{command} can be used to specify the command you need extended help for."
  },
  pwd: {
    desc: "Tells the process working directory"
  },
  cwd: {
    desc: "Tells the working directory."
  },
  cd: {
    desc: "Changes the working directory"
  },
  ls: {
    desc: "Enumerates directory entries",
    optional: "`ls [regexp] [flags]` will only list the items in the directory listing (depth limited to 1 only) only matching the regexp (and optionally regexp flags)."
  },
  rm: {
    desc: "rm [...paths]. `-rf` for directory",
    optional: "`rm <...dirs> -rf` clears also children while `rm` clears only empty directories. None of the two error."
  },
  mkdir: {
    desc: "creates the directory",
    optional: "`mkdir <...names>` creates multiple directories simultaneously"
  },
  clear: {
    desc: "Clears the terminal screen",
    optional: "This command fully clears the terminal screen."
  },
  sasm: {
    desc: "Runs the SaVM Assembler",
  }
};

export async function help(_: Context, args: string[], term: Terminal) {
  if (args.length > 1) {
    term.writeln([
      underline("help"),
      "expected at most",
      underline("one"),
      bold("argument"),
      "found",
      underline(args.length)
    ].join(" "));
    return
  }

  if (args[0]) {
    const name = args[0];
    const entry = helpData[name];

    if (!entry) {
      term.writeln([
        underline("help"),
        "could not find",
        underline(name),
      ].join(" "));
      return;
    }

    term.writeln(
      `${underline("Command")}: ${name}`
    );
    term.writeln(
      `${entry.desc}\r\n${entry.optional || ""}`
    );
    return;
  }

  term.writeln(
    [
      bold("Usage: "),
      underline("help"),
      bold("{command}"),
    ]
      .join(" ")
  );
  term.writeln("* indicates `help {command}` provides extended description.");
  term.writeln("");
  Object.entries(helpData)
    .forEach(([name, { desc, optional }]) => {
      const maxl = 9;

      term.writeln(
        name + (optional != undefined ? "*" : " ") + " ".repeat(maxl - name.length) + ": " + desc
      );
    });
}

export async function clear(_: Context, args: string[], term: Terminal) {
  if (args.length) {
    term.writeln([
      underline("clear"),
      "does not take any arguments"
    ].join(" "));
    return;
  }

  term.write("\x1b[2J\x1b[3J\x1b[H");
}

export async function notfound({ prompt }: Context, _: string[], term: Terminal) {
  term.writeln([
    underline(prompt),
    "is not a valid command. That's all we know."
  ].join(" "));
  return;
}

export async function pwd(__: Context, ___: string[], term: Terminal) {
  term.writeln([
    bold("/")
  ].join(" "));
  term.writeln("`pwd` is always fixed.");
  return;
}

export async function cwd({ shell }: Context, ___: string[], term: Terminal) {
  term.writeln([
    bold(shell.cwd)
  ].join(" "));
  return;
}


export async function cd({ shell }: Context, args: string[], term: Terminal) {
  if (args.length != 1) {
    term.writeln([
      "cd takes exactly",
      bold("1"),
      "argument. Found",
      bold(args.length),
      "arguments"
    ].join(" "));
    return
  }

  let old: string = "/";
  try {
    old = shell.cwd;
    shell.cwd = args[0];

    if (!await requestExists(shell.cwd)) {
      throw 'Path does not exist';
    }
  } catch (e) {
    shell.cwd = old;
    if (typeof (e) == 'string') {
      term.writeln([
        bold("Error:"),
        e,
      ].join(" "));
    } else {
      term.writeln(bold("An error occured"));
    }
  }
  return;
}