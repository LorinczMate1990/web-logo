import { isStructuredMemoryData, packToStructuredMemoryData, ParamType, StructuredMemoryData, VariableGetter } from "../types.js";
import { isArrayToken, isNumeric, builtinFunctions, executeBinaryOperator, executeUnaryOperator, isBuiltinFunction, isOperator, isStrictlyUnaryOperator, precedence } from "./operators.js";
import { stringToArrayAndCharToNumberConverter } from "./stringConverter.js";
import toPolishNotation from "./toPolishNotation.js";

const cache: { [index: string]: AtomicInstruction[] } = {};

export function expressionEval(expression: string, memory: VariableGetter): ParamType {
  let compiledPolishNotation : AtomicInstruction[] = [];
  if (expression in cache) {
    compiledPolishNotation = cache[expression];
  } else {
    const polishNotation = getPolishNotation(expression);
    compiledPolishNotation = compilePolishNotation(polishNotation);
    cache[expression] = compiledPolishNotation;
  }
  return evaluatePolishNotation(compiledPolishNotation, memory);
}

function getPolishNotation(expression: string): string[] {
  expression = expression.trim();
  expression = stringToArrayAndCharToNumberConverter(expression);
  const polishNotation = toPolishNotation(expression);
  return polishNotation;
}

type AtomicInstruction = (stack: ParamType[], memory: VariableGetter) => void;

function compilePolishNotation(tokens: string[]): AtomicInstruction[] {
  let instructions: AtomicInstruction[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (isOperator(token)) {
      instructions.push((stack, memory) => handleOperator(stack, token));
    } else if (isBuiltinFunction(token)) {
      instructions.push((stack, memory) => handleBuiltinFunctions(stack, token));
    } else if (isNumeric(token)) {
      instructions.push((stack, memory) => stack.push(parseFloat(token)));
    } else if (isArrayToken(token)) {
      instructions.push((stack, memory) => handleArrays(stack, token, memory));
    } else {
      instructions.push((stack, memory) => handleVariableNames(stack, token, memory));
    }
  }
  return instructions.reverse();
}

function evaluatePolishNotation(instructions: AtomicInstruction[], memory: VariableGetter): ParamType {
  const stack : ParamType[] = [];
  for (let i = instructions.length - 1; i >= 0; i--) {
    const instruction = instructions[i];
    instruction(stack, memory);
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

function handleArrays(stack: ParamType[], token: string, memory: VariableGetter) {
  // Have to split on , when they are not inside of a ( ) or nested [ ] or " "
  const elements = splitArrayToElements(token.slice(1, token.length - 1));
  let isObject = false;
  let isArray = false;
  let evaluatedArray = packToStructuredMemoryData([] as ParamType[]);
  let evaluatedObject = packToStructuredMemoryData({} as {[key : string]: ParamType});
  console.log({elements})
  for (const element of elements) {
    const keyValuePair = getKeyValuePair(element);
    if (Array.isArray(keyValuePair) ) {
      const [key, value] = keyValuePair;
      console.log({key, value})
      const evaluatedValue = expressionEval(value, memory);
      evaluatedObject.data[key] = evaluatedValue;
      isObject = true;
    } else {
      // This is an array
      console.log("Array: ", element)
      const evaluatedElement = expressionEval(element, memory);
      evaluatedArray.data.push(evaluatedElement);
      isArray = true;
    }
  }
  if (isObject && isArray) {
    throw new Error("Mixing arrays and objects is forbidden")
  }
  if (!isObject) { // By default, empty [ ] expressions must be array
    stack.push(evaluatedArray);
  }
  if (isObject) {
    console.log(evaluatedObject)
    stack.push(evaluatedObject);
  }
}

function getKeyValuePair(element : string) : boolean | [string, string] {
  const parts = element.split(':');
  if (parts.length == 1) return false;
  const possibleKey = parts[0];
  if (/^\s*[a-zA-Z][a-zA-Z0-9]*\s*$/.test(possibleKey)) {
    return [possibleKey.trim(), parts.slice(1).join(':')];
  }
  return false;
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

function handleVariableNames(stack: ParamType[], token: string, memory: VariableGetter) {
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