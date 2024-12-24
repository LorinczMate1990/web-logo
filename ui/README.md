# Web logo

This project brings to life a modernized web-based implementation of the classic Logo programming environment, renowned for its "turtle graphics" – a method of programming vector graphics using a relative cursor (the "turtle"). It's ingeniously designed around React and TypeScript, leveraging the latest web technologies to offer a seamless and interactive coding experience directly from your browser.

# Introduction

This Logo variant has a special syntax, but it follows the traditions and philosophy of the original Logo. It's main purpose is to give an easy-to-use, text-based programming language for children to learn the basics of cycles, parameters, functions, control flow and recursion.

The programmer can give instruction to one or more turtles who can draw on the display or just appear/disappear and move with their sprite. The programmer gets immadiate feedback, while executing commands or command files.

# About the language

The language is very simple, and it has some unusual features compared to traditional programming languages.

A program in this logo consists of instructions which can be built-in or custom-made. The instructions can use parameters and expressions. Every expression must be a valid, numeric (or logical) expression.

## Parameters and expressions

An instruction can have zero or more parameters and it must be closed by a semicolon. The parameter list is not wrapped in anything and is separated by spaces. This means that the expressions can't have any spaces.

Here is a command with two parameters:
```
command 1+4+5 12/34*a;
```

And here is a command with 8 (invalid parameters):
```
command 1 + 4 + 5   12/34 * a;
```

The parameter list can go to multiple lines, the linebreak has the same effect as space. So the following command is called also with two parameters:

```
command
1+4+5
12/34*a;
```

The number of spaces or enters doesn't matter. 

In case of complicated expressions, using spaces can be important for readability. In this case, wrapping the expression in ( and ) will make it possible to use spaces inside of them. The following command has only two parameters:

```
command (1 + 3) (3 + 4)
```

## Comments

The programmer can comment out a line, everything after `//` will be ignored. Logo has no block comments.

## Variables




# Basic language examples

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

The `learn` instruction can create new keywords. These keywords can have a fixed number of parameters. 

In the background, the `learn` keyword defines a new variable that has a codeblock as value, so learns can be nested, and the learned name should not be an already existing parameter (it will be overwritten). The learn keyword has a syntax sugar: its non-last parameters are interpreted as string literals. This means that a learned word can reuse already existing parameter names, and expressions cannot be used.

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

### Using parameters in expressions

```
learn poligon length sides {
    rep sides {
        f length; 
        l 360/sides; 
    }
};

poligon 100 8;
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

It is possible to pass a named function to an other function, too. In this case, the function can have parameters.

```
learn formRepeater length number form {
    rep number { 
        form length; 
        l 360/number;
    }
};

learn rectangle sideLength {
    rep 4 { 
        f sideLength;
        l 90;
    }
};

formRepeater 100 6 rectangle
```

### Recursion

Using the custom commands, fractals can be made. Here is a tree fractal:

```
learn fractal deep len { 
    f len; 
    penwidth deep
    if deep>0 {
        right 30; 
        fractal deep-1 len/2; 
        left 60; 
        fractal deep-1 len/2; 
        right 30;
    }; 
    b len; 
};

fractal 5 100;
```


```
rep 36 {
   penup; rep 10 {f 1; l 1;}; pendown;
   rep 360 { f 0.5; l 1;}
}
```

### Nested learning

Learn keywords can be nested. In this case, the nested function can "reuse" the same variables. This is the so-called "shadowing".

```
learn foo a b c {
    learn bar a b c {
        repeat a {
            f b
            l c
        }
    }

    repeat a {
        bar a b c
        f b
        r c
    }

}

foo 4 50 90
```

### Using keywords as input parameter

Keywords cannot be used as user-defined functions in an argument list, a wrapper function must be used.

The following code demonstates this. The first call of example will throw an error.

```

learn foo n { f n }
learn bar n { l n }

learn example go turn {
    repeat 4 {
        go 50
        turn 90
    }
}

example f l
example foo bar

```