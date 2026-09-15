import type { Terminal } from "@xterm/xterm";

export class Prompt {
  public term: Terminal;

  public promptPrefix: string = "";
  public buffer: string = "";
  public cursor: number = 0;
  public history: string[] = [];
  public historyIndex: number = -1;

  public forceyield: string | null = null;

  constructor(term: Terminal) {
    this.term = term;
  }

  forcePrompt(prompt: string) {
    this.forceyield = prompt;
  }

  getPrompt(): Promise<string> {
    const term = this.term;

    this.buffer = "";
    this.cursor = 0;
    this.historyIndex = -1;

    term.write(this.promptPrefix);

    return new Promise((resolve) => {
      let processed = false;

      const disposable = term.onData((data) => {
        const finished = this.handleInput(data);

        if (finished !== null) {
          processed = true;

          disposable.dispose();
          this.term.write("\r\n");

          if (finished.trim().length > 0) {
            this.history.push(finished);
          }

          resolve(finished);
        }
      });

      const interval = setInterval(() => {
        if (processed) {
          clearInterval(interval);
        }

        if (this.forceyield) {
          clearInterval(interval);
          disposable.dispose();
          const finished = this.forceyield;

          this.buffer = finished;
          this.cursor = finished.length;

          this.repaintLine();

          this.history.push(finished);
          this.forceyield = null;

          this.term.writeln("\r\n");
          resolve(finished);
        }
      }, 50);
    });
  }

  private handleInput(data: string): string | null {
    // Enter
    if (data === "\r" || data === "\n") {
      return this.buffer;
    }

    // Backspace
    if (data === "\x7f" || data === "\x08") {
      if (this.cursor > 0) {
        this.buffer =
          this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
        this.cursor--;
        this.repaintLine();
      }
      return null;
    }

    // Escape Sequences
    if (data.startsWith("\x1b")) {
      this.handleEscapeSequence(data);
      return null;
    }

    // Control Keys
    if (data.charCodeAt(0) < 32) {
      this.handleControlKeys(data.charCodeAt(0));
      return null;
    }

    this.buffer =
      this.buffer.slice(0, this.cursor) + data + this.buffer.slice(this.cursor);
    this.cursor += data.length;
    this.repaintLine();

    return null;
  }

  private handleEscapeSequence(seq: string) {
    switch (seq) {
      case "\x1b[D": // Left Arrow
        if (this.cursor > 0) {
          this.cursor--;
          this.term.write("\x1b[1D");
        }
        this.repaintLine();
        break;

      case "\x1b[C": // Right Arrow
        if (this.cursor < this.buffer.length) {
          this.cursor++;
          this.term.write("\x1b[1C");
        }
        this.repaintLine();
        break;

      case "\x1b[H": // Home
      case "\x1b[1~":
        this.term.write("\x1b[2J\x1b[3J\x1b[H");

        this.cursor = 0;
        this.repaintLine();
        break;

      case "\x1b[F": // End
      case "\x1b[4~":
        this.term.write("\x1b[2J\x1b[3J\x1b[H");

        this.cursor = this.buffer.length;
        this.repaintLine();
        break;

      case "\x1b[3~": // Del
        if (this.cursor < this.buffer.length) {
          this.buffer =
            this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1);
          this.repaintLine();
        }
        break;

      case "\x1b[A": // Up Arrow
        this.term.write("\x1b[B");
        if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.buffer = this.history[this.history.length - 1 - this.historyIndex];
          this.cursor = this.buffer.length;

          this.repaintLine();
        }
        break;

      case "\x1b[B": // Down Arrow
        this.term.write("\x1b[A");
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.buffer = this.history[this.history.length - 1 - this.historyIndex];
          this.cursor = this.buffer.length;

          this.repaintLine();
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.buffer = "";
          this.cursor = 0;

          this.repaintLine();
        }
        break;
    }
  }

  private handleControlKeys(code: number) {
    switch (code) {
      case 1: // Ctrl + A
        this.cursor = 0;
        this.repaintLine();
        break;

      case 5: // Ctrl + E
        this.cursor = this.buffer.length;
        this.repaintLine();
        break;

      case 21: // Ctrl + U
        this.buffer = this.buffer.slice(this.cursor);
        this.cursor = 0;
        this.repaintLine();
        break;

      case 23: // Ctrl + W
        const left = this.buffer.slice(0, this.cursor).trimEnd();
        const lastSpace = left.lastIndexOf(" ");
        const cutIndex = lastSpace === -1 ? 0 : lastSpace + 1;
        this.buffer = this.buffer.slice(0, cutIndex) + this.buffer.slice(this.cursor);
        this.cursor = cutIndex;
        this.repaintLine();
        break;

      case 12: // Ctrl + L
        this.term.write("\x1b[2J\x1b[3J\x1b[H");

        this.repaintLine();
        break;
    }
  }

  private repaintLine() {
    this.term.write(`\r${this.promptPrefix}${this.buffer}\x1b[0K`);

    const moveLeft = this.buffer.length - this.cursor;
    if (moveLeft > 0) {
      this.term.write(`\x1b[${moveLeft}D`);
    }
  }
}