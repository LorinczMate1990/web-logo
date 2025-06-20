import { isOperator, precedence } from "./operators.js";
import { tokenize } from "./tokenizer.js";

// Converts an infix expression to Polish notation (prefix notation)
export default function toPolishNotation(infix: string): string[] {
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