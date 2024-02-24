import { VariableGetter } from "./core";

type ParamType = number | string;

// Helper function to determine if a string is numeric
function isNumeric(str: string): boolean {
  return !isNaN(str as any) && !isNaN(parseFloat(str));
}

function isOperator(c: string): boolean {
  return ['+', '-', '*', '/'].includes(c);
}

// Returns the precedence of an operator
function precedence(op: string): number {
  switch (op) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    default:
      return 0;
  }
}

// Converts an infix expression to Polish notation (prefix notation)
function toPolishNotation(infix: string): string[] {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  const tokens = infix.split(/\s+/);

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

export default function numericEval(expression: string, memory: VariableGetter): number {
  // Convert to Polish notation first (placeholder implementation)
  const polishNotation = toPolishNotation(expression);

  function evaluate(tokens: string[]): number {
    const stack: number[] = [];

    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (["+", "-", "*", "/"].includes(token)) {
        const a = stack.pop();
        const b = stack.pop();
        if (a === undefined || b === undefined) throw new Error("Invalid expression");
        switch (token) {
          case "+": stack.push(a + b); break;
          case "-": stack.push(a - b); break;
          case "*": stack.push(a * b); break;
          case "/": stack.push(a / b); break;
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
