export default interface WebInterpreterHooksConfig {
  setKillTime(value: number) : void;
  setAsyncTime(value: number) : void;
  getKillTime() : number;
  getAsyncTime() : number;
}