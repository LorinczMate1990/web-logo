import { ParamType, VariableGetter } from './types';
import { numericEval, tokenize } from './numericEval';

describe('tokenize', () => {
  it('handles negative numbers', () => {
    const result = tokenize('-5');
    expect(result).toEqual(['-', '5']);
  });

  it('splits numbers and operators correctly', () => {
    const result = tokenize('3+4-5');
    expect(result).toEqual(['3', '+', '4', '-', '5']);
  });

  it('handles spaces around operators and numbers', () => {
    const result = tokenize('3 + 4 - 5');
    expect(result).toEqual(['3', '+', '4', '-', '5']);
  });

  it('separates parentheses from numbers and operators', () => {
    const result = tokenize('(3+4)*5');
    expect(result).toEqual(['(', '3', '+', '4', ')', '*', '5']);
  });

  it('works with mixed spaces and lack thereof around parentheses', () => {
    const result = tokenize('(3 + 4) * 5');
    expect(result).toEqual(['(', '3', '+', '4', ')', '*', '5']);
  });

  it('correctly tokenizes complex expressions', () => {
    const result = tokenize('3 + 4*(2 - 1) / 3 - 5');
    expect(result).toEqual(['3', '+', '4', '*', '(', '2', '-', '1', ')', '/', '3', '-', '5']);
  });

  it('handles empty strings gracefully', () => {
    const result = tokenize('');
    expect(result).toEqual([]);
  });

  it('splits variables and operators correctly', () => {
    const result = tokenize('x+y-z');
    expect(result).toEqual(['x', '+', 'y', '-', 'z']);
  });

  it('handles variables with underscores and numbers', () => {
    const result = tokenize('var_1 + var_2 * 3');
    expect(result).toEqual(['var_1', '+', 'var_2', '*', '3']);
  });

});

describe('numericEval', () => {
  let memoryMock: VariableGetter;

  beforeEach(() => {
    // Setup the mock for Memory before each test
    memoryMock = {
      getVariable: jest.fn((key: string) => {
        const variables: { [key: string]: ParamType } = {
          'x': "5",
          'y': "10",
          'z': "15", // Example of string that is a valid number
          'invalid': "not a number" // Example of invalid variable value
        };
        return variables[key];
      })
    };
  });

  it('evaluates constant expression', () => {
    expect(numericEval('4', memoryMock)).toEqual(4);
  }); 

  it('evaluates constant negative expression', () => {
    expect(numericEval('-4', memoryMock)).toEqual(-4);
  }); 

  it('evaluates constant real number', () => {
    expect(numericEval('3.4', memoryMock)).toEqual(3.4);
  }); 

  it('evaluates constant negative real number', () => {
    expect(numericEval('-3.4', memoryMock)).toEqual(-3.4);
  }); 

  it('evaluates constant expression with space', () => {
    expect(numericEval('   4  ', memoryMock)).toEqual(4);
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
  it('evaluates nested expressions', () => {
    expect(numericEval('( 1 + 1 ) * 2', memoryMock)).toEqual(4);
    expect(numericEval('3 + ( 2 * ( 1 + 0 ) )', memoryMock)).toEqual(5);
  });
  
  it('evaluates nested expressions with variables', () => {
    expect(numericEval('( x + y ) * 2', memoryMock)).toEqual(30);
    expect(numericEval('3 + ( x * ( 2 + y ) )', memoryMock)).toEqual(63);
  });

  it('evaluates nested expressions without spaces', () => {
    expect(numericEval('(1+1)*2', memoryMock)).toEqual(4);
    expect(numericEval('3+(2*(1+0))', memoryMock)).toEqual(5);
  });
  
  it('evaluates nested expressions with variables without spaces', () => {
    expect(numericEval('(x+y)*2', memoryMock)).toEqual(30);
    expect(numericEval('3+(x*(2+y))', memoryMock)).toEqual(63);
  });


  // Add more tests as needed...
});
