import { Commands, tokensToCommandList } from "./CommandList";
import { Token } from "./Tokenizer";

describe('tokensToCommandList', () => {
  // Test a simple command without arguments
  it('parses a simple command without arguments', () => {
    const tokens = [new Token("command1", 0, 0), new Token("\n", 0, 8)];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command1");
    expect(commands[0].arguments).toEqual([]);
  });

  it('parses a simple command without arguments and return value', () => {
    const tokens = [new Token("command1", 0, 0), new Token("=>", 0, 8), new Token("foo", 0, 10), new Token("\n", 0, 13)];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command1");
    expect(commands[0].returnVariable).toEqual("foo");
    expect(commands[0].arguments).toEqual([]);
  });

  // Test commands with single and multiple word arguments
  it('parses commands with single and multiple word arguments', () => {
    const tokens = [
      new Token("command2", 0, 0), new Token("arg1", 0, 9),
      new Token("arg2 with spaces", 0, 14), new Token("\n", 0, 33)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command2");
    expect(commands[0].arguments).toEqual(["arg1", "arg2 with spaces"]);
  });

  // Test nested commands
  it('parses nested commands correctly', () => {
    const tokens = [
      new Token("command3", 0, 0), new Token("{", 0, 9),
      new Token("subCommand1", 1, 1), new Token("\n", 1, 12),
      new Token("}", 2, 0), new Token("\n", 2, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command3");
    expect(commands[0].arguments.length).toEqual(1);
    expect(Array.isArray(commands[0].arguments[0])).toBe(true);
    const nestedCommands = commands[0].arguments[0] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand1");
    expect(nestedCommands[0].arguments).toEqual([]);
  });

  // Test multiple top-level commands
  it('parses multiple top-level commands', () => {
    const tokens = [
      new Token("command4", 0, 0), new Token("\n", 0, 8),
      new Token("command5", 1, 0), new Token("arg3", 1, 9), new Token("\n", 1, 13)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(2);
    expect(commands[0].label).toEqual("command4");
    expect(commands[1].label).toEqual("command5");
    expect(commands[1].arguments).toEqual(["arg3"]);
  });

  // Test complex scenario with nested commands and arguments
  it('handles complex scenarios with nested commands and arguments', () => {
    const tokens = [
      new Token("command6", 0, 0), new Token("{", 0, 9),
      new Token("subCommand2", 1, 1), new Token("arg4", 1, 13), new Token("\n", 1, 17),
      new Token("}", 2, 0), new Token("\n", 2, 1),
      new Token("command7", 3, 0), new Token("arg5", 3, 9), new Token("\n", 3, 13)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(2);
    expect(commands[0].label).toEqual("command6");
    expect(commands[1].label).toEqual("command7");
    expect(commands[1].arguments).toEqual(["arg5"]);
    const nestedCommands = commands[0].arguments[0] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand2");
    expect(nestedCommands[0].arguments).toEqual(["arg4"]);
  });

  // Test for empty commands
  it('ignores empty commands', () => {
    const tokens = [new Token("\n", 0, 0), new Token("\n", 1, 0)];
    const commands = tokensToCommandList(tokens);
    expect(commands).toEqual([]);
  });

  // Test for commands with no terminating newline
  it('parses commands correctly even without a terminating newline', () => {
    const tokens = [new Token("command10", 0, 0), new Token("arg6", 0, 10)];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command10");
    expect(commands[0].arguments).toEqual(["arg6"]);
  });

  // Test for nested commands without a terminating newline
  it('parses nested commands correctly even without a terminating newline', () => {
    const tokens = [
      new Token("command11", 0, 0), new Token("{", 0, 10),
      new Token("subCommand3", 1, 0), new Token("\n", 1, 11),
      new Token("}", 2, 0)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command11");
    const nestedCommands = commands[0].arguments[0] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand3");
    expect(nestedCommands[0].arguments).toEqual([]);
  });

  // Test for a command series containing both arguments and nested commands
  it('handles a command series with both arguments and nested commands', () => {
    const tokens = [
      new Token("command12", 0, 0), new Token("arg7", 0, 10), new Token("{", 0, 15),
      new Token("subCommand4", 1, 0), new Token("arg8", 1, 12), new Token("\n", 1, 16),
      new Token("}", 2, 0), new Token("\n", 2, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command12");
    expect(commands[0].arguments.length).toEqual(2);
    expect(commands[0].arguments[0]).toEqual("arg7");
    const nestedCommands = commands[0].arguments[1] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand4");
    expect(nestedCommands[0].arguments).toEqual(["arg8"]);
  });

  it('parses deeply nested commands correctly', () => {
    const tokens = [
      new Token("command13", 0, 0), new Token("{", 0, 10),
      new Token("subCommand5", 1, 0), new Token("{", 1, 12),
      new Token("subSubCommand1", 2, 0), new Token("\n", 2, 15),
      new Token("}", 3, 0), new Token("\n", 3, 1),
      new Token("}", 4, 0), new Token("\n", 4, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command13");
    const nestedCommands = commands[0].arguments[0] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand5");
    const subNestedCommands = nestedCommands[0].arguments[0] as Commands;
    expect(subNestedCommands[0].label).toEqual("subSubCommand1");
  });

  // Test commands with mixed usage of brackets and parentheses
  it('handles commands with mixed brackets and parentheses correctly', () => {
    const tokens = [
      new Token("command14", 0, 0), new Token("(arg with spaces and (parentheses))", 0, 10), 
      new Token("{", 0, 45), new Token("subCommand6", 1, 0), new Token("\n", 1, 11),
      new Token("}", 2, 0), new Token("\n", 2, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command14");
    expect(commands[0].arguments[0]).toEqual("(arg with spaces and (parentheses))");
    const nestedCommands = commands[0].arguments[1] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand6");
  });

  // Test for commands with arguments followed by nested commands without a separating space
  it('parses commands with arguments followed directly by nested commands', () => {
    const tokens = [
      new Token("command17", 0, 0), new Token("arg9", 0, 10),
      new Token("{", 0, 14), new Token("subCommand8", 1, 0), new Token("\n", 1, 11),
      new Token("}", 2, 0), new Token("\n", 2, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("command17");
    expect(commands[0].arguments.length).toEqual(2);
    expect(commands[0].arguments[0]).toEqual("arg9");
    const nestedCommands = commands[0].arguments[1] as Commands;
    expect(nestedCommands[0].label).toEqual("subCommand8");
  });

  it('parses commands with arguments followed directly by nested commands without the new line before closing }', () => {
    const tokens = [
      new Token("rep", 0, 0), new Token("10", 0, 10),
      new Token("{", 0, 14), new Token("f", 1, 0), new Token("10", 1, 11),
      new Token("}", 2, 0), new Token("\n", 2, 1)
    ];
    const commands = tokensToCommandList(tokens);
    expect(commands.length).toEqual(1);
    expect(commands[0].label).toEqual("rep");
    expect(commands[0].arguments.length).toEqual(2);
    expect(commands[0].arguments[0]).toEqual("10");
    const nestedCommands = commands[0].arguments[1] as Commands;
    expect(nestedCommands[0].label).toEqual("f");
    expect(nestedCommands[0].arguments.length).toEqual(1);
    
  }); 
});
