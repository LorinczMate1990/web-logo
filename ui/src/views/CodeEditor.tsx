import { Interpreter } from "web-logo-core";

export default function CodeEditor({ interpreter }: { interpreter: Interpreter }) {
  const sharedData = (window as unknown as (Window & {sharedData: {fileHandle: FileSystemFileHandle}})).sharedData;
  return <h1>{sharedData.fileHandle.name}</h1>
}