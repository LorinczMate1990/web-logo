import { InterpreterHooks } from "web-logo-core";
import sleep from "../utils/async-sleep.js";
import WebInterpreterHooksConfig from "./WebInterpreterHooksConfig.js";

export default class WebInterpreterHooks implements InterpreterHooks, WebInterpreterHooksConfig {
  lastTime = 0;
  table : {[key : string]: {startTime : number, lastSleep : number}} = {};

  killTime = 100000;
  asyncTime = 100;

  setKillTime(value: number) {
    this.killTime = value;
  }

  setAsyncTime(value: number) {
    this.asyncTime = value;
  }  

  constructor() {
    this.lastTime = Date.now();
  }
  getKillTime(): number {
    return this.killTime;
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
    if (currentTime - this.table[sessionId].startTime > this.killTime) throw new Error("Timeout");

    const lastTime = this.table[sessionId].lastSleep;
    if (currentTime - lastTime > this.asyncTime) {
      flushCommandQueue();
      await sleep(0);
      this.table[sessionId].lastSleep = currentTime;
    }
  }
}