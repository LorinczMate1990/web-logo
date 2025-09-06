export default interface WebInterpreterHooksConfig {
  setAsyncTime(value: number) : void;
  getAsyncTime() : number;
  stopEveryScripts() : void;
  letScriptsRunning() : void;
}