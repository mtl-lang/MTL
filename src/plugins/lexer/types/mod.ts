export type Memory = {
  source: string;
  tokens: Token[];
  current_token: string | Array<string>;
  position: {
    line: number;
    column: number;
  };
  mode: Mode;
};

export type Trace = {
  line: number;
  column: [number, number];
};
export const enum Mode {
  Token = 1,
  String = 2,
  Compiler = 3,
}

export type IterationData = [number, string];

export type Token = {
  type:
    | "keyw"
    | "plus"
    | "sub"
    | "div"
    | "mod"
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
    | "eol";
  value: string | string[];
  trace: {
    line: number;
    //       start    end
    column: [number, number];
  };
};

export type LexerToken = Token[];
