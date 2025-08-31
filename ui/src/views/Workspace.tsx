import React, { useEffect, useRef, useState } from 'react';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas.js';
import Turtle, { TurtleVisibility } from '../components/turtle/Turtle.js';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { turtleCommandPubSub } from 'web-logo-core'
import CommandLine from '../components/CommandLine/CommandLine.js';
import ProjectExplorer from '../components/ProjectExplorer/ProjectExplorer.js';
import { Interpreter } from 'web-logo-core';
import { commandLinePubSub, useSubscriber } from '../pubsub/pubsubs.js';
import InterpreterSettingsModal from '../components/InterpreterSettings/InterpreterSettingsModal.js';
import WebInterpreterHooksConfig from '../interpreter-hooks/WebInterpreterHooksConfig.js';
import Turtles from '../components/turtle/Turtles.js';
import CanvasStateStore from '../utils/CanvasStateStore.js';

export default function Workspace({ interpreter, interpreterConfig }: { interpreter: Interpreter, interpreterConfig: WebInterpreterHooksConfig }) {
  const drawingCanvasRef = useRef<DrawingCanvasRef | null>(null);
  const drawingCanvasStateStoreRef = useRef<CanvasStateStore>(new CanvasStateStore());

  useEffect(() => {
    drawingCanvasStateStoreRef.current.setCanvas(drawingCanvasRef.current);
  }, [drawingCanvasRef.current, drawingCanvasStateStoreRef.current])

  const [turtleVisibility, setTurtleVisibility] = useState<TurtleVisibility>("visible");
  const [isCanvasFocused, setCanvasFocused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  useSubscriber(turtleCommandPubSub, (message) => {
    try {
      if (message.topic == "systemCommand") {
        switch (message.command) {
          case "print":
            commandLinePubSub.publish({
              topic: 'commandLine',
              content: message.message,
              error: message.error,
            })
            break;
        };
      }
      if (message.topic == 'drawing') {
        switch (message.command) {
          case "fill": {
            const x = message.x;
            const y = message.y;
            const color = message.color;
            drawingCanvasRef.current?.fill(x, y, color);
            break;
          }
          case "clearScreen":
            drawingCanvasRef.current?.clearCanvas();
            break;
          case "line": {
            for (const segment of message.segments) {
              const x0 = segment.x0;
              const y0 = segment.y0;
              const x1 = segment.x1;
              const y1 = segment.y1;
              const color = segment.color;
              const penWidth = segment.penWidth;
              drawingCanvasRef.current?.drawLine(x0, y0, x1, y1, color, penWidth);
            }
            break;
          }
          case "saveCanvas":
            drawingCanvasStateStoreRef.current?.saveState(message.label);
            break;
          case "restoreCanvas":
            drawingCanvasStateStoreRef.current?.restoreState(message.label);
            break;
          case "capture":
            drawingCanvasStateStoreRef.current?.savePart(message.label, message.x, message.y, message.width, message.height);
            break;
        };
      }
    } catch (e) {
      const err = e as Error;
      commandLinePubSub.publish({
        topic: 'commandLine',
        content: err.message,
        error: true,
      })
    }
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

  return <>
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PanelGroup direction="horizontal">
        {/* Resizable Side Panel */}
        <Panel defaultSize={15} style={{ backgroundColor: "#f0f0f0" }}>
          <ProjectExplorer
            onFileDoubleClick={(e) => window.alert(`e: ${e}`)}
            interpreter={interpreter}
            openInterpreterSettings={() => setIsSettingsOpen(true)}
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
                {/* Somehow I must detect every turtles here and build the turtles dynamically */}
                <Turtles globalVisibility={turtleVisibility} />
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


    <InterpreterSettingsModal
      visible={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      config={interpreterConfig}
    />
  </>
}