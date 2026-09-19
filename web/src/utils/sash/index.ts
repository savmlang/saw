import type { Terminal } from "@xterm/xterm";
import { createColors } from "colorette"
import { Prompt } from "./prompt";
import { cd, clear, cwd, help, notfound, pwd } from "./core";
import { savmWasmRuntime } from "../wasm";
import { sasm } from "./sasm";
import { ls, mkdir, rm } from "./fop";

export const { green, underline, bold, dim, yellow, blue } = createColors({
  useColor: true,
});

export class SaShell {
  public term: Terminal;

  public cwdRaw: string[] = [];
  public askPrompt: Prompt;

  getLeafForCwd(leaf: string) {
    const cwd = this.cwd;

    return cwd == "/" ? `/${leaf}` : `${cwd}/${leaf}`;
  }

  public get cwd(): string {
    return "/" + this.cwdRaw.join("/");
  }

  public set cwd(data: string) {
    const nextRaw = data.startsWith("/") ? [] : [...this.cwdRaw];

    const parts = data.split("/").filter(Boolean);

    for (const part of parts) {
      if (part == '.') {
        continue;
      }
      if (part == "..") {
        if (this.cwdRaw.length) {
          nextRaw.pop();
        } else {
          throw "cannot traverse above root `/`";
        }
        continue
      }

      nextRaw.push(part);
    }

    this.cwdRaw = nextRaw;
  }

  constructor(xterm: Terminal) {
    this.term = xterm;
    this.askPrompt = new Prompt(xterm);
  }

  launch() {
    this.term.writeln(`⚡ SaVM Runtime v0.4.2 ${underline("[wasm32-emscripten]")}`);
    this.term.writeln(bold("This is a basic web shell"));
    this.term.writeln(`Run ${underline("help")} for a list of commands.`);
    this.term.writeln("");

    savmWasmRuntime.attachTerminal(this.term);

    // The terminal keeps on receiving prompts!
    (async () => {
      while (true) {
        await this.shellprompt();
      }
    })()
  }

  async shellprompt() {
    const term = this.term;

    const prefix = `${green("sashell")} ${this.cwd}${bold("❯")} `;
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
        case "pwd":
          return pwd;
        case "cwd":
          return cwd;
        case "cd":
          return cd;
        case "ls":
          return ls;
        case "rm":
          return rm;
        case "mkdir":
          return mkdir;
        case "sasm":
          return sasm;
        default:
          return notfound;
      }
    })();
    await f({ prompt, shell: this }, args, term);
  }

}

export type Context = { prompt: string, shell: SaShell };