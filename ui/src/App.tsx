import React, { useRef } from 'react';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import CodeEditor from './views/CodeEditor';
import config from './config';
import { getQueryParam } from './utils/get-query-params';

// Using query parameters instead of React Router paths because GitHub Pages and other static hosts 
// don't support client-side routing.
// It effectively replaces the router logic with manual rendering based on URL query parameters.

function App() {
  const interpreter = useRef<Interpreter>(new Interpreter());
  const isCodeEditor = getQueryParam('code-editor') !== null;

  console.log({isCodeEditor})

  if (isCodeEditor) return <CodeEditor/>;
  return <Workspace interpreter={interpreter.current}/>;
  
}

export default App;
