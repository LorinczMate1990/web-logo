import { isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types";

function assertMustBeNumber(op: string, input: ParamType): asserts input is number {
  if (typeof input !== 'number') throw new Error(`Invalid expression. ${op} needs number but got ${input} (${typeof input})`);
}

function assertMustBeStructuredMemoryDataWithArrayContent(op: string, input: ParamType): asserts input is StructuredMemoryData & { data: ParamType[] } {
  if (!isStructuredMemoryData(input) || !Array.isArray(input.data)) throw new Error(`Invalid expression. ${op} needs array but got ${input} (${typeof input})`);
}

export const operators = ['+', '-', '*', '/', '<', '>', '=', '&', '|', '!', ':', '%'];

export function isOperator(c: string): boolean {
  return operators.includes(c);
}

export function isStrictlyUnaryOperator(c: string): boolean {
  return c == '!';
}

export function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

export function isArrayToken(str: string): boolean {
  const trimmed = str.trim();
  return trimmed[0] == "[" && trimmed[trimmed.length - 1] == "]";
}

export function isBuiltinFunction(token: string): boolean {
  return token in builtinFunctions;
}

// Returns the precedence of an operator
export function precedence(op: string): number {
  switch (op) {
    case ':':
      return 5;
    case '!':
      return 6;
    case '&':
    case '|':
      return 7;
    case '<':
    case '>':
    case '=':
      return 8;
    case '+':
    case '-':
      return 9;
    case '*':
    case '/':
    case '%':
      return 10;
    default:
      return 0;
  }
}

export function executeUnaryOperator(op: string, input?: ParamType): ParamType {
  if (input === undefined) throw new Error(`Invalid expression. Polish form is empty.`);
  assertMustBeNumber(op, input);
  switch (op) {
    case "+": return input;
    case "-": return -input;
    case "!": return (input == 0) ? 1 : 0;
    default: throw new Error(`Invalid expression. Unhandled prefix operator: ${op}`);
  }
}

export function executeBinaryOperator(op: string, a?: ParamType, b?: ParamType): ParamType {
  if (a == undefined || b == undefined) throw new Error(`Invalid expression. Polish form is empty.`);
  switch (op) {
    case "+": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a + b;
    }
    case "-": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a - b;
    }
    case "*": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a * b;
    }
    case "/": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a / b;
    }
    case "%": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a % b;
    }
    case "=": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a == b);
    }
    case ">": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a > b);
    }
    case "<": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a < b);
    }
    case "&": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a != 0 && b != 0)
    };
    case "|": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a != 0 || b != 0);
    };
    case ':': {
      assertMustBeStructuredMemoryDataWithArrayContent(op, a);
      assertMustBeStructuredMemoryDataWithArrayContent(op, b);
      a;
      return new StructuredMemoryData([...a.data, ...b.data]);

    }
    default: throw new Error(`Invalid expression. Unhandled infix operator: ${op}`);

  }
}

export const builtinFunctions: { [key: string]: { params: number, function: (a: ParamType[]) => ParamType } } = {
  "vecsize": {
    params: 2,
    function: (a: ParamType[]) => {
      assertMustBeNumber("vecsize", a[0]);
      assertMustBeNumber("vecsize", a[1]);
      return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2))
    }
  },
  'interpolate': {
    params: 3,
    function: (a: ParamType[]) => {
      assertMustBeNumber("interpolate", a[0]);
      assertMustBeNumber("interpolate", a[1]);
      assertMustBeNumber("interpolate", a[2]);
      return a[0]*(1-a[2]) + a[1]*a[2];
    }
  },
  'round': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeNumber("round", a[0]);
      return Math.round(a[0]);
    }
  },
  'floor': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeNumber("floor", a[0]);
      return Math.floor(a[0]);
    }
  },    
  'ceil': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeNumber("ceil", a[0]);
      return Math.ceil(a[0]);
    }
  },    
  'abs': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeNumber("abs", a[0]);
      return Math.abs(a[0]);
    }
  },
  'length': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeStructuredMemoryDataWithArrayContent("length", a[0]);
      return a[0].data.length;
    },
  },
  'pow': {
    params: 2,
    function: (a: ParamType[]) => {
      assertMustBeNumber("vecsize", a[0]);
      assertMustBeNumber("vecsize", a[1]);
      return Math.pow(a[0], a[1])
    }
  },
  'sqrt': {
    params: 1,
    function: (a: ParamType[]) => {
      assertMustBeNumber("vecsize", a[0]);
      return Math.sqrt(a[0])
    }
  },
}