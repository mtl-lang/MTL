// import some types/const enums to keep source tidy
import { Mode, Token, Trace } from "./types/mod.ts";

/*
note:
  lexer uses zero-based numbering for tracking
  its position and the position of tokens.
*/
export class Lexer {
  source: string = "";
  // lexer position on file
  position: number = -1;
  // virtual position; used for tracking token positions.
  virtual_position: number = -1;
  // keeps track of elementary debug info useful for parser
  trace: Trace = {
    line: 1,
    column: [0, 0],
  };
  // stores current built token
  token: string = "";
  // stores current lexical tokens
  tokens: Token[] = [];
  // stores mode lexer is interpreting in
  mode: Mode = Mode.Token;

  // optional initiator for .mtl source
  constructor(input?: string) {
    if (input !== undefined) {
      this.source = input.replace(/(\r\n|\n|\r)/gm, "&eol") + "&eof ";
    }
  }

  // loads new .mtl source, avoiding reinitializing class
  load(input: string) {
    this.source = input.replace(/(\r\n|\n|\r)/gm, "&eol") + "&eof ";
  }

  // starts generation of lexical tokens
  get generate() {
    this.position = -1;
    this.virtual_position = -1;
    this.token = "";
    this.mode = Mode.Token;

    // basic character loop
    while ((this.source.length) > this.position) {
      this.comprehend(this.next());
    }
    return this.tokens;
  }

  // used to build an understanding of individual tokens through individual characters
  comprehend(character: string): void {
    // if comprehending new token, store initial `character` location for `trace`
    if (
      (this.token.length === 0) && (this.mode !== Mode.String) &&
      (this.mode !== Mode.Compiler)
    ) {
      this.trace.column[0] = this.virtual_position;
    }
    // verify mode lexer is in
    switch (this.mode) {
      case Mode.Token: {
        // switch to string mode
        if ((character === '"') && (this.token.length === 0)) {
          this.mode = Mode.String;
          break;

          // presume token is finished; generate
        } else if (character === " ") {
          if (this.token.length === 0) return;
          this.checkToken();

          // switch to compiler call mode
        } else if (character === "&") {
          this.mode = Mode.Compiler;
          this.checkToken();

          // check if current character is an operator
        } else if (this.isOperator(character) === true) {
          // handles operator being beside another token
          this.checkToken();
          this.token += character;
          // makes sure column position is accurate for operator
          this.trace.column[0] = this.virtual_position;
          this.checkToken(1);
        } else {
          // if no conditions met, keep building token
          this.token += character;
        }
        break;
      }

      case Mode.String: {
        // check if end of string was reached; switch back to `token` mode
        if ((character === '"')) {
          this.mode = Mode.Token;
          this.trace.column[1] = this.virtual_position;
          this.createToken("string", this.token);

          // check if next character should be escaped
        } else if (character === "\\") {
          this.token += this.next();

          // if no conditions met, keep building string
        } else {
          this.token += character;
        }
        break;
      }

      case Mode.Compiler: {
        this.token += character;

        /*
        - basic checking for end-of-line / end-of-file tokens
        - columns are negative since they don't exist in .mtl file

        TODO:
        - related with the comment on the function far below,
          this source could be configured better to work similarly
          to string / token lexing. works as intended for now.
        */
        switch (checkForString(this.token, ["eol", "eof"])) {
          case "eol": {
            this.trace.column = [-1, -1];
            this.createToken("eol", "*");
            // increment current file line
            this.trace.line += 1;
            // configure virtual position for new line. indexed at -1, as `next` increments to 0
            this.virtual_position = -1;
            break;
          }

          case "eof": {
            this.trace.column = [-1, -1];
            this.createToken("eof", "*");
            break;
          }

          default: {
            // exists for debugging purpose. this error should never occur in normal use
            if (this.token.length > 4) {
              throw new Error(
                `Unexpected compiler token bypassed 4 character limit: ${this.token}`,
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

  // increment ahead `x` tokens
  private next(jump: number = 1) {
    this.virtual_position += jump;
    return (this.source[this.position += jump]);
  }

  // decrement back `x` tokens
  private previous(jump: number = 1) {
    if (this.position === 0) return;
    this.virtual_position -= jump;
    return (this.source[this.position -= jump]);
  }

  // look ahead `x` tokens
  private peek(distance: number = 1) {
    if (this.position >= this.source.length) return " ";
    return this.source[this.position + distance];
  }

  // compare comprehended token to a list of possible values
  private checkToken(offset: number = 0) {
    // sets end column (mainly for pretty error handling in parser)
    this.trace.column[1] = this.virtual_position - 1 + offset;
    let type: Token["type"];
    const token = this.token;
    switch (token) {
      case "const":
      case "mut":
      case "if":
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
        type = "add";
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

  // generates proper token and stores into token list
  private createToken(type: Token["type"], value: Token["value"]) {
    this.tokens.push({
      type,
      value,
      trace: structuredClone(this.trace),
    });
    // simple tidy up
    this.token = "";
  }

  // checks to see if `characer` compares to the list of operators
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
      case "=":
      case ">":
      case "<":
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

/*
TODO:
- replace this function only used for checking compiler calls.
  it works, but could definitely just be replaced directly into
  lexer using same techniques to lex tokens / strings with a
  bit of configuring.
*/
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
