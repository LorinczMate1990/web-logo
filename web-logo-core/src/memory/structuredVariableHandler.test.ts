import { evaluateVariableName, getBaseVariableName, getDataMember, isStructuredVariableName, setDataMember } from './structuredVariableHandler'; // Adjust the import path based on your project structure
import { VariableGetter } from '../types';

describe('Structured Variable Evaluation', () => {
  // Mock the VariableGetter
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ["foo", "num", "str"];
    },
    getVariable: (name: string): string => {
      const variables: { [key: string]: string } = {
        'foo': JSON.stringify({ bar: { spam: "42" }, arr: ["1", "2", "3"] }),
        'num': '5',
        'str': 'hello'
      };
      return variables[name] || "";
    }
  };

  describe('isStructuredVariableName', () => {
    it('identifies structured variable names correctly', () => {
      expect(isStructuredVariableName('foo')).toBe(false);
      expect(isStructuredVariableName('foo.bar')).toBe(true);
      expect(isStructuredVariableName('foo[0]')).toBe(true);
    });
  });

  describe('evaluateVariableName', () => {
    it('evaluates static variable name', () => {
      expect(evaluateVariableName('foo.bar.spam', mockGetter)).toBe('foo.bar.spam');
    });

    it('evaluates expressions within [ and ] variable name', () => {
      expect(evaluateVariableName('foo.arr[ 1 ]', mockGetter)).toBe('foo.arr[1]');
      expect(evaluateVariableName('foo.arr[ 1 + 1 ]', mockGetter)).toBe('foo.arr[2]');
    });

    it('evaluates < > and [ ] expressions', () => {
      expect(evaluateVariableName('<str>.length', mockGetter)).toBe('hello.length'); // Example assuming simple substitution
      expect(evaluateVariableName('arr[num]', mockGetter)).toBe('arr[5]'); // Example mixing both types
    });
  });
  describe('getBaseVariableName', () => {
    it('extracts the base name from a simple variable', () => {
      expect(getBaseVariableName('variable')).toBe('variable');
    });

    it('extracts the base name from a dot notation path', () => {
      expect(getBaseVariableName('object.property')).toBe('object');
    });

    it('extracts the base name from a bracket notation path', () => {
      expect(getBaseVariableName('array[0]')).toBe('array');
    });

    it('handles variables with mixed notations', () => {
      expect(getBaseVariableName('object.array[0].property')).toBe('object');
    });

    it('returns the original string if it starts with a dot', () => {
      expect(getBaseVariableName('.startsWithDot')).toBe('.startsWithDot');
    });

    it('returns the original string if it starts with a bracket', () => {
      expect(getBaseVariableName('[0]startsWithBracket')).toBe('[0]startsWithBracket');
    });

    it('works with nested properties and indices', () => {
      expect(getBaseVariableName('object.property[0].nestedProperty')).toBe('object');
    });

    // Add more tests as necessary...
  });

  describe('getDataMember', () => {
    // Example object to use in tests
    const data = {
      foo: {
        bar: {
          spam: "eggs",
          array: [1, 2, { nested: "value" }]
        }
      }
    };

    it('retrieves a simple nested property', () => {
      expect(getDataMember('foo.bar.spam', data)).toBe('eggs');
    });

    it('retrieves an element from an array', () => {
      expect(getDataMember('foo.bar.array[1]', data)).toBe(2);
    });

    it('retrieves a nested object as a JSON string', () => {
      expect(getDataMember('foo.bar', data)).toBe(data.foo.bar);
    });

    it('retrieves a deeply nested property', () => {
      expect(getDataMember('foo.bar.array[2].nested', data)).toBe('value');
    });

    it('throws an error for an undefined path', () => {
      expect(() => {
        getDataMember('foo.unknown.path', data);
      }).toThrow('Path foo.unknown.path could not be fully resolved.');
    });

    it('retrives objects', () => {
      expect(getDataMember('foo.bar', data)).toBe(data.foo.bar);
      expect(getDataMember('foo.bar.array', data)).toBe(data.foo.bar.array);
    });

    it('retrives an array', () => {
      expect(getDataMember('variableName[0]', {variableName: [10, 12, 13]})).toBe(10);
      expect(getDataMember('variableName', {variableName: [10, 12, 13]})).toEqual([10, 12, 13]);
    });

    // Add more tests as necessary...
  });

  describe('setDataMember', () => {
    it('sets a top-level property', () => {
      const obj = {};
      setDataMember('topLevel', 'value', obj);
      expect(obj).toEqual({ topLevel: 'value' });
    });

    it('sets a deeply nested property, creating objects as needed', () => {
      const obj = { existing: { nested: {} } };
      setDataMember('existing.nested.deep.property', 'deepValue', obj);
      expect(obj).toEqual({
        existing: {
          nested: {
            deep: {
              property: 'deepValue'
            }
          }
        }
      });
    });

    it('overrides an existing property', () => {
      const obj = { existing: 'oldValue' };
      setDataMember('existing', 'newValue', obj);
      expect(obj).toEqual({ existing: 'newValue' });
    });

    it('handles array indices within the path', () => {
      const obj = { array: [{}, {}, {}] };
      setDataMember('array[1].property', 'valueInArray', obj);
      expect(obj).toEqual({
        array: [{}, { property: 'valueInArray'}, {}]
      });
    });

    it('creates nested structures within arrays', () => {
      const obj = { array: [{}] };
      setDataMember('array[0].nested.deep', 'deepArrayValue', obj);
      expect(obj).toEqual({
        array: [{
          nested: {
            deep: 'deepArrayValue'
          }
        }]
      });
    });

    it('replaces an entire nested object', () => {
      const obj = { toReplace: { existing: 'value' } };
      setDataMember('toReplace', { replaced: 'newValue' }, obj);
      expect(obj).toEqual({ toReplace: { replaced: 'newValue' } });
    });

    // Additional edge cases and scenarios...
  });
});

