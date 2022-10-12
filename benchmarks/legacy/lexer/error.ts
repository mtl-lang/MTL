import { bold, cyan, red, Stack } from "./export.ts";
export function throwErr(
  err: string,
  stack: Stack,
  fileString: string,
  data?: string,
) {
  const fileLines = fileString.split("\n");
  // Print (and underline) the errored line in context
  let msg = ``;
  for (let i = -2; i < 3; i++) {
    if (fileLines[stack.lineNum + (i - 1)] != undefined) {
      msg += `  ${`${stack.lineNum + i}${stack.lineNum + i < 10 ? " " : ""}| ${
        fileLines[stack.lineNum + (i - 1)]
      }`}\n`;
      if (i === 0) {
        msg += `      ${" ".repeat(stack.colStart)}${
          red(bold("^")).repeat(stack.colEnd - stack.colStart)
        }\n`;
        msg += `${data ? cyan(`      hint: ${data}\n`) : ""}`;
      }
    }
  }

  const e = new Error(`${err}:\n${msg}`);
  // The error stack trace is usless to the developer, so we'll remove it
  e.stack = "";
  throw e;
}

export function getStackData(
  fileContents: string,
  lineNum: number,
  seg: string,
): Stack {
  const line = fileContents.split("\n")[lineNum - 1];
  let segIndex;
  switch (seg) {
    case '"':
    case "}":
    case "{":
      segIndex = line.lastIndexOf(seg);
      break;
    default:
      segIndex = line.lastIndexOf(seg);
      break;
  }
  // Check if multiple segments are on the same line
  const colStart = segIndex;
  const colEnd = segIndex + seg.length;
  return {
    lineNum,
    colStart,
    colEnd,
  };
}
