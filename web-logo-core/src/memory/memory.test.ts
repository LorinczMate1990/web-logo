import { Memory } from './memory'; // Adjust the import path accordingly
import { StructuredMemoryData } from '../types'; // Adjust the import path based on your project structure

describe('Memory', () => {
  it('sets and retrieves a simple string variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('simpleKey', StructuredMemoryData.build_from_string('simpleValue'));
    expect(mem.getVariable('simpleKey')).toEqual(StructuredMemoryData.build_from_string('simpleValue'));
  });

  it('sets and retrieves a structured variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('structured', new StructuredMemoryData({ some: StructuredMemoryData.build_from_string('data') })); // Assuming this is how you intended structured data to be set
    const retrived = mem.getVariable('structured');
    expect(retrived).toEqual(new StructuredMemoryData({ some: StructuredMemoryData.build_from_string('data') }));
  });

  it('sets and retrieves an embedded structured variable', () => {
    const mem = new Memory(undefined);
    mem.setVariable('structured.key', new StructuredMemoryData({ some: 0 })); // Assuming this is how you intended structured data to be set
    expect(mem.getVariable('structured.key')).toEqual(new StructuredMemoryData({ some: 0 }));
  });

  it('overrides a variable with a new value', () => {
    const mem = new Memory(undefined);
    mem.setVariable('key', StructuredMemoryData.build_from_string('firstValue'));
    mem.setVariable('key', StructuredMemoryData.build_from_string('secondValue'));
    expect(mem.getVariable('key')).toEqual(StructuredMemoryData.build_from_string('secondValue'));
  });

  it('retrieves a variable from parent if not found in child', () => {
    const parent = new Memory(undefined);
    parent.setVariable('inheritedKey', 42);
    const child = new Memory(parent);
    expect(child.getVariable('inheritedKey')).toBe(42);
  });

  it('prefers a variable in child over parent if both exist', () => {
    const parent = new Memory(undefined);
    parent.setVariable('sharedKey', StructuredMemoryData.build_from_string('parentValue'));
    const child = new Memory(parent);
    child.setVariable('sharedKey', StructuredMemoryData.build_from_string('childValue'));
    expect(child.getVariable('sharedKey')).toEqual(StructuredMemoryData.build_from_string('childValue'));
  });

  it('sets and retrieves structured variables via complex paths', () => {
    const mem = new Memory(undefined);
    mem.setVariable('complex.path[0].to.key', StructuredMemoryData.build_from_string('value'));
    expect(mem.getVariable('complex.path[0].to.key')).toEqual(StructuredMemoryData.build_from_string('value'));
  });

  it('handles nested structured data setting and retrieval', () => {
    const mem = new Memory(undefined);
    mem.setVariable('nested.structure', new StructuredMemoryData({ key: new StructuredMemoryData({ nestedKey: StructuredMemoryData.build_from_string('nestedValue') })}));
    expect(mem.getVariable('nested.structure.key.nestedKey')).toEqual(StructuredMemoryData.build_from_string('nestedValue'));
  })
});