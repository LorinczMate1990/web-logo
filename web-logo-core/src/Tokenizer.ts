import { TooManyClosingBraceletError, TooManyClosingBracketError, TooManyClosingSquareBracketError, UnclosedBraceletError, UnclosedBracketError, UnclosedSquareBracketError } from "./errors.js";

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

type Environment = "string" | "braket" | "squareBraket" | "none" | "comment";

export function tokenizer(command: string): Token[] {
  let lineCounter = 0;
  let charCounter = 0;
  let tokens: Token[] = [];
  let currentToken: Token = new Token("", lineCounter, charCounter);
  let braketCounter = 0;
  let braceletCounter = 0;
  let squareBraketCounter = 0;
  let previousEnvironment : Environment = "none"; 
  let currentEnvironment : Environment = "none";

  function startNewToken() {
    tokens.push(currentToken);
    currentToken = new Token("", lineCounter, charCounter);
  }

  for (let i = 0; i < command.length; ++i) {
    charCounter++;
    const c = command[i];
    if (currentEnvironment == "comment" && c != "\n") {
      // do nothing;
    } else if ((c == '#') && (currentEnvironment == "none" || currentEnvironment == "braket" || currentEnvironment == "squareBraket")) {
      previousEnvironment = currentEnvironment;
      currentEnvironment = "comment";
    } else if (currentEnvironment == "string") {
      currentToken.push(c);
      if (c=="\"" && i>0 && command[i-1] != "\\") {
        currentEnvironment = previousEnvironment;
        if (currentEnvironment == "none") {
          startNewToken();
        }
      }
    } else if (c=="\"") {
      previousEnvironment = currentEnvironment;
      currentEnvironment = "string";
      currentToken.push(c);
    } else if (c == " " && braketCounter == 0 && squareBraketCounter==0) {
      startNewToken();
    } else if (c == "\n") {
      charCounter = 0;
      lineCounter += 1;
      if (braketCounter > 0) throw new UnclosedBracketError(lineCounter);
      if (squareBraketCounter > 0) throw new UnclosedSquareBracketError(lineCounter);
      startNewToken();
      currentToken.push('\n');
      startNewToken();
      if (currentEnvironment == "comment") {
        // previousEnvironment must stay like commenting didn't happened
        currentEnvironment = "none";
      }
    } else if (c == ";" && braketCounter == 0) {
      startNewToken();
      currentToken.push('\n');
      startNewToken();
    } else if (c == "[") {
      if (currentEnvironment == "none") currentEnvironment = "squareBraket";
      squareBraketCounter++;
      currentToken.push(c);
    } else if (c == "]") {
      squareBraketCounter--;
      if (squareBraketCounter < 0) throw new TooManyClosingSquareBracketError(lineCounter, charCounter);
      currentToken.push(c);
      if (squareBraketCounter == 0 && currentEnvironment == "squareBraket") {
        currentEnvironment = "none";
      }
    } else if (c == "(") {
      if (currentEnvironment == "none") currentEnvironment = "braket";
      braketCounter++;
      currentToken.push(c);
    } else if (c == ")") {
      braketCounter--;
      if (braketCounter < 0) throw new TooManyClosingBracketError(lineCounter, charCounter);
      currentToken.push(c);
      if (braketCounter == 0 && currentEnvironment == "braket") {
        currentEnvironment = "none";
      }
    } else if (c == "{" || c == "}") {
      if (braketCounter == 0 && squareBraketCounter == 0) {
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
  if (squareBraketCounter > 0) throw new UnclosedSquareBracketError(lineCounter);
  if (braceletCounter > 0) throw new UnclosedBraceletError(lineCounter);
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