import React from 'react';
import DrawingCanvas from '../components/DrawingCanvas';
import Turtle from '../components/turtle/Turtle';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core'
import CommandLine from '../components/CommandLine/CommandLine';
import ProjectExplorer from '../components/ProjectExplorer/ProjectExplorer';
import { Interpreter } from 'web-logo-core';
import { commandLinePubSub, useSubscriber } from '../pubsub/pubsubs';

export default function Workspace({interpreter } : {interpreter : Interpreter}) {
  useSubscriber(turtleCommandPubSub, (message) => {
    console.log({message})
    if (message.topic != "trace") return;
    switch (message.command) {
      case "print":
        commandLinePubSub.publish({
          topic: 'commandLine',
          content: message.message,
          error: message.error,
        })
        break;
    };
  });

  return <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PanelGroup direction="horizontal">
      {/* Resizable Side Panel */}
      <Panel defaultSize={15} style={{ backgroundColor: "#f0f0f0" }}>
        <ProjectExplorer
          onFileDoubleClick={(e) => window.alert(`e: ${e}`)}
          interpreter={interpreter}
        />
      </Panel>
      {/* Resize Handle */}
      <PanelResizeHandle style={{ backgroundColor: "#ccc", cursor: "col-resize", width: "5px" }} />
      {/* Main Content */}
      <Panel minSize={1}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={90} minSize={1}>
            <DrawingCanvas>
              <Turtle name="Leo" />
            </DrawingCanvas>
          </Panel>
          <PanelResizeHandle style={{ backgroundColor: "#ccc", cursor: "col-resize", height: "5px" }} />
          <Panel>
            <CommandLine maxLines={10} interpreter={interpreter} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  </div>
}