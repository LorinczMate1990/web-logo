import { InterpreterHooks } from "web-logo-core";
import sleep from "../utils/async-sleep.js";
import WebInterpreterHooksConfig from "./WebInterpreterHooksConfig.js";

export default class WebInterpreterHooks implements InterpreterHooks, WebInterpreterHooksConfig {
  lastTime = 0;
  table : {[key : string]: {startTime : number, lastSleep : number}} = {};

  asyncTime = 100;
  preventStartingNewCommands = false;

  setAsyncTime(value: number) {
    this.asyncTime = value;
  }  

  constructor() {
    this.lastTime = Date.now();
  }
  stopEveryScripts(): void {
    this.preventStartingNewCommands = true;
  }
  letScriptsRunning(): void {
    this.preventStartingNewCommands = false;
  }

  getAsyncTime(): number {
    return this.asyncTime;
  }

  async beforeStartSession({sessionId} : {sessionId : string}) {
    this.table[sessionId] = {startTime: Date.now(), lastSleep : Date.now()};
  }

  async afterFinishSession({sessionId} : {sessionId : string}) {
    delete this.table[sessionId];
  }

  async afterError({sessionId, error} : {sessionId : string, error : Error}) {
    delete this.table[sessionId];
  }

  async beforeRunNewCommand({sessionId, flushCommandQueue} : {sessionId : string, flushCommandQueue: () => void}) : Promise<void> {
    const currentTime = Date.now();
    if (!(sessionId in this.table)) {
      this.table[sessionId] = {startTime: Date.now(), lastSleep : Date.now()};
    }
    
    if (this.preventStartingNewCommands) throw new Error("The UI has blocked the continuation of the script");

    const lastTime = this.table[sessionId].lastSleep;
    if (currentTime - lastTime > this.asyncTime) {
      flushCommandQueue();
      await sleep(0);
      this.table[sessionId].lastSleep = currentTime;
    }
  }
}