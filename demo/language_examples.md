# Language examples

In this document, some small code shows you the programming language itself.

## Basic geoometry

In this section, there are only simple instructions.

### Rectangle

``` 
forward 100;
left 90;
forward 100;
left 90;
forward 100;
left 90;
forward 100; 
left 90;
```

### Triangle with abbrevations

``` 
f 100;
l 120;
f 100;
l 120;
f 100;
l 120;
```

## Fix repeater

This section demonstrates the repeating capability.

### Rectangle

```
repeat 4 {
    forward 100;
    left 90;
}
```

### Circle

```
rep 360 {
    f 1;
    l 1;
}
```

### Spiral

This example shows the usage of the automaticly created cycle variable. It can be used in conditions or expressions

```
repeat 360 {
    f i*0.01;
    left 1;
}
```

## Branching

The `if` instruction needs three input parameters: A condition, a true branch and an optional false branch. If the expression is non-zero, the true-branch will be executed, otherwise the false branch.

### Basic branch

```
if 4 {
    f 100; 
} { 
    f 10; 
}
```

## Functions

The `learn` instruction can create new keywords. These keywords can have a fixed number of parameters. Currently the parameters must be numbers or expressions, custom commands can not execute code blocks.

### Rectangle as a function

```
learn rectangle sideLength {
    rep 4 { 
        f sideLength;
        l 90;
    }
};

repeat 10 { 
    rectangle i*10; 
}
```

### Using code as input parameter

It is possible to use inline codeblocks as input parameter for named functions.

```
learn formRepeater number codeblock {
    rep number { 
        codeblock; 
        l 360/number;
    }
};

formRepeater 6 {
    rep 4 {
        f 100;
        l 90;
    }
};
```

!!! Important: When a command is passed to be executed, the { and } must be used:

```
learn formRepeater number codeblock {
    rep number { 
        codeblock; 
        l 360/number;
    }
};

learn rectangle sideLength {
    rep 4 { 
        f sideLength;
        l 90;
    }
};

formRepeater 6 { 
    rectangle 100
};
```