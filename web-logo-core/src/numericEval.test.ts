import { ParamType, VariableGetter } from './types';
import { evaluateVariableName, numericEval, tokenize } from './numericEval';

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

  it('handles structured variables without expressions', () => {
    const result = tokenize('a[23].b+c');
    expect(result).toEqual(['a[23].b', '+', 'c']);
  });

  it('handles structured variables', () => {
    const result = tokenize('a[23+34].b+c');
    expect(result).toEqual(['a[23+34].b', '+', 'c']);
  });

  it('handles structured variables with spaces', () => {
    const result = tokenize('a[23 + 34].b+c');
    expect(result).toEqual(['a[23 + 34].b', '+', 'c']);
  });

  it('handles structured variables - 2', () => {
    const result = tokenize('a[23 + 34]+c');
    expect(result).toEqual(['a[23 + 34]', '+', 'c']);
  });

  it('handles structured variables - 3', () => {
    const result = tokenize('a[23 + 34][ddd]+c');
    expect(result).toEqual(['a[23 + 34][ddd]', '+', 'c']);
  });

  it('handles structured variables - 4', () => {
    const result = tokenize('a[23 + 34] [ddd]+c');
    expect(result).toEqual(['a[23 + 34]', '[ddd]', '+', 'c']);
  });

  it('handles structured variables with nested indexing', () => {
    const result = tokenize('a[23 + b[3]] [ddd]+c');
    expect(result).toEqual(['a[23 + b[3]]', '[ddd]', '+', 'c']);
  });

});

describe('numericEval', () => {
  let memoryMock: VariableGetter;

  beforeEach(() => {
    // Setup the mock for Memory before each test
    memoryMock = {
      hasVariable: jest.fn((key: string) => {
        return key in ["x", "y", "z", "invalid"];
      }),
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

  it('evaluates constant positive expression', () => {
    expect(numericEval('+4', memoryMock)).toEqual(4);
  }); 

  it('evaluates constant negative expression', () => {
    expect(numericEval('-4', memoryMock)).toEqual(-4);
  }); 

  it('evaluates positive and negative signs', () => {
    expect(numericEval('--++--++--++--++4', memoryMock)).toEqual(4);
  }); 

  it('evaluates positive and negative signs - 2', () => {
    expect(numericEval('--+-+--++--++--++4', memoryMock)).toEqual(-4);
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

  it('evaluates logical negation', () => {
    expect(numericEval('!4', memoryMock)).toEqual(0);
  }); 

  it('evaluates double logical negation', () => {
    expect(numericEval('!!4', memoryMock)).toEqual(1);
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
});

describe('evaluateVariableName', () => {
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ["foo", "num", "str", "foo.arr[0]"];
    },
    getVariable: (name: string): string => {
      const variables: { [key: string]: string } = {
        'foo': JSON.stringify({ bar: { spam: "42" }, arr: ["1", "2", "3"] }),
        'num': '5',
        'str': 'hello',
        'foo.arr[0]': '1'
      };
      return variables[name] || "";
    }
  };

  it('evaluates static variable name', () => {
    expect(evaluateVariableName('foo.bar.spam', mockGetter)).toBe('foo.bar.spam');
  });

  it('evaluates expressions within [ and ] variable name', () => {
    expect(evaluateVariableName('foo.arr[ 1 ]', mockGetter)).toBe('foo.arr[1]');
    expect(evaluateVariableName('foo.arr[ 1 + 1 ]', mockGetter)).toBe('foo.arr[2]');
  });

  it('evaluates nested indexing', () => {
    expect(evaluateVariableName('foo.arr[ foo.arr[0] ]', mockGetter)).toBe('foo.arr[1]');
  });

  it('evaluates < > and [ ] expressions', () => {
    expect(evaluateVariableName('<str>.length', mockGetter)).toBe('hello.length'); // Example assuming simple substitution
    expect(evaluateVariableName('arr[num]', mockGetter)).toBe('arr[5]'); // Example mixing both types
  });
});

describe('Handle structured variables', () => {
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return true;
    },
    getVariable: (name: string): string => {
      const variables: { [key: string]: string } = {
        'foo.bar.spam': "42",
        'foo.arr[0]': "1",
        'foo.arr[1][1]': "100"
      };
      return variables[name] || `Received: ${name}`;
    }
  };

  it('Reach simple fields - 1', () => {
    expect(numericEval('foo.bar.spam', mockGetter)).toEqual(42);
  });
  it('Reach simple fields - 2', () => {
    expect(numericEval('foo.arr[0]', mockGetter)).toEqual(1);
  });
  it('Reach simple fields - 3', () => {
    expect(numericEval('foo.arr[1][1]', mockGetter)).toEqual(100);
  });
  it('Reach fields based on expression - 1', () => {
    expect(numericEval('foo.arr[32-31][1]', mockGetter)).toEqual(100);
  });
  it('Reach fields based on nested indexing', () => {
    expect(numericEval('foo.arr[foo.arr[0]][1]', mockGetter)).toEqual(100);
  });
});