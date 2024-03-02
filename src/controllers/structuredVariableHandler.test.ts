import { evaluateVariableName, getStructuredVariableValue, isStructuredVariableName } from './structuredVariableHandler'; // Adjust the import path based on your project structure
import { VariableGetter } from './types';

describe('Structured Variable Evaluation', () => {
  // Mock the VariableGetter
  const mockGetter: VariableGetter = {
    getVariable: jest.fn((name: string): string => {
      const variables: { [key: string]: string } = {
        'foo': JSON.stringify({ bar: { spam: "42" }, arr: ["1", "2", "3"] }),
        'num': '5',
        'str': 'hello'
      };
      return variables[name] || "";
    })
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
      expect(evaluateVariableName('arr[<num>]', mockGetter)).toBe('arr[5]'); // Example mixing both types
    });
  });

  describe('getStructuredVariableValue', () => {
    it('retrieves nested properties and handles JSON structures', () => {
      expect(getStructuredVariableValue('foo.bar.spam', mockGetter)).toBe('42');
      expect(getStructuredVariableValue('foo.arr[2]', mockGetter)).toBe('3');
    });

    it('returns JSON string for objects and arrays', () => {
      expect(getStructuredVariableValue('foo.bar', mockGetter)).toBe(JSON.stringify({ spam: "42" }));
      expect(getStructuredVariableValue('foo.arr', mockGetter)).toBe(JSON.stringify(["1", "2", "3"]));
    });

    it('throws an error for invalid paths', () => {
      expect(() => getStructuredVariableValue('foo.invalid.path', mockGetter)).toThrow();
    });
  });
});
