import config from '../../config';
import { executeCode, getWritableStream } from "../../utils/FileHandling";
import { Interpreter } from "web-logo-core";
import { commandLinePubSub } from "../../pubsub/pubsubs";
import sleep from "../../utils/async-sleep";

function openCodeEditorPopup(popupName : string) {
  return window.open(
    `${config.basename}/code-editor`,
    popupName,
    `
    width=600,
    height=400,
    top=${window.screenY + 100},
    left=${window.screenX + 100},
    toolbar=no,
    location=no,
    directories=no,
    status=no,
    menubar=no,
    scrollbars=no,
    resizable=yes
    `
  );
}

export function openCodeEditor(handle : FileSystemFileHandle, interpreter : Interpreter) {
  getWritableStream(handle).then(async (writableHandle) => {
    // After I aquired the writableHandle from the main page, I can aquire it from the popup, too
    const popup = openCodeEditorPopup(handle.name+"-editor");
    if (popup) {
      delete (popup as any).readyForSharedData;
      while ((popup as any).readyForSharedData !== true) {
        await sleep(100);
      }
      (popup as (Window & {sharedData: {
        fileHandle: FileSystemFileHandle,
        interpreter: Interpreter,
        executeCode : (str : string)=> Promise<void>,
      }})).sharedData = {
        fileHandle: handle,
        interpreter,
        executeCode: (code) => executeCode(code, interpreter, commandLinePubSub),
      }
    } else {
      alert("Popup blocked! Please allow popups for this website.");
    }
  });
}



