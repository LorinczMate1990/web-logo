# Generalization of commands

Currently, turtles can execute a variety of commands, such as:
- moving forward
- rotating
- returning to a previously saved position
- etc.

These commands resemble a SIMD (Single Instruction, Multiple Data) architecture, where a single instruction is executed by multiple processing units (turtles), each operating on its own internal state.

The goal of this feature is to generalize command execution, allowing users to define custom state spaces and logic for each turtle.

## Basic idea

A new keyword, `emit`, will be introduced. It takes a string (method name) as its first argument, followed by a variable number of additional arguments.

When invoked, `emit` will attempt to call a method with the given name on each observing turtle. If the method does not exist on a turtle, nothing is called for that turtle.

Each method receives the $turtles array containing only the current turtle, a this (later)  parameter as injected parameters from the upper scope, along with all additional arguments passed to emit. This can guarantee a sandbox environment, the method doesn't have to pay attention to keep the state of other turtles clean.

Methods must be attached individually to each turtle. This allows turtles to define different behaviors under the same method name, enabling a form of polymorphism.

## Implementation

The turtles have a currently unused customData member. This will be renamed to customLogic to show clearer its intended usage. (This will be the injected this parameter). This must be an object, but can contain anything. This is where `emit` will try to find a callable function.