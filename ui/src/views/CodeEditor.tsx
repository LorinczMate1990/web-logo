import CodeEditorContent from "../components/CodeEditor/CodeEditorContent";
import useSharedData from "../components/CodeEditor/useSharedData";

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
