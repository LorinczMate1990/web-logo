# Closures

A closure is a function that captures and retains access to its surrounding lexical scope, even after that scope has exited. This allows it to remember and use variables from its outer function, making it useful for encapsulation, callbacks, and functional programming patterns. Closures are common in languages like JavaScript, Python, and Swift, where functions are first-class citizens.

## Creating vs. setting a variable

To support closures properly, WebLogo must support correct variable declarations and settings.
Finished @ bea8e53de5ad1295d44edf49e8cee33d5da70928

## Handling return values

Procedures must be able to return with something. Some use cases:
* Return with an other procedure (needed for closures anyway)
* Create custom functions for expressions

Return values can be implemented in several ways:
* The procedure that returns with a value must be used as an expression
    * To do this is a long-term goal, but it would not fit into the language
* The caller gives a reference that could be modified by the procedure
    * This is a useful feature, but it's hard to understand. The purpose of language is to facilitate learning, and a simple return mechanism is important
* The procedure writes a dedicated global variable that is readed from the caller
    * This is a simple method, but it's not a true return mechanism, it's just a hack
    * This could be supported by syntax sugar. For example, a `returnwith <value>` command could write it and a `retrive()` function could read it 
* The procedure has (hidden) write access to a specific variable from the caller
    * This is similar to the global variable version, but it's cleaner
    * With proper syntax sugar, this would act exactly as in C

### Implementation

The language needs a new command, the `return`. It must stop the execution of the current procedure, and must write a specific variable received from the caller. (If received.)
The caller can give a variable to store the returned value with a new command: 
```
let returnVariableName <= command arg1 arg2 arg3
new returnVariableName <= command arg1 arg2 arg3
```

The `let` will use an existing variable, the `new` will create a new variable at the current level.
Storing the return value using a general purpose let/new is not good, because the programmer won't be able to copy an executable variable.
Let's assume that `foo` is an executable.
`let ret := foo ` can mean execute foo and copy its return value to ret or copy foo to ret.

Handling return values needs a new syntax:

`COMMAND arg1 arg2 arg3 ... => variable`
OR
`COMMAND arg1 arg2 arg3 ... => new variable`

The later will create a new, local variable, the first one will use an existing variable.
Using this method, simple argument evaluation is also possible by a new `eval` command.

Created @ b049fd741f60cc6ffe4737c0c473598b0c3b496d

The issue with this is syntax is that this is uncommon, unintuitive and complex, so using it for a learning language is bad idea.
The syntax must be the following:

For saving the return value: `existingVariableName := COMMAND arg1 arg2 ... ` or `new newVariableName := COMMAND arg1 arg2 ... `
For saving the value of an expression: `existingVariableName := expression ` or `new newVariableName := expression `
For creating an alias for a command: `existingVariableName := EVAL COMMAND ` or `new newVariableName := EVAL COMMAND`
For creating an alias for an executable variable: `existingVariableName := EVAL executableVariable ` or `new newVariableName := EVAL executableVariable`

The resolving logic will be the following:
1) If it is an executable, it must be executed, and the return value must be given back
2) If it's a variable, the variable must be copied (by reference when using structured variables)
3) If it's neither, it must be tried to be evaluated as an expression



## Using closures

Closures can be used after the return and set was implemented. See the closure/closure.lgo.

The factory function creates a scope for counter variable which is not a global one, but the counter instances can increase it.
The script ends with an error, when the code tries to use the counter directly.

An other interesting result of closures and structs is a primitive OOP-like functionality that can encapsulate some functions with their data and hide the data itself. (See closure/oop.lgo)