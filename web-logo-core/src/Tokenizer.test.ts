import { Token, filterTokens, tokenizer } from './Tokenizer';
import { TooManyClosingBracketError, UnclosedBracketError } from "./errors";

describe('filterTokens', () => {
  // Test empty input
  it('returns an empty array for empty input', () => {
    expect(filterTokens([])).toEqual([]);
  });

  // Test input with only empty strings replaced by empty Token instances
  it('filters out all empty Token instances', () => {
    expect(filterTokens([new Token('', 0, 0), new Token('', 0, 1), new Token('', 0, 2)])).toEqual([]);
  });

  // Test input with no empty tokens
  it('returns the same array if there are no empty Token instances', () => {
    const tokens = [new Token('token1', 0, 0), new Token('token2', 0, 3)];
    expect(filterTokens(tokens)).toEqual(tokens);
  });

  // Test input with mixed empty and non-empty tokens
  it('filters out empty Token instances and returns only non-empty tokens', () => {
    const tokens = [new Token('', 0, 0), new Token('token1', 0, 1), new Token('', 0, 2), new Token('token2', 0, 3), new Token('', 0, 4)];
    expect(filterTokens(tokens).map(t => t.val)).toEqual(['token1', 'token2']);
  });

  // Test single newline as input
  it('filters out a single newline character', () => {
    expect(filterTokens([new Token('\n', 0, 0)])).toEqual([]);
  });

  // Test multiple consecutive newlines
  it('filters out consecutive newline characters', () => {
    expect(filterTokens([new Token('\n', 0, 0), new Token('\n', 1, 0), new Token('\n', 2, 0)])).toEqual([]);
  });

  // Test newlines interspersed with tokens
  it('keeps single newlines between tokens and filters out multiple consecutive newlines', () => {
    const tokens = [new Token('token1', 0, 0), new Token('\n', 1, 0), new Token('token2', 2, 0), new Token('\n', 3, 0), new Token('\n', 4, 0), new Token('token3', 5, 0)];
    expect(filterTokens(tokens).map(t => t.val)).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });

  // Test newlines at the start and end of the input
  it('filters out newlines at the start and end of the input array', () => {
    const tokens = [new Token('\n', 0, 0), new Token('token1', 1, 0), new Token('token2', 2, 0), new Token('\n', 3, 0)];
    expect(filterTokens(tokens).map(t => t.val)).toEqual(['token1', 'token2']);
  });

  // Test with only non-empty strings and newlines
  it('correctly intersperses tokens with single newlines and filters out leading/trailing/multiple consecutive newlines', () => {
    const tokens = [new Token('\n', 0, 0), new Token('\n', 1, 0), new Token('token1', 2, 0), new Token('\n', 3, 0), new Token('token2', 4, 0), new Token('\n', 5, 0), new Token('token3', 6, 0), new Token('\n', 7, 0), new Token('\n', 8, 0)];
    expect(filterTokens(tokens).map(t => t.val)).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });

  // Test input with mixed empty strings, non-empty strings, and newlines
  it('filters out empty strings, handles newlines correctly, and returns non-empty tokens', () => {
    const tokens = [new Token('', 0, 0), new Token('\n', 1, 0), new Token('', 2, 0), new Token('token1', 3, 0), new Token('', 4, 0), new Token('\n', 5, 0), new Token('token2', 6, 0), new Token('\n', 7, 0), new Token('', 8, 0), new Token('\n', 9, 0), new Token('token3', 10, 0), new Token('', 11, 0), new Token('\n', 12, 0)];
    expect(filterTokens(tokens).map(t => t.val)).toEqual(['token1', '\n', 'token2', '\n', 'token3']);
  });
});


