import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";

import { Lexer } from "../main.js";
const basic_tests = [
  `
  hello world
`,
];

// grabs test file directory
const __dirname = new URL(".", import.meta.url).pathname;

const lexer = new Lexer();
Deno.test("[BASIC] Token accuracy", async (test) => {
  await test.step("Collections", async (test) => {
    lexer.new_source(
      Deno.readTextFileSync(__dirname + "samples/basic/variables.mtl"),
    );
    const lexical_data = lexer.analyze;
    lexical_data.forEach((obj) => {
      delete obj["trace"]["column"];
    });

    await test.step("String", () => {
      assertArrayIncludes(lexical_data.slice(0, 4), [
        {
          token: "keyw",
          value: "const",
          trace: { line: 1 },
        },
        {
          token: "ident",
          value: "string_test",
          trace: { line: 1 },
        },
        {
          token: "op",
          value: ":",
          trace: { line: 1 },
        },
        {
          token: "type",
          value: "string",
          trace: { line: 1 },
        },
      ]);
    });

    await test.step("Boolean", () => {
      assertArrayIncludes(lexical_data.slice(7, 7 + 7), [
        {
          token: "keyw",
          value: "const",
          trace: { line: 2 },
        },
        {
          token: "ident",
          value: "boolean_test",
          trace: { line: 2 },
        },
        {
          token: "op",
          value: ":",
          trace: { line: 2 },
        },
        {
          token: "type",
          value: "boolean",
          trace: { line: 2 },
        },
        {
          token: "lcb",
          value: "{",
          trace: { line: 2 },
        },
        {
          token: "keyw",
          value: "true",
          trace: { line: 2 },
        },
        {
          token: "rcb",
          value: "}",
          trace: { line: 2 },
        },
      ]);
    });
    await test.step("Integer", () => {
      assertArrayIncludes(lexical_data.slice(14, 15 + 9), [
        {
          token: "keyw",
          value: "const",
          trace: { line: 3 },
        },
        {
          token: "ident",
          value: "integer_test",
          trace: { line: 3 },
        },
        {
          token: "op",
          value: ":",
          trace: { line: 3 },
        },
        {
          token: "type",
          value: "number",
          trace: { line: 3 },
        },
        {
          token: "lcb",
          value: "{",
          trace: { line: 3 },
        },
        {
          token: "number",
          value: "10",
          trace: { line: 3 },
        },
        {
          token: "op",
          value: "+",
          trace: { line: 3 },
        },
        {
          token: "op",
          value: "-",
          trace: { line: 3 },
        },
        {
          token: "number",
          value: "10",
          trace: { line: 3 },
        },
        {
          token: "rcb",
          value: "}",
          trace: { line: 3 },
        },
      ]);
    });
    await test.step("Float", () => {
      assertArrayIncludes(lexical_data.slice(24, 24 + 10), [
        {
          token: "keyw",
          value: "const",
          trace: { line: 4 },
        },
        {
          token: "ident",
          value: "float_test",
          trace: { line: 4 },
        },
        {
          token: "op",
          value: ":",
          trace: { line: 4 },
        },
        {
          token: "type",
          value: "number",
          trace: { line: 4 },
        },
        {
          token: "lcb",
          value: "{",
          trace: { line: 4 },
        },
        {
          token: "number",
          value: "3.141592",
          trace: { line: 4 },
        },
        {
          token: "op",
          value: "+",
          trace: { line: 4 },
        },
        {
          token: "op",
          value: "-",
          trace: { line: 4 },
        },
        {
          token: "number",
          value: "6.283185",
          trace: { line: 4 },
        },
        {
          token: "rcb",
          value: "}",
          trace: { line: 4 },
        },
      ]);
    });
  });
});
