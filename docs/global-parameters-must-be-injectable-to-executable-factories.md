# Global variable environments

There can be special global parameters that must be hidden from the call tree completly to create a sandboxed environment. To achive this, the executableFactory instances must be able to create executables with a priority getter.

When this getter is not undefined, the global parameters must be checked here first.

# Motivation

To create a sandboxed environment for turtle manipulation (like in emit, or new turtle), the $turtles global variable must be replaced with a special one.
Otherwise, the inline environment will work correctly, but the called functions will see the global $turtles array.