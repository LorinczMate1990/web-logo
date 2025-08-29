import { Memory } from './memory.js'; // Adjust the import path accordingly
import { StructuredMemoryData } from '../types.js'; // Adjust the import path based on your project structure
import { NonExistingVariableMemoryError } from './errors.js';

describe('Memory', () => {
  describe("getVariable", () => {
    it('getting a nonexisting variable must throw an error with parents', () => {
      const mem = new Memory(new Memory(undefined));
      const getNonExistingVariable = () => mem.getVariable('nonExisting');
      expect(getNonExistingVariable).toThrow(NonExistingVariableMemoryError);
    });
  });

  describe("setVariable and getVariable", ()=> {
    it('setting a nonexisting variable must throw an error with parents', () => {
      const mem = new Memory(new Memory(undefined));
      const setNonExistingVariable = () => mem.setVariable('nonExisting', StructuredMemoryData.buildFromString('nonExisting'));
      expect(setNonExistingVariable).toThrow(NonExistingVariableMemoryError);
    });
    
    it('setting upper variable indexed by variable from the current scope', () => {
      const parentMem = new Memory(undefined);
      const lowerMem = new Memory(parentMem);
      parentMem.createVariable("array", new StructuredMemoryData([0,1,2,3,4]));
      lowerMem.createVariable("i", 2);
      expect(() => lowerMem.setVariable("array[i]", 0)).not.toThrow();
    });

    it('setting a nonexisting variable must throw an error without parents', () => {
      const mem = new Memory(undefined);
      const setNonExistingVariable = () => mem.setVariable('nonExisting', StructuredMemoryData.buildFromString('nonExisting'));
      expect(setNonExistingVariable).toThrow(NonExistingVariableMemoryError);
    });
    it('setting an existing variable in the current level', () => {
      const mem = new Memory(undefined);
      mem.createVariable('simpleKey', StructuredMemoryData.buildFromString('simpleValue'));
      mem.setVariable('simpleKey', StructuredMemoryData.buildFromString('something else'));
      expect(mem.getVariable('simpleKey')).toEqual(StructuredMemoryData.buildFromString('something else'));
    });

    it('setting an existing variable in a parent level', () => {
      const mem = new Memory(undefined);
      mem.createVariable('simpleKey', StructuredMemoryData.buildFromString('simpleValue'));
      const lowerMem = new Memory(mem);
      lowerMem.setVariable('simpleKey', StructuredMemoryData.buildFromString('something else'));
      expect(mem.getVariable('simpleKey')).toEqual(StructuredMemoryData.buildFromString('something else'));
      expect('simpleKey' in lowerMem.variables).toEqual(false);
    });
  });

  describe("createVariable and getVariable", () => {
    it('creates and retrieves a simple string variable', () => {
      const mem = new Memory(undefined);
      mem.createVariable('simpleKey', StructuredMemoryData.buildFromString('simpleValue'));
      expect(mem.getVariable('simpleKey')).toEqual(StructuredMemoryData.buildFromString('simpleValue'));
    });

    it('creates a structured variable', () => {
      const mem = new Memory(undefined);
      mem.createVariable('my.structured.variable', 5); // Assuming this is how you intended structured data to be set
      expect(mem.variables).toEqual({
        my: {
          type: 'struct',
          value: new StructuredMemoryData({
            structured: new StructuredMemoryData({
              variable: 5
            })
          })
        }
      });
      
    });

    it('gets a structured variable', () => {
      const mem = new Memory(undefined);
      mem.variables = {
        my: {
          type: 'struct',
          value: new StructuredMemoryData({
            structured: new StructuredMemoryData({
              variable: 5
            })
          })
        }
      };
      const value = mem.getVariable('my.structured.variable'); // Assuming this is how you intended structured data to be set
      expect(value).toEqual(5);
    });

    it('creates and retrieves a structured variable', () => {
      const mem = new Memory(undefined);
      mem.createVariable('structured', new StructuredMemoryData({ some: StructuredMemoryData.buildFromString('data') })); // Assuming this is how you intended structured data to be set
      const retrived = mem.getVariable('structured');
      expect(retrived).toEqual(new StructuredMemoryData({ some: StructuredMemoryData.buildFromString('data') }));
    });

    it('creates and retrieves an embedded structured variable', () => {
      const mem = new Memory(undefined);
      mem.createVariable('structured.key', new StructuredMemoryData({ some: 0 })); // Assuming this is how you intended structured data to be set
      expect(mem.getVariable('structured.key')).toEqual(new StructuredMemoryData({ some: 0 }));
    });

    it('recreates a variable with a new value', () => {
      const mem = new Memory(undefined);
      mem.createVariable('key', StructuredMemoryData.buildFromString('firstValue'));
      mem.createVariable('key', StructuredMemoryData.buildFromString('secondValue'));
      expect(mem.getVariable('key')).toEqual(StructuredMemoryData.buildFromString('secondValue'));
    });

    it('retrieves a variable from parent if not found in child', () => {
      const parent = new Memory(undefined);
      parent.createVariable('inheritedKey', 42);
      const child = new Memory(parent);
      expect(child.getVariable('inheritedKey')).toBe(42);
    });

    it('prefers a variable in child over parent if both exist', () => {
      const parent = new Memory(undefined);
      parent.createVariable('sharedKey', StructuredMemoryData.buildFromString('parentValue'));
      const child = new Memory(parent);
      child.createVariable('sharedKey', StructuredMemoryData.buildFromString('childValue'));
      expect(child.getVariable('sharedKey')).toEqual(StructuredMemoryData.buildFromString('childValue'));
    });

    it('creates and retrieves structured variables via complex paths', () => {
      const mem = new Memory(undefined);
      mem.createVariable('complex.path[0].to.key', StructuredMemoryData.buildFromString('value'));
      expect(mem.getVariable('complex.path[0].to.key')).toEqual(StructuredMemoryData.buildFromString('value'));
    });

    it('handles nested structured data creating and retrieval', () => {
      const mem = new Memory(undefined);
      mem.createVariable('nested.structure', new StructuredMemoryData({ key: new StructuredMemoryData({ nestedKey: StructuredMemoryData.buildFromString('nestedValue') })}));
      expect(mem.getVariable('nested.structure.key.nestedKey')).toEqual(StructuredMemoryData.buildFromString('nestedValue'));
    });

    it('tries to read an index with variable where the index is in a lower level memory', () => {
      const mem = new Memory(undefined);
      mem.variables = {
        arr: {
          type: 'struct',
          value: new StructuredMemoryData([10, 20, 30])
        },
      };
      const mem2 = new Memory(mem);
      mem2.variables = {
        i: {
          type: 'numeric',
          value: 1
        }
      };
      expect(mem2.getVariable("arr[i]")).toEqual(20);
    });
  });
});