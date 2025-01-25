import { Interpreter } from "web-logo-core";
import { getWritableStream, readFile, writeFile } from '../utils/FileHandling'
import { useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another


export default function CodeEditor({ interpreter }: { interpreter: Interpreter }) {
  const sharedData = (window as unknown as (Window & { sharedData: { fileHandle: FileSystemFileHandle} })).sharedData;
  const openedFile = sharedData.fileHandle;

  const [saved, setSaved] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const save = async () => {
    console.log("navigator.userActivation: ", (window.navigator as any).userActivation)
    if (fileContent) {
      const writableOpenedFile = await getWritableStream(openedFile);
      await writeFile(writableOpenedFile, fileContent);
      setSaved(true);
    }
  }
  
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

  return (
    <div>
      <button onClick={save}>Save</button>
      {fileContent === null ? <h1>Loading...</h1> :
        <Editor
          value={fileContent}
          onValueChange={code => {
            console.log("On Value changed")
            setSaved(false);
            setFileContent(code);
          }}
          highlight={code => highlight(code, languages.js, "javascript")}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
          
        />
      }
    </div>
  );
}