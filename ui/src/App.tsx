import React, { useRef } from 'react';
import { Interpreter } from 'web-logo-core';
import Workspace from './views/Workspace';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import CodeEditor from './views/CodeEditor';
import config from './config';
import { getQueryParam } from './utils/get-query-params';
import InterpreterWorker from './workers/interpreter?worker';
import { CommandData, InterpreterHooks } from 'web-logo-core/dist/types';
import sleep from './utils/async-sleep';

// Using query parameters instead of React Router paths because GitHub Pages and other static hosts 
// don't support client-side routing.
// It effectively replaces the router logic with manual rendering based on URL query parameters.

class Hooks implements InterpreterHooks {
  lastTime = 0;

  constructor() {
    this.lastTime = Date.now();
  }

  async beforeRunNewCommandHook() : Promise<void> {
    const currentTime = Date.now();
    if (currentTime - this.lastTime > 1000) {
      this.lastTime = currentTime;
      console.log("Before sleep");
      await sleep(0);
      console.log("Made a sleep");
    }
  }
}

function App() {
  const interpreter = useRef<Interpreter>(new Interpreter(new Hooks()));
  const isCodeEditor = getQueryParam('code-editor') !== null;

  console.log({isCodeEditor})

  if (isCodeEditor) return <CodeEditor/>;
  return <Workspace interpreter={interpreter.current}/>;
  
}

export default App;
