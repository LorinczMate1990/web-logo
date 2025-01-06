import React from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Turtle from './components/turtle/Turtle';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import CommandLine from './components/CommandLine/CommandLine';
import ProjecrExplorer from './components/ProjectExplorer/ProjectExplorer';

function App() {
  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PanelGroup direction="horizontal">
        {/* Resizable Side Panel */}
        <Panel defaultSize={20} style={{ backgroundColor: "#f0f0f0" }}>
          <ProjecrExplorer
            onFileDoubleClick={(e) => window.alert(`e: ${e}`)}
          />
        </Panel>
        {/* Resize Handle */}
        <PanelResizeHandle style={{ backgroundColor: "#ccc", cursor: "col-resize", width: "5px" }} />
        {/* Main Content */}
        <Panel>
          <PanelGroup direction="vertical">
            <Panel defaultSize={20}>
              <DrawingCanvas>
                <Turtle name="Leo" />
              </DrawingCanvas>
            </Panel>
            <PanelResizeHandle style={{ backgroundColor: "#ccc", cursor: "col-resize", height: "5px" }} />
            <Panel>  
              <CommandLine maxLines={10} />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}


function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default App;
