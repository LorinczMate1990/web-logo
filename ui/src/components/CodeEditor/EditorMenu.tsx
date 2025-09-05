import { FileCategory } from "../ProjectExplorer/Folder.js";
import "./menu.css"

type EditorMenuProps = {
  run: () => Promise<void>,
  runSection: () => Promise<void>,
  save: () => Promise<void>,
  fileCategory: FileCategory,
}

export default function EditorMenu({ run, runSection, save, fileCategory }: EditorMenuProps) {
  return <div className="menu-header">
    {(fileCategory == "lgo") && <>
      <button className={"menu-button"} onClick={save}>Save</button>
      <button className={"menu-button"} onClick={run}>Run</button>
      <button className={"menu-button"} onClick={runSection}>Run Section</button>
    </>}
    {(fileCategory == "lgl") && <>
      <button className={"menu-button"} onClick={() => {
        save();
        run();
      }}>Save & Run</button>
    </>}
  </div>
}