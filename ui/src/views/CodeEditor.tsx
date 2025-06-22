import CodeEditorContent from "../components/CodeEditor/CodeEditorContent.js";
import useSharedData from "../components/CodeEditor/useSharedData.js";

export default function CodeEditor() {

  const sharedData = useSharedData();

  if (sharedData) {
    return <CodeEditorContent 
      openedFile={sharedData.fileHandle}
      executeCode={sharedData.executeCode}
      interpreter={sharedData.interpreter}
    />
  }
  return <div>Loading</div>
}
