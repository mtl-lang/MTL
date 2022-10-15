import { Mode, Token, Trace } from "./types/mod.ts";

/*
A new, more complex approach
on token parsing
*/
export class Lexer {
  source: string = "";
  position: number = 0;
  read_position: number = 0;
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
      this.source = input.replace(/(\r\n|\n|\r)/gm, "&eol") + "&eof";
    }
  }

  get generate() {
    this.position = 0;
    this.read_position = 0;
    this.current_character = "";
    this.token = "";
    this.mode = Mode.Token;

    while ((this.source.length - 1) > this.position) {
      this.next(this.source[this.position]);
    }
    return this.tokens;
  }

  next(character: string) {
    switch (this.mode) {
      case Mode.Token: {
        if (character === '"') {
          this.mode = Mode.String;
          break;
        }
        if (this.isOperator(character) === true) {
          if (this.token.length !== 0) {
            this.checkToken();
            this.token = "";
          }
          this.checkToken(character);
        } else if (character === " ") {
          this.checkToken();
          this.token = "";
        } else {
          this.token += character;
        }
        break;
      }
      case Mode.String: {
        if ((character === '"') && (this.source[this.position - 1] !== "\\")) {
          this.mode = Mode.Token;
          this.createToken("string", this.token);
          this.token = "";
        } else {
          this.token += character;
        }
        break;
      }
    }
    this.position++;
  }

  checkToken(character?: string) {
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
      case "-":
      case "*":
      case "/":
      case "%":
      case "^":
      case "!":
      case "|":
      case ",":
      case ":": {
        type = "op";
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
    this.createToken(type, token);
  }

  private createToken(type: Token["type"], value: Token["value"]) {
    this.tokens.push({
      type,
      value,
      trace: this.trace,
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
