# Combining drawing commands

typesafe-bus 1.1.1 has a feature that makes combinings messages in the same topic possible. 
Using this feature, most of the messages can be combined

# Starting state

The performance improvement is measured by mandelbrot.lgo.
The starting runtime is 3.7 seconds. 

Strange that the execution time is longer (4 sec) when the environment won't execute the interpreter with a sleep. Propably because of the buffered drawing instructions.

