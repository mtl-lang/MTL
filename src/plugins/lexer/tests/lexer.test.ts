import { Mode, Token } from "../types/mod.ts";
import {
  assertArrayIncludes,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";

import { Lexer } from "../mod.ts";

// grabs test file directory
const __dirname = new URL(".", import.meta.url).pathname;

// load test file
const tests = JSON.parse(
  Deno.readTextFileSync(`${__dirname}/samples/basic/tests.json`),
);

const lexer = new Lexer(
  Deno.readTextFileSync(`${__dirname}/samples/basic/collections.mtl`),
);
Deno.test("[Lexer] Basic", () => {
  console.log(lexer.generate);
});
