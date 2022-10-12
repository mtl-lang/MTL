NOTE: these tests are simply to show the performance advantages by utilizing individual character lexing.  

Benchmark demostration with new Lexer technique after three consecutive tests.  
At peak, `Lexer v2` performed `3.49x` faster than the original Lexer.  
Over 5 tests, the average performance of `Lexer v2` was `3.38x` faster.  

Improvements that could be made:
- removing the one regex could potentially push performance quite a bit higher.
```
cpu: Intel(R) Core(TM) i5-9300H CPU @ 2.40GHz
runtime: deno 1.26.0 (x86_64-unknown-linux-gnu)

file:///home/lydodev/Documents/github/projects/MTL/benchmarks/lexer.bench.ts
benchmark      time (avg)             (min … max)       p75       p99      p995
------------------------------------------------- -----------------------------
Lexer v1    84.29 µs/iter  (76.55 µs … 610.21 µs)  80.27 µs 182.26 µs 250.69 µs
Lexer v2    24.76 µs/iter  (22.93 µs … 270.37 µs)  23.76 µs  67.78 µs  72.47 µs

summary
  Lexer v1
   3.4x slower than Lexer v2
```
