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
  table : {[key : string]: {startTime : number, lastSleep : number}} = {};

  constructor() {
    this.lastTime = Date.now();
  }

  async beforeStartSession({sessionId} : {sessionId : string}) {
    this.table[sessionId] = {startTime: Date.now(), lastSleep : Date.now()};
  }

  async afterFinishSession({sessionId} : {sessionId : string}) {
    delete this.table[sessionId];
  }

  async afterError({sessionId, error} : {sessionId : string, error : Error}) {
    console.log("Error catched: ", error);
    delete this.table[sessionId];
  }

  async beforeRunNewCommand({sessionId} : {sessionId : string}) : Promise<void> {
    const currentTime = Date.now();
    if (currentTime - this.table[sessionId].startTime > 10000) throw new Error("Timeout");

    const lastTime = this.table[sessionId].lastSleep;
    if (currentTime - lastTime > 1000) {
      await sleep(0);
      this.table[sessionId].lastSleep = currentTime;
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
