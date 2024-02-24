import { TooManyClosingBracketError, UnclosedBracketError } from "./errors";


export function tokenizer(command: string): string[] {
  let lineCounter = 0;
  let charCounter = 0;
  let tokens: string[] = [];
  let currentToken: string = "";
  let braketCounter = 0;

  function startNewToken() {
    tokens.push(currentToken);
    currentToken = "";
  }

  for (let i = 0; i < command.length; ++i) {
    charCounter++;
    const c = command[i];
    if (c == " " && braketCounter == 0) {
      startNewToken();
    } else if (c == "\n") {
      if (braketCounter > 0) throw new UnclosedBracketError(lineCounter);
      startNewToken();
      currentToken = "\n";
      startNewToken();
    } else if (c == "(") {
      braketCounter++;
      if (braketCounter > 1) {
        currentToken += c;
      }
    } else if (c == ")") {
      braketCounter--;
      if (braketCounter < 0) throw new TooManyClosingBracketError(lineCounter, charCounter);
      if (braketCounter > 0) currentToken += c;
      if (braketCounter == 0) startNewToken();
    } else if (c == "{" || c == "}") {
      if (braketCounter == 0) {
        startNewToken();
        currentToken = c;
        startNewToken();
      } else {
        currentToken += c;
      }
    } else {
      currentToken += c;
    }
  }
  startNewToken();
  if (braketCounter > 0) throw new UnclosedBracketError(lineCounter);
  return filterTokens(tokens);
}

export function filterTokens(tokens : string[]) : string[] {
  const nonEmptyTokens = tokens.filter((t) => t.length > 0);
  const nonEmptyLines : string[] = [];
  let emptyLine = true;
  for (const token of nonEmptyTokens) {
    if (token === "\n" && emptyLine) continue;
    emptyLine = token === "\n";
    nonEmptyLines.push(token);
  }
  if (nonEmptyLines[nonEmptyLines.length-1] == "\n") nonEmptyLines.pop();
  return nonEmptyLines;
}