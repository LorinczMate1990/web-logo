import React, { useEffect, useRef, useState } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';
import Turtle, { TurtleVisibility } from '../components/turtle/Turtle';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core'
import CommandLine from '../components/CommandLine/CommandLine';
import ProjectExplorer from '../components/ProjectExplorer/ProjectExplorer';
import { Interpreter } from 'web-logo-core';
import { commandLinePubSub, useSubscriber } from '../pubsub/pubsubs';

export default function Workspace({interpreter } : {interpreter : Interpreter}) {
  const drawingCanvasRef = useRef<DrawingCanvasRef | null>(null);
  const [turtleVisibility, setTurtleVisibility] = useState<TurtleVisibility>("visible");
  const [isCanvasFocused, setCanvasFocused] = useState(false);

  useSubscriber(turtleCommandPubSub, (message) => {
    if (message.topic != "systemCommand") return;
    switch (message.command) {
      case "print":
        commandLinePubSub.publish({
          topic: 'commandLine',
          content: message.message,
          error: message.error,
        })
        break;
      case "clearScreen":
        drawingCanvasRef.current?.clearCanvas();
        break;
    };
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isCanvasFocused) return;
      if (event.key === "+") {
        setTurtleVisibility("visible");
      }
      if (event.key === "-") {
        setTurtleVisibility("invisible");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isCanvasFocused]);  

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
            <DrawingCanvas 
              onFocus={() => setCanvasFocused(true)}
              onBlur={() => setCanvasFocused(false)}
              ref={drawingCanvasRef}
            >
              <Turtle name="Leo" globalVisibility={turtleVisibility}/>
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