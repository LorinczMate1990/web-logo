# Basic syntax

the only commment option is the # character that comments everything after it in the line, just like Python
The comment character must be the first character in the line or it must be after a whitespace

## Sections

A double comment ( ## ) has a special meaning, it breaks a single script file into multiple sections. This is not a core language concept, but the concept of the editor

# Technical details

The comments must be handled before the tokenization.
Everything must be thrown out after the first token starting with # character

If it would be handled after the tokenization, the following lines would be syntax error

```
# Commented this out { 
{
  forward 100
}
```