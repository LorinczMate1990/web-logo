import { ArgType, ParamType, StructuredMemoryData, VariableGetter } from './types';
import { evaluateVariableName, expressionEval, tokenize } from './expressionEval';

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
          'x': 5,
          'y': 10,
          'z': 15, // Example of string that is a valid number
          'invalid': StructuredMemoryData.build_from_string("not a number") // Example of invalid variable value
        };
        return variables[key];
      })
    };
  });

  it('evaluates constant expression', () => {
    expect(expressionEval('4', memoryMock)).toEqual(4);
  }); 

  it('evaluates constant positive expression', () => {
    expect(expressionEval('+4', memoryMock)).toEqual(4);
  }); 

  it('evaluates constant negative expression', () => {
    expect(expressionEval('-4', memoryMock)).toEqual(-4);
  }); 

  it('evaluates positive and negative signs', () => {
    expect(expressionEval('--++--++--++--++4', memoryMock)).toEqual(4);
  }); 

  it('evaluates positive and negative signs - 2', () => {
    expect(expressionEval('--+-+--++--++--++4', memoryMock)).toEqual(-4);
  }); 

  it('evaluates constant real number', () => {
    expect(expressionEval('3.4', memoryMock)).toEqual(3.4);
  }); 

  it('evaluates constant negative real number', () => {
    expect(expressionEval('-3.4', memoryMock)).toEqual(-3.4);
  }); 

  it('evaluates constant expression with space', () => {
    expect(expressionEval('   4  ', memoryMock)).toEqual(4);
  });

  it('evaluates logical negation', () => {
    expect(expressionEval('!4', memoryMock)).toEqual(0);
  }); 

  it('evaluates double logical negation', () => {
    expect(expressionEval('!!4', memoryMock)).toEqual(1);
  }); 

  // Test case for simple arithmetic without variables
  it('evaluates simple arithmetic expressions', () => {
    expect(expressionEval('3 + 4', memoryMock)).toEqual(7);
    expect(expressionEval('10 / 2', memoryMock)).toEqual(5);
  });

  // Test case for expressions with variables
  it('evaluates expressions with variables', () => {
    expect(expressionEval('x + y', memoryMock)).toEqual(15);
    expect(expressionEval('x * 2', memoryMock)).toEqual(10);
    // Verifying that getVariable was called with the correct keys
    expect(memoryMock.getVariable).toHaveBeenCalledWith('x');
    expect(memoryMock.getVariable).toHaveBeenCalledWith('y');
  });

  // Test case for expressions with mixed variables and numbers
  it('evaluates expressions with mixed variables and numbers', () => {
    expect(expressionEval('x + 10', memoryMock)).toEqual(15);
    expect(expressionEval('z / 3', memoryMock)).toEqual(5);
  });

  // Test case for handling invalid variable values
  it('throws an error for invalid variable values', () => {
    expect(() => expressionEval('invalid + 5', memoryMock)).toThrow('Invalid expression. + needs number but got [object Object] (object)');
  });

  // Test case for nested expressions
  it('evaluates nested expressions', () => {
    expect(expressionEval('( 1 + 1 ) * 2', memoryMock)).toEqual(4);
    expect(expressionEval('3 + ( 2 * ( 1 + 0 ) )', memoryMock)).toEqual(5);
  });

  it('evaluates double nested expressions', () => {
    expect(expressionEval('(6/3)*(10/2)', memoryMock)).toEqual(10);
    expect(expressionEval('(6 / 3) * (10 / 2)', memoryMock)).toEqual(10);
  });
  
  it('evaluates nested expressions with variables', () => {
    expect(expressionEval('( x + y ) * 2', memoryMock)).toEqual(30);
    expect(expressionEval('3 + ( x * ( 2 + y ) )', memoryMock)).toEqual(63);
  });

  it('evaluates nested expressions without spaces', () => {
    expect(expressionEval('(1+1)*2', memoryMock)).toEqual(4);
    expect(expressionEval('3+(2*(1+0))', memoryMock)).toEqual(5);
  });
  
  it('evaluates nested expressions with variables without spaces', () => {
    expect(expressionEval('(x+y)*2', memoryMock)).toEqual(30);
    expect(expressionEval('3+(x*(2+y))', memoryMock)).toEqual(63);
  });
});

