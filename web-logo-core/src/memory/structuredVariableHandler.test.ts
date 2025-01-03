import { getBaseVariableName, getDataMember, isStructuredVariableName, setDataMember } from './structuredVariableHandler'; // Adjust the import path based on your project structure
import { ParamType, StructuredMemoryData, VariableGetter } from '../types';

function toAsciiStructMemData(str : string) {
  return new StructuredMemoryData(Array.from(str, char => char.charCodeAt(0)))
}

describe('Structured Variable Evaluation', () => {
  // Mock the VariableGetter
  const mockGetter: VariableGetter = {
    hasVariable: (name : string): boolean => {
      return name in ["foo", "num", "str"];
    },
    getVariable: (name: string): ParamType => {
      const variables: { [key: string]: ParamType } = {
        'foo': new StructuredMemoryData({
          "bar": new StructuredMemoryData({
            "spam": 42,
          }),
        'arr': new StructuredMemoryData([1,2,3])
        }),//JSON.stringify({ bar: { spam: "42" }, arr: ["1", "2", "3"] }),
        'num': 5,
        'str': StructuredMemoryData.build_from_string("Hello")
      };
      return variables[name] || 0;
    }
  };

  describe('isStructuredVariableName', () => {
    it('identifies structured variable names correctly', () => {
      expect(isStructuredVariableName('foo')).toBe(false);
      expect(isStructuredVariableName('foo.bar')).toBe(true);
      expect(isStructuredVariableName('foo[0]')).toBe(true);
    });
  });

  describe('getBaseVariableName', () => {
    it('extracts the base name from a simple variable', () => {
      expect(getBaseVariableName('variable')).toEqual({baseName: 'variable', rest: ""});
    });

    it('extracts the base name from a dot notation path', () => {
      expect(getBaseVariableName('object.property')).toEqual({baseName: 'object', rest: "property"});
    });

    it('extracts the base name from a bracket notation path', () => {
      expect(getBaseVariableName('array[0]')).toEqual({baseName: 'array', rest: "[0]"});
    });

    it('handles variables with mixed notations', () => {
      expect(getBaseVariableName('object.array[0].property')).toEqual({baseName: 'object', rest: "array[0].property"});
    });

    it('returns the original string if it starts with a dot', () => {
      expect(getBaseVariableName('.startsWithDot')).toEqual({baseName: '.startsWithDot', rest: ""});
    });

    it('returns the original string if it starts with a bracket', () => {
      expect(getBaseVariableName('[0]startsWithBracket')).toEqual({baseName: '[0]startsWithBracket', rest: ""});
    });

    it('works with nested properties and indices', () => {
      expect(getBaseVariableName('object.property[0].nestedProperty')).toEqual({baseName: 'object', rest: "property[0].nestedProperty"});
    });

    // Add more tests as necessary...
  });

  describe('getDataMember', () => {
    // Example object to use in tests
    const data = new StructuredMemoryData({
      foo: new StructuredMemoryData({
        bar: new StructuredMemoryData({
          spam: StructuredMemoryData.build_from_string("eggs"),
          array: new StructuredMemoryData([1, 2, new StructuredMemoryData({nested: StructuredMemoryData.build_from_string("value")})])
        })
      })
    });

    it('retrieves a simple nested property', () => {
      expect(getDataMember('foo.bar.spam', data)).toEqual(toAsciiStructMemData('eggs'));
    });

    it('retrieves an element from an array', () => {
      expect(getDataMember('foo.bar.array[1]', data)).toBe(2);
    });

    it('retrieves a nested object as a JSON string', () => {
      expect(getDataMember('foo.bar', data)).toBe((data.getDataMember("foo") as StructuredMemoryData).getDataMember("bar"));
    });

    it('retrieves a deeply nested property', () => {
      expect((getDataMember('foo.bar.array[2].nested', data))).toEqual(StructuredMemoryData.build_from_string("value"));
    });

    it('throws an error for an undefined path', () => {
      expect(() => {
        getDataMember('foo.unknown.path', data);
      }).toThrow("Can't get this data, wrong path: unknown, [object Object], isArray: false");
    });

    it('retrives objects', () => {
      expect(getDataMember('foo.bar', data)).toBe((data as any).data.foo.data.bar);
      expect(getDataMember('foo.bar.array', data)).toBe((data as any).data.foo.data.bar.data.array);
    });

    it('retrives an array', () => {
      const data = new StructuredMemoryData({variableName: new StructuredMemoryData([10, 12, 13])});
      expect(getDataMember('variableName', data)).toEqual(new StructuredMemoryData([10, 12, 13]));
    });

    it('retrives an element of a pure array', () => {
      const data = new StructuredMemoryData({variableName: new StructuredMemoryData([10, 12, 13])});
      expect(getDataMember('variableName[0]', data)).toBe(10);
    });

  });

  describe('setDataMember', () => {
    it('sets a top-level property', () => {
      const obj = new StructuredMemoryData({});
      setDataMember('topLevel', toAsciiStructMemData('value'), obj);
      expect(obj).toEqual(new StructuredMemoryData({ topLevel: toAsciiStructMemData('value') }));
    });

    it('sets a deeply nested property, creating objects as needed', () => {
      const obj = new StructuredMemoryData({ existing: new StructuredMemoryData({ nested: new StructuredMemoryData({}) }) });
      setDataMember('existing.nested.deep.property', toAsciiStructMemData('deepValue'), obj);
      expect(obj).toEqual(new StructuredMemoryData({
        existing: new StructuredMemoryData({
          nested: new StructuredMemoryData({
            deep: new StructuredMemoryData({
              property: toAsciiStructMemData('deepValue')
            })
          })
        })
      }));
    });

    it('overrides an existing property', () => {
      const obj = new StructuredMemoryData({ existing: toAsciiStructMemData('oldValue') });
      setDataMember('existing', toAsciiStructMemData("newValue"), obj);
      expect(obj).toEqual(new StructuredMemoryData({ existing: toAsciiStructMemData('newValue') }));
    });

    it('handles array indices within the path', () => {
      const obj = new StructuredMemoryData({ 
        array: new StructuredMemoryData([new StructuredMemoryData({}), new StructuredMemoryData({}), new StructuredMemoryData({})]) 
      });
      const expected = new StructuredMemoryData({ 
        array: new StructuredMemoryData([new StructuredMemoryData({}), new StructuredMemoryData({property: toAsciiStructMemData('valueInArray')}), new StructuredMemoryData({})]) 
      });
      setDataMember('array[1].property', toAsciiStructMemData('valueInArray'), obj);
      expect(obj).toEqual(expected);
    });

    it('creates nested structures within arrays', () => {
      const obj = new StructuredMemoryData({ array: new StructuredMemoryData([new StructuredMemoryData({})]) });
      const expected = new StructuredMemoryData({ 
        array: new StructuredMemoryData([
          new StructuredMemoryData({
            nested: new StructuredMemoryData({
              deep: toAsciiStructMemData('deepArrayValue')
            })
          })
        ]) 
      });
      
      setDataMember('array[0].nested.deep', toAsciiStructMemData('deepArrayValue'), obj);
      expect(obj).toEqual(expected);
    });

    it('replaces an entire nested object', () => {
      const obj = new StructuredMemoryData({ 
        toReplace: new StructuredMemoryData({
          existing: toAsciiStructMemData('value') 
        }) 
      });
      const expected = new StructuredMemoryData({ 
        toReplace: new StructuredMemoryData({
          replaced: toAsciiStructMemData('newValue') 
        }) 
      });
      setDataMember('toReplace', new StructuredMemoryData({ replaced: toAsciiStructMemData('newValue') }), obj);
      expect(obj).toEqual(expected);
    });

    // Additional edge cases and scenarios...
  });
});

