import { getStackData, Lexer, lexerState, throwErr } from "./export.ts";

export function checkSyntaxErr(
  fileContents: string,
  tokens: Lexer,
) {
  const fileLines = fileContents.split("\n");
  // Chekcs for various styntax errors, assuming a file has been entirely tokenized
  if (lexerState.string.active) {
    // Checks for unclosed strings
    const line = fileLines[lexerState.string.line - 1];
    let seg = line.split("").splice(line.lastIndexOf('"')).join("");

    if (line[line.lastIndexOf(seg) - 1] === "\\") {
      seg = line.trim();
    }
    throwErr(
      "SYNTAX ERR, UNCLOSED STRING",
      getStackData(
        fileContents,
        lexerState.string.line,
        seg,
      ),
      fileContents,
      `Add closing quote ${seg}"`,
    );
  }

  checkPairs(fileContents, tokens);
  checkPairs(fileContents, tokens, false);
}

function checkPairs(fileContents: string, tokens: Lexer, block = true) {
  const fileLines = fileContents.split("\n");
  const begToken = (block ? "BEG_BLOCK" : "BEG_PARA");
  const endToken = (block ? "END_BLOCK" : "END_PARA");
  // Checks for unclosed/unexpected brackets
  const blocks = tokens.filter((x) =>
    x.token === begToken || x.token === endToken
  );

  if (blocks.length % 2 !== 0) {
    // The ammount of closing blocks doesn't match the amount of opening blocks
    let lineNum = 0;
    let seg = "";
    let msg = "";
    /* Filter out tokens by blocks. This loop is pretty intelligent, and looks to find the true open/unexpected block
     rather than the last one, like most language servers will show. Finding the true errored bracket is surprisingly
     accurate considering the complex nature of this problem.
     */
    for (let i = 1; i <= fileLines.length; i++) {
      const beg = blocks.filter((x) =>
        // We ignore bracket pairs on the same line, since its probable those were intentional
        x.stack.lineNum === i && x.token === begToken
      );
      const end = blocks.filter((x) =>
        x.stack.lineNum === i && x.token === endToken
      );
      if (beg.length === end.length) {
        // We take the first open and last close, going inward until we find the bracket without a pair
        [...beg, ...end].forEach((x) => {
          blocks.splice(blocks.indexOf(x), 1);
        });
      }
    }

    /*
  After going from each end to the middle, we'll take what's left and see which block has more, returning the last of those.
  Standard process would be to simply return the *very* last bracket of the type which there's more, but limiting our
  options down to brackets not on the same line && brackets that are closer to the middle creates more accurate results.
  */
    const beg = blocks.filter((x) => x.token === begToken);
    const end = blocks.filter((x) => x.token === endToken);
    if (beg.length > end.length) {
      lineNum = beg[beg.length - 1].stack.lineNum;
      seg = block ? "{" : "(";
      msg = `UNCLOSED ${block ? "BLOCK" : "PARA"}`;
    } else if (beg.length < end.length) {
      lineNum = end[end.length - 1].stack.lineNum;
      seg = block ? "}" : ")";
      msg = `UNEXPECTED END ${block ? "BLOCK" : "PARA"}`;
    }
    throwErr(
      `SYNTAX ERR, ${msg}`,
      getStackData(fileContents, lineNum, seg),
      fileContents,
      seg === "}"
        ? `Remove unnecessary \`${seg}\``
        : `Add closing ${block ? "block" : "para"} \`${block ? "}" : ")"}\``,
    );
  }
}
