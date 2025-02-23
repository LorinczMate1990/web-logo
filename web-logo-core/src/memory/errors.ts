


export class NonExistingVariableMemoryError extends Error {
  constructor(operation : "read" | "create" | "write", variableName : string) {
    super(`Error during ${operation}: ${variableName} doesn't exists`);
}
}