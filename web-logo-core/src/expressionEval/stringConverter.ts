function convertToAsciiList(currentToken: string): string {
  if (!currentToken) return '';

  const asciiValues = Array.from(currentToken).map(char => char.charCodeAt(0));
  return asciiValues.join(',');
}

// TODO: Escaped { and } should be escaped as {ascii({)} and {ascii(})}
const tableOfEscapedChars: { [key: string]: string } = {
  '"': '"',
  "n": "\n",
  "t": "\t",
  "r": "\r",
  "\\": "\\",
}

// TODO : Should be split to separate functions
export function stringToArrayAndCharToNumberConverter(expression: string) {
  let currentToken = "";
  let insideString = false;
  let prevChar: string = "";
  let prevPrevChar: string = "";
  let insideChar = false;

  let result = "";

  for (const char of expression) {
    if (insideString) {
      if (char == '"' && (prevChar != "\\" || prevPrevChar == "\\")) {
        const arrayForm = "[" + convertToAsciiList(currentToken) + "]";
        currentToken = "";
        result += arrayForm;
        insideString = false;
      } else {
        if (char == "\\" && prevPrevChar !== "\\") {
          // Do nothing, the next char will be escaped
        } else if (prevChar == "\\" && prevPrevChar != "\\") {
          // Escaped chars
          if (char in tableOfEscapedChars) {
            currentToken += tableOfEscapedChars[char];
          } else {
            throw new Error(`Unknown escape sequence: ${char}`)
          }
        } else {
          currentToken += char;
        }
      }
    } else if (insideChar) {
      if (char == '\\' && prevChar == '\'') {
        prevPrevChar = prevChar;
        prevChar = char;
        continue;
      }
      if (prevChar == '\\') {
        result += tableOfEscapedChars[char].charCodeAt(0).toString();
      } else {
        result += char.charCodeAt(0).toString();
      }
      insideChar = false;
    } else {
      if (char == '"') {
        insideString = true;
      } else {
        if (char == '\'') {
          insideChar = true;
        } else {
          result += char;
        }
      }
    }
    prevPrevChar = prevChar;
    prevChar = char;
  }
  return result;
}