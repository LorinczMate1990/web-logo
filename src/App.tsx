import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Turtle from './components/turtle/Turtle';
import { turtleCommandPubSub } from './pubsub/pubsubs';
import CommandLine from './components/CommandLine/CommandLine';

function App() {
  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '80%' }}>
        <DrawingCanvas>
          <Turtle name="Leo" />
        </DrawingCanvas>
      </div>
      <div style={{ flex: '20%', overflow: 'hidden' }}>
        <CommandLine maxLines={10} />
      </div>
    </div>
  );
}


function sleep(ms : number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default App;
