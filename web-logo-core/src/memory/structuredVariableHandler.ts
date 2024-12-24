import { numericEval } from "../numericEval";
import { AbstractMemory, ParamType, VariableGetter, VariableSetter } from "../types";

export function isStructuredVariableName(name: string): boolean {
  return name.includes('.') || name.includes('[') || name.includes(']');
}

export function getBaseVariableName(variablePath: string): string {
  // Match the beginning of the string up to the first dot or opening square bracket
  const match = variablePath.match(/^[^.[]+/);
  return match ? match[0] : variablePath;
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
      if (typeof varValue !== 'string') {
        throw new Error(`Variable ${varName} is not a string.`);
      }
      return varValue;
    }
    return ''; // Default case, should not be reached
  });
}

export function getDataMember(variablePath: string, variable: object): string {
  // Split the variablePath into parts to handle dot and bracket notations
  const parts = variablePath.split(/\.|\[|\]/).filter(Boolean);

  // Start traversal from the variable, skipping the first part as it represents the variable itself
  let current: any = variable;
  for (const part of parts) { // Skip the first part
    if (current[part] === undefined) {
      throw new Error(`Path ${variablePath} could not be fully resolved.`);
    }
    current = current[part];
  }

  // Check if the final value is an object and stringify it, otherwise convert to string
  return current;
}

export function setDataMember(variablePath: string, value: any, variable: object): void {
  // Enhanced splitting to retain info about array vs. object access
  const parts = variablePath.match(/[^.\[\]]+|\[\d+\]/g);

  if (!parts) {
    throw new Error(`Invalid path: ${variablePath}`);
  }

  let current: any = variable;
  parts.forEach((part, i) => {
    const isArrayAccess = part.startsWith('[') && part.endsWith(']');
    const key = isArrayAccess ? parseInt(part.slice(1, -1), 10) : part; // Convert array index to number

    // If reaching the final part, set the value
    if (i === parts.length - 1) {
      current[key] = value;
    } else {
      const nextPart = parts[i+1];
      const nextIsArrayAccess = nextPart.startsWith('[') && nextPart.endsWith(']');
      const nextKey = nextIsArrayAccess ? parseInt(nextPart.slice(1, -1), 10) : nextPart;
      if (Array.isArray(current) == isArrayAccess) {
        // Option 1: current is an array and key is an array index
        // Option 2: current is an object and key in an object index
        if (nextIsArrayAccess != Array.isArray(current[key]) || current[key] === undefined) {
          current[key] = nextIsArrayAccess? [] : {};
        }
      } else {
        // Option 3: current is an array and key is an object index
        // Option 4: current is an object and key in an array index
        // TODO Test case: I am not sure if the first element differs
        throw new Error("Compiler error: This is impossible scenario.")
      }
      current = current[key];
    }
  });
}
