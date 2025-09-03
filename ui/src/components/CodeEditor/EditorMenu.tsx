import "./menu.css"

type EditorMenuProps = {
  run: () => Promise<void>,
  runSection: () => Promise<void>,
  save: () => Promise<void>,
}

export default function EditorMenu({ run, runSection, save }: EditorMenuProps) {
  return <div className="menu-header">
    <button className={"menu-button"} onClick={run}>Run</button>
    <button className={"menu-button"} onClick={runSection}>Run Section</button>
    <button className={"menu-button"} onClick={save}>Save</button>
  </div>
}