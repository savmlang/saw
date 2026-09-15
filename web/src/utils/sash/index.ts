import type { Terminal } from "@xterm/xterm";
import { createColors } from "colorette"
import { Prompt } from "./prompt";
import { clear, help, notfound } from "./core";

export const { green, underline, bold, dim, yellow, blue } = createColors({
  useColor: true,
});

export class SaShell {
  public term: Terminal;

  public cwd = "/";
  public askPrompt: Prompt;

  constructor(xterm: Terminal) {
    this.term = xterm;
    this.askPrompt = new Prompt(xterm);
  }

  launch() {
    this.term.writeln(`⚡  SaVM Runtime v0.4.2 ${underline("[wasm32-emscripten]")}`);
    this.term.writeln(bold("This is a basic web shell"));
    this.term.writeln(`Run ${underline("help")} for a list of commands.`);
    this.term.writeln("");

    // The terminal keeps on receiving prompts!
    (async () => {
      while (true) {
        await this.shellprompt();
      }
    })()
  }

  async shellprompt() {
    const term = this.term;

    const prefix = `${blue("savm")}:~${this.cwd}${bold("❯")} `;
    this.askPrompt.promptPrefix = prefix;

    const promptData = (await this.askPrompt.getPrompt()).trim();

    if (!promptData.length) {
      return;
    }

    const [prompt, ...args] = promptData.split(" ");

    const f = (() => {
      switch (prompt) {
        case "help":
          return help;
        case "clear":
          return clear;
        default:
          return notfound;
      }
    })();
    f(prompt, args, term)
  }

}