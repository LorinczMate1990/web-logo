export function openCodeEditor(handle : FileSystemFileHandle) {
  const popup = window.open(
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

  if (popup) {
    (popup as (Window & {sharedData: {fileHandle: FileSystemFileHandle}})).sharedData = {
      fileHandle: handle,
    }
  } else {
    alert("Popup blocked! Please allow popups for this website.");
  }
}



