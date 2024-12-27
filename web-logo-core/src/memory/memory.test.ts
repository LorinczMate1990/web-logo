import { Memory } from './memory'; // Adjust the import path accordingly
import { StructuredMemoryData } from '../types'; // Adjust the import path based on your project structure

describe('Memory', () => {
  it('sets and retrieves a simple string variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('simpleKey', 'simpleValue');
    expect(mem.getVariable('simpleKey')).toBe('simpleValue');
  });

  it('sets and retrieves a structured variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('structured', new StructuredMemoryData({ some: 'data' })); // Assuming this is how you intended structured data to be set
    const retrived = mem.getVariable('structured');
    expect(retrived).toEqual(new StructuredMemoryData({ some: 'data' }));
  });

  it('sets and retrieves an embedded structured variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('structured.key', new StructuredMemoryData({ some: 'data' })); // Assuming this is how you intended structured data to be set
    expect(mem.getVariable('structured.key')).toEqual(new StructuredMemoryData({ some: 'data' }));
  });

  it('overrides a variable with a new value', () => {
    const mem = new Memory(undefined);
    mem.setVariable('key', 'firstValue');
    mem.setVariable('key', 'secondValue');
    expect(mem.getVariable('key')).toBe('secondValue');
  });

  it('retrieves a variable from parent if not found in child', () => {
    const parent = new Memory(undefined);
    parent.setVariable('inheritedKey', 'inheritedValue');
    const child = new Memory(parent);
    expect(child.getVariable('inheritedKey')).toBe('inheritedValue');
  });

  it('prefers a variable in child over parent if both exist', () => {
    const parent = new Memory(undefined);
    parent.setVariable('sharedKey', 'parentValue');
    const child = new Memory(parent);
    child.setVariable('sharedKey', 'childValue');
    expect(child.getVariable('sharedKey')).toBe('childValue');
  });

  it('sets and retrieves structured variables via complex paths', () => {
    const mem = new Memory(undefined);
    mem.setVariable('complex.path[0].to.key', 'value');
    expect(mem.getVariable('complex.path[0].to.key')).toBe('value');
  });

  it('handles nested structured data setting and retrieval', () => {
    const mem = new Memory(undefined);
    mem.setVariable('nested.structure', new StructuredMemoryData({ key: { nestedKey: 'nestedValue' }}));
    expect(mem.getVariable('nested.structure.key.nestedKey')).toBe('nestedValue');
  });
});
