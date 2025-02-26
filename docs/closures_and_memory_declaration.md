# Closures

A closure is a function that captures and retains access to its surrounding lexical scope, even after that scope has exited. This allows it to remember and use variables from its outer function, making it useful for encapsulation, callbacks, and functional programming patterns. Closures are common in languages like JavaScript, Python, and Swift, where functions are first-class citizens.

# Creating vs. setting a variable

To support closures properly, WebLogo must support correct variable declarations and settings.
Finished @ bea8e53de5ad1295d44edf49e8cee33d5da70928

# Handling return values

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

## Implementation

The language needs a new command, the `return`. It must stop the execution of the current procedure, and must write a specific variable received from the caller. (If received.)
The caller can give a variable to store the returned value with a new command: 
```
let returnVariableName := command arg1 arg2 arg3
new returnVariableName := command arg1 arg2 arg3
```

The `let` will use an existing variable, the `new` will create a new variable at the current level.