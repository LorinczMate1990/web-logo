import { isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types.js";

export function isStructuredVariableName(name: string): boolean {
  return name.includes('.') || name.includes('[') || name.includes(']');
}

export function getBaseVariableName(variablePath: string): { baseName: string, rest: string } {
  const match = variablePath.match(/^([^.[]+)(.*)$/);
  return {
    baseName: match?.[1] ?? variablePath,
    rest: match?.[2]?.replace(/^\./, '') ?? ''
  };
}

export function getDataMember(variablePath: string, variable: StructuredMemoryData): ParamType {
  // Split the variablePath into parts to handle dot and bracket notations
  const parts = variablePath.split(/\.|\[|\]/).filter(Boolean);

  // Start traversal from the variable, skipping the first part as it represents the variable itself
  let current : ParamType = variable;
  for (let part of parts) { 
    if (!isStructuredMemoryData(current)) throw new Error(`Get primitive data but have more path parts: ${part}`);
    const nextCurrentOrUndef = current.getDataMember(part);
    if (nextCurrentOrUndef == undefined) throw new Error(`Can't get this data, wrong path: ${part}, ${current.data}, isArray: ${Array.isArray(current.data)}`)
    current = nextCurrentOrUndef;
  }

  return current;
}

export function setDataMember(variablePath: string, value: ParamType, variable: StructuredMemoryData): void {
  // Enhanced splitting to retain info about array vs. object access
  const parts = variablePath.split(/\.|\[|\]/).filter(Boolean);

  if (!parts) {
    throw new Error(`Invalid path: ${variablePath}`);
  }

  let current : StructuredMemoryData = variable;
  parts.forEach((part, i) => {
    const isArrayAccess = part.startsWith('[') && part.endsWith(']');
    const key = isArrayAccess ? parseInt(part.slice(1, -1), 10) : part; // Convert array index to number

    // If reaching the final part, set the value
    if (i === parts.length - 1) {
      current.setDataMember(part, value);
    } else {
      const nextElementOrUndef = current.getDataMember(part);
      if (nextElementOrUndef == undefined) {
        const nextPart = parts[i+1];
        // NextPart can be an array indexer or a struct member
        const nextElement = new StructuredMemoryData( StructuredMemoryData.isArrayIndexer(nextPart)?[]:{} );
        current.setDataMember(part, nextElement);
        current = nextElement;
      } else {
        if (!isStructuredMemoryData(nextElementOrUndef)) throw new Error(`Get primitive data but have more path parts: ${part}`);
        current = nextElementOrUndef;
      }
    }
  });
}