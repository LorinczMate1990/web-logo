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

repeat 360 {
    f i*0.01;
    left 1;
}