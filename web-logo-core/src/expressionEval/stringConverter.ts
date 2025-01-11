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

export function stringToArrayConverter(expression: string) {
  let currentToken = "";
  let insideString = false;
  let prevChar: string = "";
  let prevPrevChar: string = "";

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
          if (!(char in tableOfEscapedChars)) {
            currentToken += tableOfEscapedChars[char];
          } else {
            throw new Error(`Unknown escape sequence: ${char}`)
          }
        } else {
          currentToken += char;
        }
      }
    } else {
      if (char == '"') {
        insideString = true;
      } else {
        result += char;
      }
    }
    prevPrevChar = prevChar;
    prevChar = char;
  }
  return result;
}