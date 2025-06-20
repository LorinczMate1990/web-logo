import { operators } from "./operators.js";

function isAtomicToken(char: string) {
  const atomicTokens = new Set([...operators, '(', ')', ',']);
  return atomicTokens.has(char);
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