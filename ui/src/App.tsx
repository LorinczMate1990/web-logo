import React, { useRef } from 'react';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import CodeEditor from './views/CodeEditor';

function App() {
  const interpreter = useRef<Interpreter>(new Interpreter());

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Workspace interpreter={interpreter.current}/>} />
        <Route path="/code-editor" element={<CodeEditor/>} />
      </Routes>
    </BrowserRouter>    
  );
}

export default App;
