# Structured memory

## State before 08eba66152c4bf519166a3cf1419d99bd31b2d38

The memory can store strings and CodeBlock factories.
In theory, it supports structured memory, but the implementation is not full nor consequent.

## Goal

The WebLogo must support arrays and structs as symply and clearly as possible.

### Supporting arrays and strings

Using array and string literals are easy and straight-forward.
When a parameter contains something between [ and ] or " and ", it's an array/string.
Strings are arrays containing numbers. The `'<chr>` form must be also handled, but it is just a numeric literal. (Its value is the char code.) Important: There is no closing ', because it's just redundant and it suggests that it is possible to use more chars.

So the following two arrays are the same: `[65, 66, 67]` and `"abc"`.

The elements of arrays can be any expressions, they can hold other arrays or anything.
The array form can not be used in an expression, it can be used only as a parameter.

### Supporting structs

Named structs are important, but WebLogo won't support struct literals. Structs must be built using functions. It is currently not possible, but userdefined functions will support output parameters.

## Development

### Strong types

The memory must be strongly typed: It must have numeric cell type.
Was done @ bde85efdafadbe0226adf019020c27649265277e

### Tokenization

The content between " " or [ ] must be handled as a single token, like the content between ( and )
Except the outer [ and ] must be kept. Maybe it is a design flaw that the Tokeinzer removes the outer ( and ).

### numericEval -> genericEval

The numericEval must support any kind of expression. Currently it supports non-numeric values as intermediate results.