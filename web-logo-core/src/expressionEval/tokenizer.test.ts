import { tokenize } from './tokenizer.js';

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

  it('handles array variables without expressions', () => {
    const result = tokenize('a[23]+c');
    expect(result).toEqual(['a[23]', '+', 'c']);
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