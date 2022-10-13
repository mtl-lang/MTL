/*
TODO:
- add column numbers
- implement basic error handling
*/

class Lexer {
  // takes in .mtl file as string
  constructor(source) {
    // removes newline spacing and implements custom token for loaded source
    if (source !== undefined) {
      this.source = source.replace(/(\r\n|\n|\r)/gm, "$");
    }

    this.lexer = {
      tokens: [],
      // built during character lexing
      char_store: "",
      // for error tracing
      position: {
        line: 1,
        column: 0,
      },
      // simple toggle for string mode in lexer
      string: {
        mode: false,
        bypass: false,
      },
    };
  }

  new_source(new_source) {
    this.lexer.tokens = [];
    this.lexer.char_store = "";
    this.lexer.position = {
      line: 1,
      column: 0,
    };
    this.lexer.string.mode = false;
    this.lexer.string.bypass = false;
    this.source = new_source.replace(/(\r\n|\n|\r)/gm, "$");
  }

  // starts lexing .mtl file
  get analyze() {
    for (let i = 0; this.source.length > i; i++) {
      if (this.lexer.string.mode === true) {
        this.process_string(this.source[i], this.lexer);
        continue;
      } else {
        this.interpret(this.source[i], this.lexer);
      }
    }

    // store unstored tokens; used for handling last token of file
    if (this.lexer.char_store.length !== 0) {
      this.identify_token(this.lexer.char_store, this.lexer);
    }

    return this.lexer.tokens;
  }

  // attempts to understand the stream of characters and build keywords
  interpret(char, lexer) {
    const is_quotation = (char === '"');
    if (is_quotation) {
      lexer.string.mode = true;
      return;
    }

    // if we hit a space, it means token has been generated
    if (char === " ") {
      if (lexer.char_store.length === 0 || char === "") {
        return;
      } else {
        this.identify_token(lexer.char_store, lexer);
        lexer.char_store = "";
      }
      // if we didn't hit a space, but instead a special character, it must be seperated from character store
    } else {
      switch (char) {
        case "(":
        case ")":
        case "{":
        case "}":
        case "-":
        case ",":
        case ":":
        case "$": {
          if (lexer.char_store.length !== 0) {
            this.identify_token(lexer.char_store, lexer);
          }
          this.identify_token(char, lexer);
          lexer.char_store = "";
          break;
        }
        default: {
          lexer.char_store += char;
          break;
        }
      }
    }
  }

  // special functioning for interpreting and understanding strings
  process_string(char, lexer) {
    // checks if we've hit a end quote or we're able to pass a quotation (due to escaping with \)
    if (char !== '"' || lexer.string.bypass === true) {
      if (char === "\\") {
        lexer.string.bypass = true;
      } else {
        lexer.string.bypass = false;
      }
      // if nothing special happened, keep reading string
      lexer.char_store += char;

      // once end quotation is hit, tokenize string
    } else {
      lexer.tokens.push({
        token: "string",
        value: lexer.char_store,
        trace: {
          line: lexer.position.line,
          column: { start: 0, end: 0 },
        },
      });
      lexer.string.mode = false;
      lexer.char_store = "";
    }
  }

  // builds identity of all keywords/tokens
  identify_token(token_value, lexer) {
    let type;
    switch (token_value) {
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
      case "$": {
        lexer.position.line += 1;
        type = "eol";
        break;
      }

      // if there was ni match above, check for unique cases
      default: {
        // checks if token is a reference
        if (token_value[0] === "@") {
          // splits up chained collections
          if (token_value.includes(".")) {
            token_value = token_value.split(".");
          }
          type = "ref";
        } // checks if token is a number, without using NaN which can be error prone
        else {
          number_check: {
            const max_decimal_points = 1;
            let decimal_points_found = 0;
            for (let i = 0; token_value.length > i; i++) {
              switch (token_value[i]) {
                case ".": {
                  decimal_points_found += 1;
                  if (decimal_points_found > max_decimal_points) {
                    type = "nan";
                    break number_check;
                  }
                  break;
                }
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9": {
                  continue;
                }
                // if matching number fails, assume it's a variable identifier. (if error, will be caught by parser)
                default: {
                  type = "ident";
                  break number_check;
                }
              }
            }
            type = "number";
          }
        }
        break;
      }
    }

    // push generated token into array
    lexer.tokens.push({
      token: type,
      value: token_value,
      trace: {
        line: lexer.position.line,
        column: { start: 0, end: 0 },
      },
    });
  }
}

export { Lexer };
