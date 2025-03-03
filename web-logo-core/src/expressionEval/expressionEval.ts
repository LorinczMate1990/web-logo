import { isStructuredMemoryData, ParamType, StructuredMemoryData, VariableGetter } from "../types";
import { isArrayToken, isNumeric, builtinFunctions, executeBinaryOperator, executeUnaryOperator, isBuiltinFunction, isOperator, isStrictlyUnaryOperator, precedence } from "./operators";
import { stringToArrayAndCharToNumberConverter } from "./stringConverter";
import toPolishNotation from "./toPolishNotation";

export function expressionEval(expression: string, memory: VariableGetter): ParamType {
  // Convert to Polish notation first (placeholder implementation)
  expression = expression.trim();
  expression = stringToArrayAndCharToNumberConverter(expression);
  const polishNotation = toPolishNotation(expression);
  return evaluatePolishForm(polishNotation, memory);
}

// TODO: Most of the files should be moved in other files
// but expressionEval is referenced from them
// Solution: Add expressionEval as a parameter to functions using it
// It could be a generic expressionEval at their level
// Other approach: OOP
// Lots of variables are common (memory for example is needed from many places)
// So a nice class hierarchy with DI could be also nice
function evaluatePolishForm(tokens: string[], memory: VariableGetter): ParamType {
  const stack: ParamType[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (isOperator(token)) {
      handleOperator(stack, token);
    } else if (isBuiltinFunction(token)) {
      handleBuiltinFunctions(stack, token);
    } else if (isNumeric(token)) {
      stack.push(parseFloat(token));
    } else if (isArrayToken(token)) {
      handleArrays(stack, token, memory);
    } else {
      handleVariableNames(stack, token, memory);
    }
  }
  if (stack.length !== 1) throw new Error(`Invalid expression. The stack is: ${stack.length}`);
  return stack[0];
}

function handleOperator(stack: ParamType[], token: string) {
  let a = stack.pop();
  if (stack.length === 0 || isStrictlyUnaryOperator(token)) {
    stack.push(executeUnaryOperator(token, a));
  } else {
    const b = stack.pop();
    stack.push(executeBinaryOperator(token, a, b));
  }
}

function handleBuiltinFunctions(stack: ParamType[], token: string) {
  const func = builtinFunctions[token];
  const params: ParamType[] = [];
  for (let i = 0; i < func.params; ++i) {
    const param = stack.pop();
    if (param === undefined) throw new Error("Invalid expression at builtin function");
    params.push(param);
  }
  stack.push(func.function(params));
}

function handleArrays(stack: ParamType[], token: string, memory : VariableGetter) {
  // Have to split on , when they are not inside of a ( ) or nested [ ] or " "
  const elements = splitArrayToElements(token.slice(1, token.length - 1));
  let evaluatedArray = new StructuredMemoryData([]);
  for (const element of elements) {
    const evaluatedElement = expressionEval(element, memory);
    (evaluatedArray.data as ParamType[]).push(evaluatedElement);
  }
  stack.push(evaluatedArray);
}

function splitArrayToElements(array: string): string[] {
  const elements: string[] = [];
  const environmentStack: string[] = []; // TODO Similar aproach would be better for tokenizer
  let inString = false;
  let currentElement = "";
  for (let i = 0; i < array.length; ++i) {
    const c = array[i];
    const pc = (i > 0) ? array[i - 1] : "";

    if (!inString && (c == "(" || c == "[")) {
      environmentStack.push(c);
    }
    if (!inString && (c == ")" || c == "]")) {
      environmentStack.pop(); // Could be tested if the correct is closed, but the tokenizer already did that
    }
    if (!inString && c == "\"") {
      inString = true;
    }
    if (inString && c == "\"" && pc != "\\") {
      inString = false;
    }
    if (!inString && environmentStack.length == 0 && c == ",") {
      elements.push(currentElement);
      currentElement = "";
    } else {
      currentElement += c;
    }

  }
  if (currentElement.trim().length > 0) {
    elements.push(currentElement);
  }
  return elements;
}

function handleVariableNames(stack: ParamType[], token: string, memory : VariableGetter) {
  const variableName = evaluateVariableName(token, memory);
  const variableValue = memory.getVariable(variableName);
  stack.push(variableValue);
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
      if (!isStructuredMemoryData(varValue)) {
        throw new Error(`Variable ${varName} is not a structured memory data.`);
      }
      const possibleStringData = varValue.data;
      if (!Array.isArray(possibleStringData)) {
        throw new Error(`Variable ${varName} doesn't contain an array, can't convert it to string`);
      }
      if (!Array.isArray(possibleStringData)) {
        throw new Error(`Variable ${varName} doesn't contain an array, can't convert it to string`);
      }
      const numericArray = possibleStringData.map(e => {
        if (typeof (e) !== "number") {
          throw new Error(`Variable ${varName} has non-numeric elements, it can not be a string`);
        } else {
          return e;
        }
      })
      return String.fromCharCode(...numericArray);
    }
    return ''; // Default case, should not be reached
  });

  const parts: string[] = [];
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
        parts.push(part + "[");
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
  for (let i = 1; i < parts.length; i += 2) {
    result += String(expressionEval(parts[i], getter));
    result += parts[i + 1];
  }

  return result;
}