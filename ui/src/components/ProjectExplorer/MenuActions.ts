import { Writable } from "stream";
import { getWritableStream } from "../../utils/FileHandling";

function openCodeEditorPopup() {
  return window.open(
    "/code-editor", // Your desired React route
    "popupWindow",
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

export function openCodeEditor(handle : FileSystemFileHandle) {
  getWritableStream(handle).then((writableHandle) => {
    // After I aquired the writableHandle from the main page, I can aquire it from the popup, too
    const popup = openCodeEditorPopup();
    if (popup) {
      (popup as (Window & {sharedData: {fileHandle: FileSystemFileHandle}})).sharedData = {
        fileHandle: handle,
      }
    } else {
      alert("Popup blocked! Please allow popups for this website.");
    }
  });
}



