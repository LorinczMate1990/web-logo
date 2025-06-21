import { InterpreterHooks } from "web-logo-core";
import sleep from "../utils/async-sleep";

export default class WebInterpreterHooks implements InterpreterHooks {
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