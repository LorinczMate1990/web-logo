import { ParamType, VariableGetter } from './core';
import numericEval from './numericEval';

describe('numericEval', () => {
  let memoryMock: VariableGetter;

  beforeEach(() => {
    // Setup the mock for Memory before each test
    memoryMock = {
      getVariable: jest.fn((key: string) => {
        const variables: { [key: string]: ParamType } = {
          'x': 5,
          'y': 10,
          'z': "15", // Example of string that is a valid number
          'invalid': "not a number" // Example of invalid variable value
        };
        return variables[key];
      })
    };
  });

  // Test case for simple arithmetic without variables
  it('evaluates simple arithmetic expressions', () => {
    expect(numericEval('3 + 4', memoryMock)).toEqual(7);
    expect(numericEval('10 / 2', memoryMock)).toEqual(5);
  });

  // Test case for expressions with variables
  it('evaluates expressions with variables', () => {
    expect(numericEval('x + y', memoryMock)).toEqual(15);
    expect(numericEval('x * 2', memoryMock)).toEqual(10);
    // Verifying that getVariable was called with the correct keys
    expect(memoryMock.getVariable).toHaveBeenCalledWith('x');
    expect(memoryMock.getVariable).toHaveBeenCalledWith('y');
  });

  // Test case for expressions with mixed variables and numbers
  it('evaluates expressions with mixed variables and numbers', () => {
    expect(numericEval('x + 10', memoryMock)).toEqual(15);
    expect(numericEval('z / 3', memoryMock)).toEqual(5);
  });

  // Test case for handling invalid variable values
  it('throws an error for invalid variable values', () => {
    expect(() => numericEval('invalid + 5', memoryMock)).toThrow('Variable invalid is not a number.');
  });

  // Test case for nested expressions
  it.skip('evaluates nested expressions', () => {
    expect(numericEval('(1 + 1) * 2', memoryMock)).toEqual(4);
    expect(numericEval('3 + (2 * (1 + 0))', memoryMock)).toEqual(5);
  });
  
  it.skip('evaluates nested expressions with variables', () => {
    expect(numericEval('(x + y) * 2', memoryMock)).toEqual(30);
    expect(numericEval('3 + (x * (2 + y))', memoryMock)).toEqual(63);
  });

  // Add more tests as needed...
});