describe('evaluateVariableName', () => {
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ["foo", "num", "str", "foo.arr[0]"];
    },
    getVariable: (name: string): ParamType => {
      const variables: { [key: string]: ParamType } = {
        'foo': new StructuredMemoryData({ bar: new StructuredMemoryData({ spam: 42 }), arr: new StructuredMemoryData([1,2,3]) }),
        'num': 5,
        'str': StructuredMemoryData.build_from_string('hello'),
        'foo.arr[0]': 1
      };
      return variables[name] || 0;
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
    getVariable: (name: string): ParamType => {
      const variables: { [key: string]: ParamType } = {
        'foo.bar.spam': 42,
        'foo.arr[0]': 1,
        'foo.arr[1][1]': 100
      };
      return variables[name] || 0;
    }
  };

  it('Reach simple fields - 1', () => {
    expect(expressionEval('foo.bar.spam', mockGetter)).toEqual(42);
  });
  it('Reach simple fields - 2', () => {
    expect(expressionEval('foo.arr[0]', mockGetter)).toEqual(1);
  });
  it('Reach simple fields - 3', () => {
    expect(expressionEval('foo.arr[1][1]', mockGetter)).toEqual(100);
  });
  it('Reach fields based on expression - 1', () => {
    expect(expressionEval('foo.arr[32-31][1]', mockGetter)).toEqual(100);
  });
  it('Reach fields based on nested indexing', () => {
    expect(expressionEval('foo.arr[foo.arr[0]][1]', mockGetter)).toEqual(100);
  });
});

describe('Handle builtin functions', () => {
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ['foo'];
    },
    getVariable: (name: string): ParamType => {
      if (name == "foo") {
        return new StructuredMemoryData([1,2,3]);
      }
      return 0;
    }
  };

  it('Function on simple number', () => {
    expect(expressionEval('abs(-3)', mockGetter)).toEqual(3);
  });
  
  it('Function on multiple arguments', () => {
    expect(expressionEval('vecsize(3,4)', mockGetter)).toEqual(5);
  });

  it('Function on multiple arguments and spaces', () => {
    expect(expressionEval('vecsize(  3  , 4  )', mockGetter)).toEqual(5);
  });

  it('Function on multiple arguments (with expressions)', () => {
    expect(expressionEval('vecsize(2+1, 2*2)', mockGetter)).toEqual(5);
  });

  it('Function on multiple arguments (with complex expressions)', () => {
    expect(expressionEval('vecsize(2+1*1, 2*(1+1))', mockGetter)).toEqual(5);
  });

  it('Function on multiple arguments and additional operations', () => {
    expect(expressionEval('1+(1+1)+vecsize(2+1*1, 2*(1+1))+1+(1+1*1)', mockGetter)).toEqual(11);
  });

  it('Function over array variables', () => {
    expect(expressionEval('length(foo)', mockGetter)).toEqual(3);
  });

});

describe("Handling arrays as input variables", () => {
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ['foo'];
    },
    getVariable: (name: string): ParamType => {
      return {
        "a": 1,
        "b": 2,
      }[name] ?? 0;
    }
  };


  it('Simple array expression', () => {
    expect(expressionEval('[1,2,3]', mockGetter)).toEqual(new StructuredMemoryData([1,2,3]));
  });
  it('Simple array expression with spaces', () => {
    expect(expressionEval('[ 1   , 2    ,  3   ]', mockGetter)).toEqual(new StructuredMemoryData([1,2,3]));
  });
  it('Complex, but constant array expressions', () => {
    expect(expressionEval('[ 1+1   , 2 *3    ,  3 + (3+1+abs(-1)   )   ]', mockGetter)).toEqual(new StructuredMemoryData([2,6,8]));
  });
  it('Complex, non-constant array expressions', () => {
    expect(expressionEval('[ a+b   , 2*a]', mockGetter)).toEqual(new StructuredMemoryData([3,2]));
  });
  it('Complex array expressions with comas', () => {
    expect(expressionEval('[ vecsize(3,4)   , 2]', mockGetter)).toEqual(new StructuredMemoryData([5,2]));
  });
  it('Nested arrays', () => {
    expect(expressionEval('[ [2, 3] , 4]', mockGetter)).toEqual(new StructuredMemoryData([new StructuredMemoryData([2,3]),4]));
  });
  
});