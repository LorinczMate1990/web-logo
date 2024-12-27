import { parse } from "path";
import { VariableGetter } from "./types";

// Helper function to determine if a string is numeric
function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

const operators = ['+', '-', '*', '/', '<', '>', '=', '&', '|', '!'];

const builtinFunctions : {[key: string]: {params: number, function: (a:string[]) => number}} = {
  "vecsize": {params: 2, function: (a:string[]) => Math.sqrt(Math.pow(parseFloat(a[0]), 2) + Math.pow(parseFloat(a[1]), 2))},
  'abs': {params: 1, function: (a: string[]) => Math.abs(parseFloat(a[0]))},
  'length': {params: 1, function: (a: string[]) => JSON.parse(a[0]).length},
}

function isOperator(c: string): boolean {
  return operators.includes(c);
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

export function stringEval(expression : string, memory : VariableGetter) : string {
  return expression; // TODO
}

export function numericEval(expression: string, memory: VariableGetter): number {
  // Convert to Polish notation first (placeholder implementation)
  const polishNotation = toPolishNotation(expression);

  function evaluate(tokens: string[]): number {
    const stack: (number | string)[] = [];

    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (isOperator(token)) {
        let a = stack.pop();
        if (typeof a !== "number") throw new Error(`${token} needs numeric input but received ${a}`);
        if (stack.length === 0) {
          if (a==undefined) throw new Error(`Invalid expression. Polish form stack: ${tokens}`);
          switch (token) {
            case "+": stack.push(a); break;
            case "-": stack.push(-a); break;
            case "!": stack.push((a == 0)?1:0); break;
            default: throw new Error(`Invalid expression. Unhandled prefix operator: ${token}`);
          }
        } else {
          const b = stack.pop();
          if (typeof b !== "number") throw new Error(`${token} needs numeric input but received ${a} and ${b}`);
          if (a === undefined || b === undefined) throw new Error(`This exception is impossible, check the core logic itself. Polish form stack: ${tokens}`);
          switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(a / b); break;
            case "=": stack.push(Number(a == b)); break;
            case ">": stack.push(Number(a > b)); break;
            case "<": stack.push(Number(a < b)); break;
            case "&": stack.push(Number(a && b)); break;
            case "|": stack.push(Number(a || b)); break;
            default: throw new Error(`Invalid expression. Unhandled infix operator: ${token}`);
            
          }
        }
      } else if (token in builtinFunctions) {
        const func = builtinFunctions[token];
        const params : string[] = [];
        for (let i=0; i<func.params; ++i) {
          const param = stack.pop();
          if (param === undefined) throw new Error("Invalid expression at builtin function");
          params.push(String(param));
        }
        stack.push(func.function(params));
      } else if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else {
        const variableName = evaluateVariableName(token, memory);
        const variableValue = memory.getVariable(variableName);
        if (typeof variableValue === "number" || typeof variableValue === "string") {
          stack.push(variableValue);
        } else {
          throw new Error(`Variable ${token} is not a number or string. Its value: "${variableValue}"`);
        }
        
      }
    }
    if (stack.length !== 1) throw new Error("Invalid expression");
    if (typeof stack[0] !== "number" && !isNumeric(stack[0])) throw new Error(`The expression is not numeric`);
    if (typeof stack[0] !== "number") stack[0] = parseFloat(stack[0]);
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
      if (typeof varValue !== 'string') {
        throw new Error(`Variable ${varName} is not a string.`);
      }
      return varValue;
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
    result += String(numericEval(parts[i], getter));
    result += parts[i+1];
  }

  return result;

}