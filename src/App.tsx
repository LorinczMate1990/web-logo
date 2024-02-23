import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Turtle from './components/turtle/Turtle';
import { turtleCommandPubSub } from './pubsub/pubsubs';

function App() {
  return (
    <div className="App">
      <DrawingCanvas width={800} height={600}>
        <Turtle name="Leo" />
      </DrawingCanvas>
    </div>
  );
}

function sleep(ms : number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

async function test() {
  console.log("Test is running");
  await sleep(1000);
  turtleCommandPubSub.publish({
    topic: "turtleCommand",
    command: "forward",
    distance: 100
  });

  console.log("Forward finished");
  await sleep(1000);
  turtleCommandPubSub.publish({
    topic: "turtleCommand",
    command: "right",
    radian: 3.14/2
  });

  console.log("Turning finished");
  await sleep(1000);
  turtleCommandPubSub.publish({
    topic: "turtleCommand",
    command: "forward",
    distance: 100
  });

  console.log("Finished");
}

test();

export default App;
