import { parse } from "path";
import { ArgType, isStructuredMemoryData, ParamType, StructuredMemoryData, VariableGetter } from "./types";
import exp from "constants";

// Helper function to determine if a string is numeric
function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

function assertMustBeNumber(op : string, input : ParamType): asserts input is number {
  if (typeof input !== 'number') throw new Error(`Invalid expression. ${op} needs number but got ${input} (${typeof input})`);
}

function assertMustBeStructuredMemoryDataWithArrayContent(op : string, input : ParamType): asserts input is StructuredMemoryData & { data: ParamType[] }{
  if (!isStructuredMemoryData(input) || !Array.isArray(input.data) )  throw new Error(`Invalid expression. ${op} needs array but got ${input} (${typeof input})`);
}

const operators = ['+', '-', '*', '/', '<', '>', '=', '&', '|', '!'];

const builtinFunctions : {[key: string]: {params: number, function: (a:ParamType[]) => ParamType}} = {
  "vecsize": {
    params: 2, 
    function: (a:ParamType[]) => {
      assertMustBeNumber("vecsize", a[0]);
      assertMustBeNumber("vecsize", a[1]);
      return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2))
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

function isOperator(c: string): boolean {
  return operators.includes(c);
}

function isStrictlyUnaryOperator(c: string): boolean {
  return c == '!';
}

// Returns the precedence of an operator
function precedence(op: string): number {
  switch (op) {
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
      return 10;
    default:
      return 0;
  }
}

function executeUnaryOperator(op : string, input? : ParamType) : ParamType {
  if (input === undefined) throw new Error(`Invalid expression. Polish form is empty.`);
  assertMustBeNumber(op, input);
  switch(op) {
    case "+": return input;
    case "-": return -input;
    case "!": return (input == 0)?1:0;
    default: throw new Error(`Invalid expression. Unhandled prefix operator: ${op}`);
  }
}

function executeBinaryOperator(op : string, a? : ParamType, b? : ParamType) : ParamType {
  if (a == undefined || b == undefined) throw new Error(`Invalid expression. Polish form is empty.`);
  switch (op) {
    case "+": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a+b;
    }
    case "-":{
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a-b;
    }
    case "*": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a*b;
    }
    case "/": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return a/b;
    }
    case "=": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a==b);
    }
    case ">":{
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a>b);
    }
    case "<": {
      assertMustBeNumber(op, a);
      assertMustBeNumber(op, b);
      return Number(a<b);
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
    }
    default: throw new Error(`Invalid expression. Unhandled infix operator: ${op}`);
    
  }
}

function pretokenize(expression: string): string[] {
  const tokens: string[] = [];
  let currentToken: string = '';
  let bracketDepth: number = 0;

  for (const char of expression) {
      if (char === '[') {
          // Entering a new level of brackets
          bracketDepth++;
          currentToken += char;
      } else if (char === ']') {
          // Exiting a level of brackets
          bracketDepth--;
          if (bracketDepth < 0) {
              throw new Error(`Unmatched closing bracket ']' at character: ${char}`);
          }
          currentToken += char;
      } else if (char === ' ' && bracketDepth === 0) {
          if (currentToken !== '') {
            tokens.push(currentToken);
            currentToken = '';
          }
      } else {
          // Add character to the current token
          currentToken += char;
      }
  }

  // Push the last token if it exists
  if (currentToken !== '') {
      tokens.push(currentToken);
  }

  // Check for unclosed brackets
  if (bracketDepth !== 0) {
      throw new Error(`Unclosed opening bracket '['. Remaining depth: ${bracketDepth}`);
  }

  return tokens;
}

export function tokenize(expression: string): string[] {
  const atomicTokens = new Set([...operators, '(', ')', ',']);
  const isAtomicToken = (char: string) => atomicTokens.has(char);

  // Pretokenization: Split at whitespaces
  const pretokens = pretokenize(expression);

  // Finetokenization: Further split tokens if they contain atomic tokens
  const tokens: string[] = [];
  pretokens.forEach(pretoken => {
    let buffer = '';
    let bracketDepth = 0;
    for (const char of pretoken) {
      if (char == '[') {
        bracketDepth++;
      } 
      if (char == ']') {
        bracketDepth--;
      }
      if (isAtomicToken(char) && bracketDepth == 0) {
        if (buffer.length > 0) {
          tokens.push(buffer);
          buffer = '';
        }
        tokens.push(char); // Add the atomic token
      } else {
        buffer += char;
      }
    }
    if (buffer.length > 0) {
      tokens.push(buffer);
    }
  });

  return tokens;
}


