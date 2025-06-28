# Turtle handling

The data of the turtles must be stored in the interpreter in a special global variable called turtles.
It must be something like this:
turtles = [
    {
        name: string
        group: string
        listen: true 
        position: {
            x: number
            y: number
        }
        home: {
            x: number
            y: number
        }
        pencolor: PenColor
        penwidth: number
        penstate: PenState
        customData: { }
    }
]

When this is modified by the code directly, a callback must be called
When the environment modifies this, it must call a function.
The drawing commands and everything else must be implemented inside of the interpreter, the env should receive events only about drawing.

## Steps

1) Memory must be inicialized ( ca4c53106b76410d310208a19a36296444c9fa0d )
2) Every move logic must be implemented in interpreter
