export type Trace = {
  line: number;
  column: [number, number];
};
export const enum Mode {
  Token = 1,
  String = 2,
  Compiler = 3,
}

export type Token = {
  type:
    | "keyw"
    | "add"
    | "sub"
    | "mult"
    | "div"
    | "mod"
    | "power"
    | "not"
    | "pipe"
    | "comma"
    | "colon"
    | "type"
    | "op"
    | "eq"
    | "neq"
    | "geq"
    | "leq"
    | "lcb"
    | "rcb"
    | "lp"
    | "rp"
    | "eol"
    | "ref"
    | "ident"
    | "number"
    | "string"
    | "nan"
    | "eol"
    | "eof";
  value: string | string[];
  trace: Trace;
};
