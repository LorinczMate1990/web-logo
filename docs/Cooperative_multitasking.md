# Cooperative multitasking

The main idea is to let the programmer use some await-like instruction that let other parts of the code to be executed.


# Proof of concept

The start from Koch curves is a slow procedure, and with the current code, it appears immadiatly.
First, I just put an async sleep inside of the execute function. I expect to see the turtle moving.

Here is the code:

```
  async execute() {
    for (let command of this.commands) {
      await sleep(0);
      const label = command.label;
      // TODO This should be done from the ArgumentParser,
      const packedArguments = command.arguments.map((arg) => {
```

The result is as I expected, I saw the whole path of the turtle, yet the drawing was much mor slower overall.

# Implementation

The wait command with or without parameter suspends the execution for an async cycle or for a given time. Using this, the programmer can give the CPU time for other tasks.