import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Turtle from './components/turtle/Turtle';
import { turtleCommandPubSub } from './pubsub/pubsubs';
import CommandLine from './components/CommandLine/CommandLine';

function App() {
  return (
    <div className="App">
      <DrawingCanvas width={800} height={600}>
        <Turtle name="Leo" />
      </DrawingCanvas>
      <CommandLine maxLines={10}/>
    </div>
  );
}

function sleep(ms : number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default App;