describe('tokenizer', () => {
  // Test for basic tokenization
  it('should tokenize a simple command without brackets', () => {
    expect(tokenizer('command1 arg1 arg2').map(t => t.val)).toEqual(['command1', 'arg1', 'arg2']);
  });

  // Test for handling spaces within brackets
  it('should include spaces in tokens within brackets', () => {
    expect(tokenizer('command2 (arg with spaces)').map(t => t.val)).toEqual(['command2', '(arg with spaces)']);
  });

  // Test for handling nested brackets
  it('should handle nested brackets correctly', () => {
    expect(tokenizer('command3 (nested (brackets))').map(t => t.val)).toEqual(['command3', '(nested (brackets))']);
  });

  it('should handle brackets with operators at the same level', () => {
    expect(tokenizer('command (bracketed content)+1').map(t => t.val)).toEqual(['command', '(bracketed content)+1']);
  });

  it('should handle brackets with operators at the same level', () => {
    expect(tokenizer('command 1*(bracketed content)+1').map(t => t.val)).toEqual(['command', '1*(bracketed content)+1']);
  });

  it('should handle bracketed and non-bracketed arguments', () => {
    expect(tokenizer('command (bracketed content) +1').map(t => t.val)).toEqual(['command', '(bracketed content)', '+1']);
  });

  it('should include spaces in tokens within square brackets', () => {
    expect(tokenizer('command2 [arg with spaces]').map(t => t.val)).toEqual(['command2', '[arg with spaces]']);
  });

  it('should handle expression containing square bracket as one', () => {
    expect(tokenizer('command a[1]+1').map(t => t.val)).toEqual(['command', 'a[1]+1']);
  });

  it('should handle expression containing bracket as one', () => {
    expect(tokenizer('command a(1)+1').map(t => t.val)).toEqual(['command', 'a(1)+1']);
  });


  // Test for handling nested square brackets
  it('should handle nested square brackets correctly', () => {
    expect(tokenizer('command3 [nested (brackets)]').map(t => t.val)).toEqual(['command3', '[nested (brackets)]']);
  });

  describe('double quotes', () => {
    it('should ignore escaped double quotes', () => {
      expect(tokenizer('command3 "ddd\\"ddd"').map(t => t.val)).toEqual(['command3', '"ddd\\"ddd"']);
    });

    it('should handle double quotes with any content', () => {
      expect(tokenizer('command3 "[nested (brackets)] [ddd]"').map(t => t.val)).toEqual(['command3', '"[nested (brackets)] [ddd]"']);
    });

    it('should handle double quotes inside of a braket', () => {
      expect(tokenizer('command3 (dd, wdw, "okodk")').map(t => t.val)).toEqual(['command3', '(dd, wdw, "okodk")']);
    });

    it('should handle double quotes inside of a square braket', () => {
      expect(tokenizer('command3 [dd, wdw, "okodk"]').map(t => t.val)).toEqual(['command3', '[dd, wdw, "okodk"]']);
    });
  });

  // Test for handling curly braces
  it('should tokenize curly braces as separate tokens when not in brackets', () => {
    expect(tokenizer('command4 { arg1 arg2 }').map(t => t.val)).toEqual(['command4', '{', 'arg1', 'arg2', '}']);
  });

  // Test for new lines as separate tokens
  it('should treat new lines as separate tokens', () => {
    expect(tokenizer('command5\ncommand6').map(t => t.val)).toEqual(['command5', '\n', 'command6']);
  });

  // Test for unclosed brackets throwing an error
  it('should throw UnclosedBracketError for unclosed brackets', () => {
    expect(() => tokenizer('command7 (unclosed').map(t => t.val)).toThrow(UnclosedBracketError);
  });

  // Test for too many closing brackets throwing an error
  it('should throw TooManyClosingBracketError for too many closing brackets', () => {
    expect(() => tokenizer('command8 ))').map(t => t.val)).toThrow(TooManyClosingBracketError);
  });

  // Test for ignoring spaces outside brackets and curly braces
  it('should ignore spaces outside of brackets and curly braces', () => {
    expect(tokenizer('command9    arg3    arg4').map(t => t.val)).toEqual(['command9', 'arg3', 'arg4']);
  });

  // Test for mixed brackets and curly braces
  it('should correctly tokenize mixed brackets and curly braces', () => {
    expect(tokenizer('command10 (arg5 {arg6}) {arg7 (arg8)}').map(t => t.val)).toEqual(['command10', '(arg5 {arg6})', '{', 'arg7', '(arg8)', '}']);
  });

  // Test for filtering out empty tokens and lines
  it('should filter out empty tokens and not create empty lines unnecessarily', () => {
    expect(tokenizer('command11   \n\n  command12').map(t => t.val)).toEqual(['command11', '\n', 'command12']);
  });

  describe("traceabilty of tokenizer", () => {
    describe('tokenizer line and char number tracking', () => {
      // Test token at the beginning of the input
      it('tracks line and char number for token at start', () => {
        const tokens = tokenizer('token1');
        expect(tokens[0].lineNumber).toEqual(0); // No new lines before token
        expect(tokens[0].charNumber).toEqual(0); // Token starts at the first character
      });

      // Test token after a newline
      it('tracks line and char number for token after newline', () => {
        const tokens = tokenizer('\ntoken2');
        expect(tokens[0].lineNumber).toEqual(1); // One new line before token
        expect(tokens[0].charNumber).toEqual(0); // Token starts at the first character of the second line
      });

      // Test token after a space and a newline
      it('tracks line and char number for token after space and newline', () => {
        const tokens = tokenizer(' \ntoken3');
        expect(tokens[0].lineNumber).toEqual(1); // One new line before token
        expect(tokens[0].charNumber).toEqual(0); // Token starts at the first character of the second line
      });

      // Test tokens on multiple lines
      it('tracks line and char numbers for tokens on multiple lines', () => {
        const tokens = tokenizer('token4\ntoken5\ntoken6');
        expect(tokens[0].lineNumber).toEqual(0);
        expect(tokens[0].charNumber).toEqual(0); 
        expect(tokens[1].lineNumber).toEqual(1);
        expect(tokens[1].charNumber).toEqual(0); 
        expect(tokens[2].lineNumber).toEqual(1);
        expect(tokens[2].charNumber).toEqual(0); 
        expect(tokens[3].lineNumber).toEqual(2);
        expect(tokens[3].charNumber).toEqual(0); 
        expect(tokens[4].lineNumber).toEqual(2);
        expect(tokens[4].charNumber).toEqual(0); 
      });

      // Test tokens after characters and spaces on the same line
      it('tracks line and char numbers for tokens after characters and spaces', () => {
        const tokens = tokenizer('pre_token7 post_token8');
        expect(tokens[0].lineNumber).toEqual(0);
        expect(tokens[0].charNumber).toEqual(0); // First token starts after "pre " (4 characters in)
        expect(tokens[1].lineNumber).toEqual(0);
        expect(tokens[1].charNumber).toEqual(11); // Second token starts after "pre token7 post " (14 characters in)
      });
    });

  })
});
