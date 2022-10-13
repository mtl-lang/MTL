import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";

import { Lexer } from "../main.js";

/*
Basic tests to guarentee lexer is interpreting collections properly
*/

// grabs test file directory
const __dirname = new URL(".", import.meta.url).pathname;

const lexer = new Lexer();
Deno.test("[BASIC] Token accuracy", async (test) => {
  await test.step("Collections", async (test) => {
    // loads test file
    lexer.new_source(
      Deno.readTextFileSync(__dirname + "samples/basic/collections.mtl"),
    );
    let lexical_data = lexer.analyze;
    console.log(lexical_data)

    lexical_data.forEach((obj) => {
      delete obj["trace"]["column"];
    });
    lexical_data = lexical_data.filter((obj) => {
      return (obj["token"] !== "eol" && obj["token"] !== "eof");
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
    await test.step("Collection", () => {
      assertArrayIncludes(lexical_data.slice(34), [
        { token: "keyw", value: "const", trace: { line: 5 } },
        { token: "ident", value: "grouping", trace: { line: 5 } },
        { token: "op", value: ":", trace: { line: 5 } },
        { token: "type", value: "collection", trace: { line: 5 } },
        { token: "lcb", value: "{", trace: { line: 5 } },
        { token: "ref", value: "@boolean_test", trace: { line: 6 } },
        { token: "op", value: ",", trace: { line: 6 } },
        { token: "ref", value: "@float_test", trace: { line: 7 } },
        { token: "rcb", value: "}", trace: { line: 8 } },
        {
          token: "ref",
          value: ["@grouping", "boolean_test"],
          trace: { line: 9 },
        },
      ]);
    });
  });
});
