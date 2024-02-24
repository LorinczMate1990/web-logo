import { filterTokens, tokenizer } from './Tokenizer';
import { TooManyClosingBracketError, UnclosedBracketError } from "./errors";

describe('filterTokens', () => {
  // Test empty input
  it('returns an empty array for empty input', () => {
    expect(filterTokens([])).toEqual([]);
  });

  // Test input with only empty strings
  it('filters out all empty strings', () => {
    expect(filterTokens(['', '', ''])).toEqual([]);
  });

  // Test input with no empty tokens
  it('returns the same array if there are no empty strings', () => {
    expect(filterTokens(['token1', 'token2'])).toEqual(['token1', 'token2']);
  });

  // Test input with mixed empty and non-empty tokens
  it('filters out empty strings and returns only non-empty tokens', () => {
    expect(filterTokens(['', 'token1', '', 'token2', ''])).toEqual(['token1', 'token2']);
  });

  // Test single newline as input
  it('filters out a single newline character', () => {
    expect(filterTokens(['\n'])).toEqual([]);
  });

  // Test multiple consecutive newlines
  it('filters out consecutive newline characters', () => {
    expect(filterTokens(['\n', '\n', '\n'])).toEqual([]);
  });

  // Test newlines interspersed with tokens
  it('keeps single newlines between tokens and filters out multiple consecutive newlines', () => {
    expect(filterTokens(['token1', '\n', 'token2', '\n', '\n', 'token3'])).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });

  // Test newlines at the start and end of the input
  it('filters out newlines at the start and end of the input array', () => {
    expect(filterTokens(['\n', 'token1', 'token2', '\n'])).toEqual(['token1', 'token2']);
  });

  // Test with only non-empty strings and newlines
  it('correctly intersperses tokens with single newlines and filters out leading/trailing/multiple consecutive newlines', () => {
    expect(filterTokens(['\n', '\n', 'token1', '\n', 'token2', '\n', 'token3', '\n', '\n'])).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });

  // Test input with mixed empty strings, non-empty strings, and newlines
  it('filters out empty strings, handles newlines correctly, and returns non-empty tokens', () => {
    expect(filterTokens(['', '\n', '', 'token1', '', '\n', 'token2', '\n', '', '\n', 'token3', '', '\n'])).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });
});


describe('tokenizer', () => {
  // Test for basic tokenization
  it('should tokenize a simple command without brackets', () => {
    expect(tokenizer('command1 arg1 arg2')).toEqual(['command1', 'arg1', 'arg2']);
  });

  // Test for handling spaces within brackets
  it('should include spaces in tokens within brackets', () => {
    expect(tokenizer('command2 (arg with spaces)')).toEqual(['command2', 'arg with spaces']);
  });

  // Test for handling nested brackets
  it('should handle nested brackets correctly', () => {
    expect(tokenizer('command3 (nested (brackets))')).toEqual(['command3', 'nested (brackets)']);
  });

  // Test for handling curly braces
  it('should tokenize curly braces as separate tokens when not in brackets', () => {
    expect(tokenizer('command4 { arg1 arg2 }')).toEqual(['command4', '{', 'arg1', 'arg2', '}']);
  });

  // Test for new lines as separate tokens
  it('should treat new lines as separate tokens', () => {
    expect(tokenizer('command5\ncommand6')).toEqual(['command5', '\n', 'command6']);
  });

  // Test for unclosed brackets throwing an error
  it('should throw UnclosedBracketError for unclosed brackets', () => {
    expect(() => tokenizer('command7 (unclosed')).toThrow(UnclosedBracketError);
  });

  // Test for too many closing brackets throwing an error
  it('should throw TooManyClosingBracketError for too many closing brackets', () => {
    expect(() => tokenizer('command8 ))')).toThrow(TooManyClosingBracketError);
  });

  // Test for ignoring spaces outside brackets and curly braces
  it('should ignore spaces outside of brackets and curly braces', () => {
    expect(tokenizer('command9    arg3    arg4')).toEqual(['command9', 'arg3', 'arg4']);
  });

  // Test for mixed brackets and curly braces
  it('should correctly tokenize mixed brackets and curly braces', () => {
    expect(tokenizer('command10 (arg5 {arg6}) {arg7 (arg8)}')).toEqual(['command10', 'arg5 {arg6}', '{', 'arg7', 'arg8', '}']);
  });

  // Test for filtering out empty tokens and lines
  it('should filter out empty tokens and not create empty lines unnecessarily', () => {
    expect(tokenizer('command11   \n\n  command12')).toEqual(['command11', '\n', 'command12']);
  });
});
