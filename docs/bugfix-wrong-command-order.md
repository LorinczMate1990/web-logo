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