
import { getWritableStream, readFile, writeFile } from '../../utils/FileHandling.js'
import { useEffect, useState } from "react";
import { Interpreter } from "web-logo-core";
import EditorMenu from './EditorMenu.js';
import MultilinedEditor from './NumberedEditor.js';
import "./LogoSyntax.css"
import { getFileCategory } from '../ProjectExplorer/Folder.js';

type CodeEditorContent = {
  openedFile: FileSystemFileHandle;
  executeCode: (code: string) => Promise<void>;
  interpreter: Interpreter;
};

function getLineForCursorPos(lines : string[], cursorPos : number) : number {
  let charCounter = 0;
  let lineNumber = 0; 
  while (charCounter < cursorPos) {
    charCounter += lines[lineNumber].length + 1; 
    lineNumber++;
  }
  return lineNumber-1;
}

function getMarkedSections(code : string, firstChar : number, lastChar : number) : string {
  const lines = code.split("\n");
  if (firstChar == -1 || lastChar == -1 || firstChar > code.length || lastChar > code.length) return "";
  let firstLine = getLineForCursorPos(lines, firstChar);
  let lastLine = getLineForCursorPos(lines, lastChar);
  
  while (firstLine >= 0 && !lines[firstLine--].match(/^##.*/) );
  firstLine++;
  while (lastLine <= lines.length-1 && !lines[lastLine++].match(/^##.*/) );
  lastLine--;

  const selectedLines = lines.slice(firstLine, lastLine+1);
  return selectedLines.join("\n");
}

export default function CodeEditorContent({ openedFile, executeCode, interpreter }: CodeEditorContent) {
  const [saved, setSaved] = useState(true);
  const [firstHighlightedChar, setFirstHighlightedChar] = useState(-1);
  const [lastHighlightedChar, setLastHighlightedChar] = useState(-1);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const fileName = openedFile.name;

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
        runSection={() => executeCode(getMarkedSections(fileContent, firstHighlightedChar, lastHighlightedChar))}
        save={async () => {
          const writableOpenedFile = await getWritableStream(openedFile);
          await writeFile(writableOpenedFile, fileContent);
          setSaved(true);
        }}
        fileCategory={getFileCategory({name: fileName})}
      />

      <MultilinedEditor
        keywords={interpreter.getKeywordList()}
        onCursorPositionChange={(start, end) => {
          setFirstHighlightedChar(start);
          setLastHighlightedChar(end);
        }}
        fileContent={fileContent}
        onValueChange={(code) => {
          setSaved(false);
          setFileContent(code);
        }}
      />
    </div>
  );
}