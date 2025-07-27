# Combining drawing commands

typesafe-bus 1.1.1 has a feature that makes combinings messages in the same topic possible. 
Using this feature, most of the messages can be combined

# Starting state

The performance improvement is measured by mandelbrot.lgo.
The starting runtime is 3.7 seconds. 

Strange that the execution time is longer (4 sec) when the environment won't execute the interpreter with a sleep. Propably because of the buffered drawing instructions.

# Replacing publish by addToQueue 

Just by this replace, got 0.6 sec speedup, when there is no interrupt in the code.
Now execution with 100ms interruption is practically the same as before (3.7), but execution without any interruption is just 3.4 sec.

Commit hash: 3781556ee76acc4d6c31999b1418fe0463629cf3

Issue is, that the interruption won't flush the command queue, but it was fixed in the next commit.