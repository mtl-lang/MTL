export {
  assertArrayIncludes,
  assertThrows,
} from "https://deno.land/std@0.147.0/testing/asserts.ts";

// original lexer
import { lexer } from "./legacy/lexer/lexer.ts";

// new lexer
import { Lexer } from "../src/plugins/lexer/main.js";

/* README:
    This benchmark's syntax was vastly modified and generally
    lacks of lot of MTL's modern keywords such as `while` and
    `elseif` statements to make up for the older lexers error
    handling. import/export syntax demos are also missing due
    to removal of `&` compiler call.

   NOTE:
    Included comments are part of test
*/
const test_tokens = `
# Fizz Buzz example in MTL
mut i: number { 0 }
loop {
  if (@i != 101) {
    if (@i % 15 == 0) {
      @std.println("FizzBuzz")
    }
    if (@i % 3 == 0) {
      @std.println("Fizz")
    }
    if (@i % 5 == 0) {
      @std.println("Buzz")
    }
    else {
      @std.println("@i")
    }
    @i { @i + 1 }
  }
}
`;

/*
NOTE: in this test, lexer v1 has broken syntax
      due to Lydo error handling. It sees the v1
      source as valid.
*/
const test_tokens_v1 = `
# seperate syntax test
const userinput: number { 
  @std.to_number(@std.input()"Please enter a number: "))
}
  
if (@power_of_two(@userinput) == true) {
  @std.println(""@userinput is")
}
else {
  @std.println("@userinput is")
}
`;

const test_tokens_v2 = `
# seperate syntax test
const userinput: number { 
  @std.to_number(
    @std.input("Please enter a number: ")
  )
}
  
if (@power_of_two(@userinput) == true) {
  @std.println("Yay! @userinput is ^2")
}
else {
  @std.println("@userinput is NOT ^2")
}
`;

Deno.bench("Lexer v1", { group: "timing", baseline: true }, () => {
  lexer(test_tokens);
  lexer(test_tokens_v1);
});

Deno.bench("Lexer v2", { group: "timing" }, () => {
  const lexer_v2 = new Lexer(test_tokens);
  lexer_v2.analyze;
  lexer_v2.new_source(test_tokens_v2);
  lexer_v2.analyze;
});
