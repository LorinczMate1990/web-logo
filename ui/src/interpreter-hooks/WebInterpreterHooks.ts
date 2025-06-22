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
    console.log("Create session ID", sessionId);
    this.table[sessionId] = {startTime: Date.now(), lastSleep : Date.now()};
  }

  async afterFinishSession({sessionId} : {sessionId : string}) {
    console.log("Delete session ID", sessionId);
    delete this.table[sessionId];
  }

  async afterError({sessionId, error} : {sessionId : string, error : Error}) {
    console.log("Create session ID", sessionId);
    console.log("Error catched: ", error);
    delete this.table[sessionId];
  }

  async beforeRunNewCommand({sessionId} : {sessionId : string}) : Promise<void> {
    const currentTime = Date.now();
    if (!(sessionId in this.table)) {
      console.log("Error: Session ID ", sessionId, " is unknown.\n Creating it...");
      this.table[sessionId] = {startTime: Date.now(), lastSleep : Date.now()};
    }
    if (currentTime - this.table[sessionId].startTime > this.killTime) throw new Error("Timeout");

    const lastTime = this.table[sessionId].lastSleep;
    if (currentTime - lastTime > this.asyncTime) {
      await sleep(0);
      this.table[sessionId].lastSleep = currentTime;
    }
  }
}