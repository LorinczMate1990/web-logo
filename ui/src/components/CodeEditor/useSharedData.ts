import { useEffect, useState } from "react";
import { Interpreter } from "web-logo-core";
import sleep from "../../utils/async-sleep.js";

export type SharedData = {
  fileHandle: FileSystemFileHandle,
  executeCode: (code: string) => Promise<void>,
  interpreter: Interpreter,
};

export default function useSharedData() : SharedData | undefined {
  const [sharedData, setSharedData] = useState<SharedData | undefined>(undefined);
  useEffect(() => {
    async function retriveSharedData() {
      let sharedData = undefined;
      while (sharedData === undefined) {
        (window as any).readyForSharedData = true;
        sharedData = (window as unknown as (Window & { sharedData:  SharedData })).sharedData;
        if (!sharedData) await sleep(100);
      }
      setSharedData(sharedData)
    }
    retriveSharedData();
  }, [setSharedData]);
  return sharedData;
}