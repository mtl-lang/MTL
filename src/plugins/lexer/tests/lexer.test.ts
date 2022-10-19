import * as colour from "https://deno.land/std@0.160.0/fmt/colors.ts";
import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";

import { Lexer } from "../mod.ts";

// grabs test file directory
const __dirname = new URL(".", import.meta.url).pathname;

// all tests are manually vetted before being utilizied
const tests = JSON.parse(
  Deno.readTextFileSync(`${__dirname}/samples/basic/tests.json`),
);

const lexer = new Lexer();

Deno.test("[Lexer] Basic", () => {
  Object.keys(tests).forEach((test) => {
    assertEquals(
      lexer.load(
        Deno.readTextFileSync(`${__dirname}/samples/basic/${test}.mtl`),
      ).generate,
      tests[test].expected,
    );
    console.log(colour.brightBlue(test) + colour.brightGreen(" \u2713"));
  });
});
