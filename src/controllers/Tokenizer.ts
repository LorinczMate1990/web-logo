import { TooManyClosingBraceletError, TooManyClosingBracketError, UnclosedBraceletError, UnclosedBracketError } from "./errors";

export class Token {
  lineNumber : number;
  charNumber : number;
  val : string;

  constructor(val : string, lineNumber : number, charNumber : number) {
    this.val = val;
    this.lineNumber = lineNumber;
    this.charNumber = charNumber;
  }

  // Override the toString method to return the primitive string value
  toString() {
    return this.val;
  }

  push(c : string) {
    this.val += c;
  }

  get length() {
    return this.val.length;
  }

  eq(c : string) {
    return this.val === c;
  }

}

export function tokenizer(command: string): Token[] {
  let lineCounter = 0;
  let charCounter = 0;
  let tokens: Token[] = [];
  let currentToken: Token = new Token("", lineCounter, charCounter);
  let braketCounter = 0;
  let braceletCounter = 0;

  function startNewToken() {
    tokens.push(currentToken);
    currentToken = new Token("", lineCounter, charCounter);
  }

  for (let i = 0; i < command.length; ++i) {
    charCounter++;
    const c = command[i];
    if (c == " " && braketCounter == 0) {
      startNewToken();
    } else if (c == "\n") {
      charCounter = 0;
      lineCounter += 1;
      if (braketCounter > 0) throw new UnclosedBracketError(lineCounter);
      startNewToken();
      currentToken = new Token("\n", lineCounter, charCounter);;
      startNewToken();
    } else if (c == "(") {
      braketCounter++;
      if (braketCounter > 1) {
        currentToken.push(c);
      }
    } else if (c == ")") {
      braketCounter--;
      if (braketCounter < 0) throw new TooManyClosingBracketError(lineCounter, charCounter);
      if (braketCounter > 0) currentToken.push(c);
      if (braketCounter == 0) startNewToken();
    } else if (c == "{" || c == "}") {
      if (braketCounter == 0) {
        if (c == "{") {
          braceletCounter++;
        } else {
          braceletCounter--;
        }
        if (braceletCounter < 0) throw new TooManyClosingBraceletError(lineCounter, charCounter);
        startNewToken();
        currentToken = new Token(c, lineCounter, charCounter);;
        startNewToken();
      } else {
        currentToken.push(c);
      }
    } else {
      currentToken.push(c);
    }
  }
  startNewToken();
  if (braketCounter > 0) throw new UnclosedBracketError(lineCounter);
  if (braketCounter > 0) throw new UnclosedBraceletError(lineCounter);
  return filterTokens(tokens);
}

export function filterTokens(tokens : Token[]) : Token[] {
  const nonEmptyTokens = tokens.filter((t) => t.length > 0);
  const nonEmptyLines : Token[] = [];
  let emptyLine = true;
  for (const token of nonEmptyTokens) {
    if (token.eq("\n") && emptyLine) continue;
    emptyLine = token.eq("\n");
    nonEmptyLines.push(token);
  }
  if (nonEmptyLines.length > 0 && nonEmptyLines[nonEmptyLines.length-1].eq("\n")) nonEmptyLines.pop();
  return nonEmptyLines;
}