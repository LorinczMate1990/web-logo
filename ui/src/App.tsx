import React, { useRef } from 'react';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import CodeEditor from './views/CodeEditor';
import config from './config';

function App() {
  const interpreter = useRef<Interpreter>(new Interpreter());

  return (
    <BrowserRouter basename={config.basename}>
      <Routes>
        <Route path="/" element={<Workspace interpreter={interpreter.current}/>} />
        <Route path="/code-editor" element={<CodeEditor/>} />
      </Routes>
    </BrowserRouter>    
  );
}

export default App;
