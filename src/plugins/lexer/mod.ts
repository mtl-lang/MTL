import { Mode, Token, Trace } from "./types/mod.ts";

/*
A new, more complex approach
on token parsing
*/
export class Lexer {
  source: string = "";
  position: number = 0;
  virtual_position: number = 0;
  current_character: string = "";
  trace: Trace = {
    line: 1,
    column: [0, 0],
  };
  token: string = "";
  tokens: Token[] = [];
  mode: Mode = Mode.Token;

  constructor(input?: string) {
    if (input !== undefined) {
      this.source = input.replace(/(\r\n|\n|\r)/gm, "&eol") + "&eof ";
    }
  }

  get generate() {
    this.position = 0;
    this.current_character = "";
    this.resetToken();
    this.mode = Mode.Token;

    this.comprehend(this.source[this.position]);
    while ((this.source.length) > this.position) {
      this.comprehend(this.next());
      this.virtual_position += 1;
    }
    return this.tokens;
  }

  comprehend(character: string): void {
    if (this.trace.column[0] === -1) {
      this.trace.column[0] = this.virtual_position;
    }
    switch (this.mode) {
      case Mode.Token: {
        if (character === '"') {
          this.mode = Mode.String;
          break;
        } else if (character === " ") {
          if (this.token.length === 0) return;
          this.checkToken();
          this.resetToken();
        } else if (character === "&") {
          this.mode = Mode.Compiler;
          this.checkToken();
          this.resetToken();
        } else if (this.isOperator(this.peek()) === true) {
          this.token += character;
          this.checkToken();
          this.resetToken();
        } else {
          if (1 > this.token.length) {
            this.trace.column[0] = this.virtual_position;
          }
          this.token += character;
        }
        break;
      }
      case Mode.String: {
        if ((character === '"')) {
          this.mode = Mode.Token;
          this.createToken("string", this.token);
          this.resetToken();
        } else if (character === "\\") {
          this.token += this.next();
        } else {
          this.token += character;
        }
        break;
      }
      case Mode.Compiler: {
        this.token += character;
        switch (checkForString(this.token, ["eol", "eof"])) {
          case "eol": {
            this.createToken("eol", "*");
            this.trace.line += 1;
            this.virtual_position = -1;
            this.trace.column[0] = -1;
            this.resetToken();
            break;
          }
          case "eof": {
            this.createToken("eof", "*");
            this.resetToken();
            break;
          }
          default: {
            if (this.token.length > 4) {
              throw new Error(
                `Unexpected compiler token bypassed 5 character limit: ${this.token}`,
              );
            } else {
              return;
            }
          }
        }
        this.mode = Mode.Token;
        break;
      }
    }
  }

  private next(jump: number = 1) {
    return (this.source[this.position += jump]);
  }
  private previous(jump: number = 1) {
    if (this.position === 0) return;
    this.virtual_position -= jump;
    return (this.source[this.position -= jump]);
  }
  private peek(distance: number = 1) {
    if (this.position >= this.source.length) return " ";
    return this.source[this.position + distance];
  }
  private resetToken() {
    this.token = "";
  }

  private checkToken(character?: string) {
    let type: Token["type"];
    const token = (character === undefined) ? this.token : character;
    switch (token) {
      case "const":
      case "mut":
      case "if":
      case "elseif":
      case "else":
      case "while":
      case "loop":
      case "true":
      case "false":
      case "expose": {
        type = "keyw";
        break;
      }
      case "string":
      case "number":
      case "boolean":
      case "collection":
      case "unsafe": {
        type = "type";
        break;
      }
      case "+":
        type = "add"
        break;
      case "-":
        type = "sub";
        break;
      case "*":
        type = "mult";
        break;
      case "/":
        type = "div";
        break;
      case "%":
        type = "mod";
        break;
      case "^":
        type = "power";
        break;
      case "!":
        type = "not";
        break;
      case "|":
        type = "pipe";
        break;
      case ",":
        type = "comma";
        break;
      case ":": {
        type = "colon";
        break;
        break;
      }
      case "==": {
        type = "eq";
        break;
      }
      case "!=": {
        type = "neq";
        break;
      }
      case ">=": {
        type = "geq";
        break;
      }
      case "<=": {
        type = "leq";
        break;
      }
      case "{": {
        type = "lcb";
        break;
      }
      case "}": {
        type = "rcb";
        break;
      }
      case "(": {
        type = "lp";
        break;
      }
      case ")": {
        type = "rp";
        break;
      }
      case "": {
        return;
      }
      default: {
        type = "ident";
        break;
      }
    }
    this.trace.column[1] = this.virtual_position;
    this.createToken(type, token);
    this.trace.column[0] = 0;
  }

  private createToken(type: Token["type"], value: Token["value"]) {
    this.tokens.push({
      type,
      value,
      trace: structuredClone(this.trace),
    });
  }

  private isOperator(character: string) {
    switch (character) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
      case "^":
      case "!":
      case "|":
      case ",":
      case ":":
      case "==":
      case "!=":
      case ">=":
      case "<=":
      case "{":
      case "}":
      case "(":
      case ")": {
        return true;
      }
      default: {
        return false;
      }
    }
  }
}

function checkForString(
  string: string,
  matches: Array<string>,
): string | boolean {
  for (let i = 0; matches.length > i; i++) {
    if (string.startsWith(matches[i])) {
      return matches[i];
    } else {
      continue;
    }
  }
  return false;
}
