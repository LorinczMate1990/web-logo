
import { getWritableStream, readFile, writeFile } from '../../utils/FileHandling.js'
import { useEffect, useState } from "react";
import { Interpreter } from "web-logo-core";
import EditorMenu from './EditorMenu.js';
import MultilinedEditor from './NumberedEditor.js';
import "./LogoSyntax.css"

type CodeEditorContent = {
  openedFile: FileSystemFileHandle;
  executeCode: (code: string) => Promise<void>;
  interpreter: Interpreter;
};

export default function CodeEditorContent({ openedFile, executeCode, interpreter }: CodeEditorContent) {
  const [saved, setSaved] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const content = await readFile(openedFile);
      if (isMounted) {
        setFileContent(content);
      }
    })();

    return () => {
      isMounted = false; // Cleanup in case the component unmounts before the promise resolves
    };
  }, []);

  useEffect(() => {
    let handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Prompt the user before closing the popup
      let message = true;
      event.returnValue = message;
      return message;
    };

    if (!saved) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (!saved) {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, [saved]);

  if (fileContent == null) return <h1> Loading... </h1>

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <EditorMenu
        run={() => executeCode(fileContent)}
        save={async () => {
          const writableOpenedFile = await getWritableStream(openedFile);
          await writeFile(writableOpenedFile, fileContent);
          setSaved(true);
        }}
      />

      <MultilinedEditor
        keywords={interpreter.getKeywordList()}
        fileContent={fileContent}
        onValueChange={(code) => {
          setSaved(false);
          setFileContent(code);
        }}
      />
    </div>
  );
}