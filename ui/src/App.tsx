import React, { useRef } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Turtle from './components/turtle/Turtle';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import CommandLine from './components/CommandLine/CommandLine';
import ProjecrExplorer from './components/ProjectExplorer/ProjectExplorer';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import CodeEditor from './views/CodeEditor';

function App() {
  const interpreter = useRef<Interpreter>(new Interpreter());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workspace interpreter={interpreter.current}/>} />
        <Route path="/code-editor" element={<CodeEditor/>} />
      </Routes>
    </BrowserRouter>    
  );
}


function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default App;
