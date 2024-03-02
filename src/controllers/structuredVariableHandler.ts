import { numericEval } from "./numericEval";
import { VariableGetter } from "./types";

export function isStructuredVariableName(name: string): boolean {
  return name.includes('.') || name.includes('[') || name.includes(']');
}

export function evaluateVariableName(name: string, getter: VariableGetter): string {
  const re = /\[.*?]|<.*?>/g; // Regular expression to find expressions within [] and <>
  return name.replace(re, (match) => {
    if (match.startsWith('[')) {
      // Handle numeric expression
      const expression = match.slice(1, -1); // Remove the brackets
      const result = numericEval(expression, getter); // Assuming numericEval is synchronous
      return `[${result}]`; // Preserving brackets as per requirement
    } else if (match.startsWith('<')) {
      // Handle simple variable substitution
      const varName = match.slice(1, -1); // Remove the angle brackets
      const varValue = getter.getVariable(varName);
      console.log({varName, varValue, t: typeof varValue})
      if (typeof varValue !== 'string') {
        throw new Error(`Variable ${varName} is not a string.`);
      }
      return varValue;
    }
    return ''; // Default case, should not be reached
  });
}


export function getStructuredVariableValue(evaluatedName: string, memory: VariableGetter): string {
  const baseNameMatch = evaluatedName.match(/^[\w]+/); // Get the base variable name before . or [
  if (!baseNameMatch) throw new Error("Invalid variable name.");
  const baseName = baseNameMatch[0];
  const jsonString = memory.getVariable(baseName);
  if (typeof jsonString !== "string") throw new Error("TODO A hivatkozott változó nem string");
  
  try {
    const obj = JSON.parse(jsonString);
    const path = evaluatedName.slice(baseName.length).replace(/\[(\w+)]/g, '.$1'); // Convert indices to properties
    const value = path.split('.').reduce((acc, key) => key ? acc[key] : acc, obj);

    if (value === undefined) throw new Error(`Path ${evaluatedName} does not exist.`);
    return typeof value === 'object' ? JSON.stringify(value) : value.toString();
  } catch (error) {
    throw new Error(`Error accessing ${evaluatedName}: ${error}`);
  }
}

