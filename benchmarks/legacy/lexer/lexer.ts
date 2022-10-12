import {
  appendWhitesapce,
  checkSyntaxErr,
  getStackData,
  getTokenStackData,
  isIdent,
  isKeyword,
  isOperator,
  isType,
  Lexer,
  State,
  throwErr,
  TokenType,
} from "./export.ts";

export const lexerState: State = {
  string: {
    active: false,
    value: "",
    line: NaN,
  },
};

export const lexer = (fileContents: string): Lexer => {
  const tokens: Lexer = [];

  // We'll run code through the lexer one line at a time
  const fileLines: string[] = fileContents.split("\n");
  fileLines.forEach((l, i) => tokenizeLine(l, i + 1));

  function tokenizeLine(line: string, lineNum: number) {
    // Break each line into spaced segments for easier consumption
    const splitLine = line.split(" ");
    splitLine.forEach((seg) => {
      // We don't care about indents unless it's a string
      if (!lexerState.string.active) line = line.trim();

      // If we're actively parsing a string, we don't want to remove it's whitespace
      if (!lexerState.string.active && !seg.includes('"')) seg.trim();
      // We check for comments first since we don't want to tokenize anything on a commented line
      if (seg === "" && line && !lexerState.string.active) return;
      if (line.startsWith("#")) {
        if (!seg.startsWith("#")) return;
        pushToken("COMMENT", line.substring(1), lineNum);
      } /* Next we look for characters that might not be surrounded by a space, and split them if needed;
             Example: `{@1,@2}` will split into `{`, `@1`, `,`, `@2`, and `}` */
      else if (seg.includes('"') || lexerState.string.active) {
        tokenizeString(seg, lineNum);
      } else if (
        isIdent(lineNum, tokens)
      ) {
        if (seg.includes(":")) {
          splitPunc(":", seg, lineNum);
        } else {
          pushToken("IDENT", seg, lineNum);
        }
      } else if (seg.includes(",") && seg != ",") {
        splitPunc(",", seg, lineNum);
      } else if (seg.includes(")") && seg != ")") {
        splitPunc(")", seg, lineNum);
      } else if (seg.includes("(") && seg != "(") {
        splitPunc("(", seg, lineNum);
      } else if (seg.includes("{") && seg != "{") {
        splitPunc("{", seg, lineNum);
      } else if (seg.includes("}") && seg != "}") {
        splitPunc("}", seg, lineNum);
      } else if (seg.includes("|>") && seg != "|>") {
        splitPunc("|>", seg, lineNum);
      } // After everything is split accordingly, we start identifying actual tokens
      else if (seg === ",") {
        pushToken("COMMA", seg, lineNum);
      } else if (seg == "{") {
        pushToken("BEG_BLOCK", seg, lineNum);
      } else if (seg == "}") {
        pushToken("END_BLOCK", seg, lineNum);
      } else if (seg == "(") {
        pushToken("BEG_PARA", seg, lineNum);
      } else if (seg == ")") {
        pushToken("END_PARA", seg, lineNum);
      } else if (isKeyword(seg)) {
        pushToken("KEYW", seg, lineNum);
      } else if (seg.startsWith("@")) {
        pushToken("LOCAL_CALL", seg, lineNum);
      } else if (seg.startsWith("&")) {
        pushToken("COMP_CALL", seg, lineNum);
      } else if (line.length === 0) {
        pushToken("WHITESPACE", seg, lineNum);
      } else if (seg == "|>") {
        pushToken("PIPE", seg, lineNum);
        // @ts-ignore -- isNaN will accept a string; ts only accepts number
      } else if (!isNaN(seg)) {
        pushToken("NUMBER", seg, lineNum);
      } else if (isOperator(seg)) {
        pushToken("OP", seg, lineNum);
      } else if (
        isType(seg)
      ) {
        pushToken("TYPE", seg, lineNum);
      } else {
        let hint;

        /*
            Since the segment didn't contain any known token, we'll throw an error.
            We know a common source of errors is forgetting the @ before calling an identity,
            so we'll provide a hint message for this case
          */
        const localExists: Lexer[0] | undefined = tokens.find((t) =>
          t.token === "IDENT" && t.value == seg
        );
        if (localExists) {
          hint = `Found identifier @${localExists.value}. Missing @?`;
        }
        throwErr(
          "SYNTAX ERR",
          getStackData(fileContents, lineNum, seg),
          fileContents,
          `${hint ? hint : `Remove unknown value \`${seg}\``}`,
        );
      }
    });
  }

  function splitPunc(punc: string, token: string, line: number) {
    /*
        Helper function; Splits up some sement into actual tokens, then runs them through the lex
        Mainly used for non-spaced segments; See comment in lexLine for more
      */
    const re = new RegExp(`(\\${punc})`, `g`);
    const split = token.split(re);
    split.forEach((x) => {
      if (x) {
        tokenizeLine(x, line);
      }
    });
  }

  function tokenizeString(token: string, lineNum: number) {
    // If we're working with a string, we'll tokenize it seperately
    if (token.startsWith('"') && token !== '"' && !lexerState.string.active) {
      // Beginning of a string
      return splitPunc('"', token, lineNum);
    } else if (token === '"') {
      /*
          If a string isn't surrounded by spaces, it'll get split; this causes the first or last quote to pass through alone

          We'll check if there's string being actively tokenized, and if so, we'll end & push its token; It's a closing quote.
          Otherwise we'll assume it's an opening quote and push it to state
        */
      if (lexerState.string.active) {
        // Check if the closing quote is escaped
        if (lexerState.string.value.endsWith("\\")) {
          updateStrState(
            true,
            appendWhitesapce(fileLines, token, lineNum),
          );
        } else {
          updateStrState(
            true,
            appendWhitesapce(fileLines, token, lineNum, false),
          );
          pushToken("STRING", lexerState.string.value, lexerState.string.line);
          updateStrState(false);
        }
      } else {
        updateStrState(true, token, lineNum);
      }
    } // If the last char in the token is a quote, the string has ended
    else if (
      token.startsWith('"') && token.endsWith('"') && lexerState.string.active
    ) {
      // If we have a token like "hello"", we'll need to split it incase the starting quote is actually an end to a previously active string
      splitPunc('"', token, lineNum);
    } else if (
      token.endsWith('"') && token !== '"' && lexerState.string.active &&
      !lexerState.string.value.endsWith("\n")
    ) {
      updateStrState(
        true,
        appendWhitesapce(fileLines, token, lineNum),
      );

      if (token.indexOf(`\\`) != token.length - 2) {
        // If the last quote isn't escaped, we'll end the string
        pushToken("STRING", lexerState.string.value, lineNum),
          updateStrState(false);
      }
    } else if (token.lastIndexOf('"') > 0) {
      // If there's a quote mid-segment, we'll split it up
      return splitPunc('"', token, lineNum);
    } else if (
      !token ||
      (lexerState.string.active && lexerState.string.value === '"' && token) ||
      lexerState.string.value.endsWith("\n") ||
      lexerState.string.value.endsWith(" ")
    ) {
      // The string is just getting started, or it's a newline; Don't add a space
      updateStrState(
        true,
        appendWhitesapce(fileLines, token, lineNum, false),
      );
    } else if (lexerState.string.active) {
      // The string was split up by its spaces, so add it back
      updateStrState(
        true,
        appendWhitesapce(fileLines, token, lineNum),
      );
    }
  }

  function updateStrState(
    active: boolean,
    data = "",
    lineNum = active ? lexerState.string.line : NaN,
  ) {
    lexerState.string = { active: active, value: data, line: lineNum };
  }

  function pushToken(token: TokenType, value: string, lineNum: number) {
    const stack = getTokenStackData(fileLines, tokens, lineNum, value);
    tokens.push({
      token: token,
      value: value,
      stack: stack,
    });
  }

  checkSyntaxErr(fileContents, tokens);
  return tokens;
};
