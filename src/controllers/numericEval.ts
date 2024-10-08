import { VariableGetter } from "./types";

// Helper function to determine if a string is numeric
function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

const operators = ['+', '-', '*', '/', '<', '>', '=', '&', '|'];

function isOperator(c: string): boolean {
  return operators.includes(c);
}

// Returns the precedence of an operator
function precedence(op: string): number {
  switch (op) {
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

export function tokenize(expression: string): string[] {
  const atomicTokens = new Set([...operators, '(', ')']);
  const isAtomicToken = (char: string) => atomicTokens.has(char);

  // Pretokenization: Split at whitespaces
  const pretokens = expression.split(/\s+/).filter(token => token !== '');

  // Finetokenization: Further split tokens if they contain atomic tokens
  const tokens: string[] = [];

  pretokens.forEach(pretoken => {
    let buffer = '';
    for (const char of pretoken) {
      if (isAtomicToken(char)) {
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
    } else if (token === ')') {
      operatorStack.push(token);
    } else if (token === '(') {
      while (operatorStack[operatorStack.length - 1] !== ')') {
        outputQueue.push(operatorStack.pop()!);
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
      }
      operatorStack.pop(); // Remove the ')'
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
  console.log({expression, memory });
  
  // Convert to Polish notation first (placeholder implementation)
  const polishNotation = toPolishNotation(expression);

  function evaluate(tokens: string[]): number {
    const stack: number[] = [];

    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (isOperator(token)) {
        const a = stack.pop();
        const b = stack.pop();
        if (a === undefined || b === undefined) throw new Error("Invalid expression");
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
          
        }
      } else if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else {
        const variableValue = memory.getVariable(token);
        if (typeof variableValue === "number") {
          stack.push(variableValue);
        } else if (typeof variableValue === "string" && isNumeric(variableValue)) {
          stack.push(parseFloat(variableValue));
        } else {
          throw new Error(`Variable ${token} is not a number.`);
        }
      }
    }
    if (stack.length !== 1) throw new Error("Invalid expression");
    return stack[0];
  }

  return evaluate(polishNotation);
}
