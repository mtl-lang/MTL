export type Stack = {
  lineNum: number;
  colStart: number;
  colEnd: number;
};

export type Lexer = Array<{ token: TokenType; value: string; stack: Stack }>;

export type TokenType =
  | "COMMENT"
  | "COMMA"
  | "BEG_BLOCK"
  | "END_BLOCK"
  | "BEG_PARA"
  | "END_PARA"
  | "KEYW"
  | "IDENT"
  | "OP"
  | "TYPE"
  | "LOCAL_CALL"
  | "COMP_CALL"
  | "WHITESPACE"
  | "PIPE"
  | "NUMBER"
  | "STRING";

export type State = {
  string: {
    active: boolean;
    value: string;
    line: number;
  };
};
