import { Lexer, lexerState, Stack } from "./export.ts";

export function isIdent(lineNum: number, tokens: Lexer) {
  // Checks if the current seg comes after a keyword (on the same line); i.e if the segment should be an identifier
  const lastToken = tokens[tokens.length - 1];
  if (
    lastToken?.token === "KEYW" &&
    (lastToken?.value === "const" || lastToken?.value === "mut") &&
    lastToken?.stack.lineNum === lineNum
  ) {
    return true;
  } else return false;
}

export function isOperator(seg: string) {
  switch (seg) {
    case "+":
    case "-":
    case "*":
    case "**":
    case "/":
    case "^":
    case "%":
    case ":":
    case ">=":
    case "<=":
    case ">":
    case "<":
    case "==":
    case "!=":
    case "&&":
    case "||":
      return true;
    default:
      return false;
  }
}

export function isType(seg: string) {
  switch (seg) {
    case "string":
    case "undetermined":
    case "collection":
    case "none":
    case "number":
      return true;
    default:
      return false;
  }
}

export function isKeyword(seg: string) {
  switch (seg) {
    case "const":
    case "mut":
    case "if":
    case "else":
    case "loop":
    case "exit":
      return true;
    default:
      return false;
  }
}

export function appendWhitesapce(
  fileLines: string[],
  token: string,
  lineNum: number,
  space = true,
) {
  // Helper function; Appends newline or space to token when necessary

  if (!token) {
    token = fileLines[lineNum - 1] === "" ? "\n" : " ";
  }
  if (fileLines[lineNum - 1].startsWith(token)) token = `\n${token}`;
  else token = `${space ? " " : ""}${token}`;
  return lexerState.string.value + token;
}

export function getTokenStackData(
  fileLines: string[],
  tokens: Lexer,
  lineNum: number,
  tokenValue: string,
): Stack {
  // Helper function; Gets the stack data for a specific token

  // How many identical token *values* are on this line BEFORE the one we care about
  const index = tokens.filter((x) => {
    return lineNum === x.stack.lineNum && x.value === tokenValue;
  });
  let colStart = 0;
  let colEnd = 0;
  const line = fileLines[lineNum - 1];
  if (index.length === 0) {
    // If there are no identical tokens on this line, we'll just find the token's index on the line to find its column
    // Colums (alike lines) are 1-indexed, so we'll add one to the index
    colStart = line.indexOf(tokenValue) + 1;
    colEnd = colStart + tokenValue.length;
    return {
      lineNum: lineNum,
      colStart: colStart,
      colEnd: colEnd,
    };
  } else {
    // If there's multiple instances, we'll have to split the line up by the token's value
    // We want to keep the token's value in the array so we can find the column later
    let re;
    if (line) {
      const sterilized = tokenValue.replace(
        /[-[/\]{}()*+?.,\\^$|#\s]/g,
        "\\$&",
      );
      re = new RegExp(`(${sterilized})`, `g`);
      let matches = -1;
      line.split(re).some((x) => {
        /*
          Our goal is to skip through the line untill we find the token's value. When we do, we'll count it as a match.
          Once the number of matches is equal to the number of value instances (Before the one we care about), we'll know we've
          found the correct token. We'll add the length of each line segment before, and add them to get our column number
          */
        if (x === tokenValue) matches++;
        if (matches === index.length) {
          // 1-indexed column
          colStart++;
          return true;
        }
        colStart += x.length;
        return false;
      });
      colEnd = colStart + tokenValue.length;
      return {
        lineNum: lineNum,
        colStart: colStart,
        colEnd: colEnd,
      };
    } else {
      return {
        lineNum: lineNum,
        colStart: 0,
        colEnd: 0,
      };
    }
  }
}
