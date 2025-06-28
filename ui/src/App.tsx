import React, { useRef } from 'react';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace.js';
import CodeEditor from './views/CodeEditor.js';
import { getQueryParam } from './utils/get-query-params.js';
import WebInterpreterHooks from './interpreter-hooks/WebInterpreterHooks.js';

// Using query parameters instead of React Router paths because GitHub Pages and other static hosts 
// don't support client-side routing.
// It effectively replaces the router logic with manual rendering based on URL query parameters.

function App() {
  const interpreterHooks = useRef<WebInterpreterHooks>(new WebInterpreterHooks());
  const interpreter = useRef<Interpreter>(new Interpreter(interpreterHooks.current));
  const isCodeEditor = getQueryParam('code-editor') !== null;

  if (isCodeEditor) return <CodeEditor/>;
  return <Workspace interpreter={interpreter.current} interpreterConfig={interpreterHooks.current}/>;
  
}

export default App;
