import type { Terminal } from "@xterm/xterm";
import { bold, underline } from ".";

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
  clear: {
    desc: "Clears the terminal screen",
    optional: "This command fully clears the terminal screen."
  }
};

export function help(_: string, args: string[], term: Terminal) {
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
      `${underline("Command")}: name`
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
  term.writeln("");
  Object.entries(helpData)
    .forEach(([name, { desc }]) => {
      const maxl = 10;

      term.writeln(
        name + " ".repeat(maxl - name.length) + ": " + desc
      );
    });
}

export function clear(_: string, args: string[], term: Terminal) {
  if (args.length) {
    term.writeln([
      underline("clear"),
      "does not take any arguments"
    ].join(" "));
    return;
  }

  term.write("\x1b[2J\x1b[3J\x1b[H");
}

export function notfound(prompt: string, _: string[], term: Terminal) {
  term.writeln([
    underline(prompt),
    "is not a valid command. That's all we know."
  ].join(" "));
  return;
}