// Converts an infix expression to Polish notation (prefix notation)
function toPolishNotation(infix: string): string[] {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  const tokens = tokenize(infix);

  tokens.reverse().forEach(token => {
    if (isOperator(token)) {
      while (
        operatorStack.length > 0 &&
        precedence(operatorStack[operatorStack.length - 1]) > precedence(token)
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    }else if (token === ')') {
      operatorStack.push(token);
    } else if (token === '(' || token === ',') {
      while (operatorStack[operatorStack.length - 1] !== ')') {
        outputQueue.push(operatorStack.pop()!);
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
      }
      if (token === '(') {
        operatorStack.pop(); // Remove the ')'
      }
    } else {
      // Assuming the token is a number or variable
      outputQueue.push(token);
    }
  });

  while (operatorStack.length > 0) {
    if (operatorStack[operatorStack.length - 1] === ')') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(operatorStack.pop()!);
  }

  return outputQueue.reverse();
}


export function expressionEval(expression: string, memory: VariableGetter): ParamType {
  expression = expression.trim();
  if (expression[0] == '[') {
    // Have to split on , when they are not inside of a ( ) or nested [ ] or " "
    const elements = splitArrayToElements(expression.slice(1, expression.length-1));
    let resultArray = new StructuredMemoryData([]);
    for (const element of elements) {
      const evaluatedElement = expressionEval(element, memory);
      (resultArray.data as ParamType[]).push(evaluatedElement);
    }
    return resultArray;
  } else {
    return genericEval(expression, memory);
  }
}

function splitArrayToElements(array : string) : string[] {
  const elements : string[] = [];
  const environmentStack : string[] = []; // TODO Similar aproach would be better for tokenizer
  let inString = false;
  let currentElement = "";
  for (let i=0; i<array.length; ++i) {
    const c = array[i];
    const pc = (i>0)?array[i-1]:"";

    if (!inString && (c == "(" || c=="[")) {
      environmentStack.push(c);
    }
    if (!inString && (c == ")" || c=="]")) {
      environmentStack.pop(); // Could be tested if the correct is closed, but the tokenizer already did that
    }
    if (!inString && c == "\"") {
      inString=true;
    }
    if (inString && c=="\"" && pc!="\\") {
      inString=false;
    }
    if (!inString && environmentStack.length == 0 && c==",") {
      elements.push(currentElement);
      currentElement = "";
    } else {
      currentElement += c;
    }
    
  }
  elements.push(currentElement);
  return elements;
}

function stringEval(expression : string, memory : VariableGetter) : string {
  return expression; // TODO
}

function genericEval(expression: string, memory: VariableGetter): ParamType {
  // Convert to Polish notation first (placeholder implementation)
  const polishNotation = toPolishNotation(expression);

  function evaluate(tokens: string[]): ParamType {
    const stack: ParamType[] = [];

    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (isOperator(token)) {
        let a = stack.pop();
        if (stack.length === 0 || isStrictlyUnaryOperator(token)) {
          stack.push(executeUnaryOperator(token, a));
        } else {
          const b = stack.pop();
          stack.push(executeBinaryOperator(token, a, b));
        }
      } else if (token in builtinFunctions) {
        const func = builtinFunctions[token];
        const params : ParamType[] = [];
        for (let i=0; i<func.params; ++i) {
          const param = stack.pop();
          if (param === undefined) throw new Error("Invalid expression at builtin function");
          params.push(param);
        }
        stack.push(func.function(params));
      } else if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else {
        const variableName = evaluateVariableName(token, memory);
        const variableValue = memory.getVariable(variableName);
        stack.push(variableValue);
        
      }
    }
    if (stack.length !== 1) throw new Error(`Invalid expression. The stack is: ${stack.length}`);
    return stack[0];
  }

  return evaluate(polishNotation);
}

// TODO: I don't like this function, it's very complex
// I also hate that the [ and ] logic is implemented at least twice (pretokenize is the other part)
export function evaluateVariableName(name: string, getter: VariableGetter): string {

  const re = /<.*?>/g; // Regular expression to find expressions within <>. We don't handle nested < and >
  const firstStage = name.replace(re, (match) => {
    if (match.startsWith('<')) {
      // Handle simple variable substitution
      const varName = match.slice(1, -1); // Remove the angle brackets
      const varValue = getter.getVariable(varName);
      if (!isStructuredMemoryData(varValue)) {
        throw new Error(`Variable ${varName} is not a structured memory data.`);
      }
      const possibleStringData = varValue.data;
      if (!Array.isArray(possibleStringData)) {
        throw new Error(`Variable ${varName} doesn't contain an array, can't convert it to string`);
      }
      if (!Array.isArray(possibleStringData)) {
        throw new Error(`Variable ${varName} doesn't contain an array, can't convert it to string`);
      }
      const numericArray = possibleStringData.map(e => {
        if (typeof(e) !== "number") {
          throw new Error(`Variable ${varName} has non-numeric elements, it can not be a string`);
        } else {
          return e;
        }
      })
      return String.fromCharCode(...numericArray);
    }
    return ''; // Default case, should not be reached
  });

  const parts : string[] = [];
  let part = "";
  let bracketCounter = 0;
  for (let char of firstStage) {
    if (char == ']') {
      bracketCounter--;
      if (bracketCounter == 0) {
        parts.push(part);
        part = "";
      }
    }
    if (char == '[') {
      if (bracketCounter == 0) {
        parts.push(part+"[");
        part = "";
        char = "";
      }
      bracketCounter++;
    }
    part += char;
  }
  parts.push(part);

  let result = parts[0];
  // Every second part is between two upper-level []
  // Also there must be odd number of parts. (The upper level closing bracket is a new part)
  for (let i=1; i<parts.length; i+=2) {
    result += String(expressionEval(parts[i], getter));
    result += parts[i+1];
  }

  return result;

}