The following script is the MWE:

```
clear
savecanvas "originalSetup"
forward 100
restorecanvas "originalSetup"
```

Here the canvas shold be empty, but it shows a line.

First, I have to add logs for UI to see what happens.

According to the logs, the line was exexuted before the saveCanvas.

```
Clear screen
Workspace.tsx:63 Line:  [{…}]0: {x0: 200, y0: 200, x1: 300, y1: 200, color: Array(3), …}length: 1[[Prototype]]: Array(0)
Workspace.tsx:40 Save canvas
Workspace.tsx:44 Restore canvas
```

This issue is propably in the message queue.

Found a small bug there, but it had no anything with this bug.

Checking the commands itself. Somehow it looks like the savecanvas goes to the end of the queue

Other test code: 

```
clear
savecanvas "originalSetup"
forward 10
print "Hello"
forward 100
restorecanvas "originalSetup"
```

Here, the lines are combined.

Found the root cause and the bug I found in the pubsubs.ts was not a bug.
The current queue implementation won't keep the message order between different topics.
This is not a bug, but a design choice. Every topics are independent.
So I have to redesign the messages to keep the instructions in a single topic where order is important.
The only relevant thing here is the savecanvas and restorecanvas.