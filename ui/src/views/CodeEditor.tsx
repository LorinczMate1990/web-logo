import { Interpreter } from "web-logo-core";
import { executeCode, getWritableStream, readFile, writeFile } from '../utils/FileHandling'
import { useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import { commandLinePubSub } from "../pubsub/pubsubs";
import sleep from "../utils/async-sleep";


function getLogoLanguagePrismModel(interpreter : Interpreter) {
  const keywords = interpreter.getKeywordList();
  return languages.extend('clike', {
    keyword: new RegExp(`\\b(?:${keywords.join('|')})\\b`),
    number: /\b(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
    operator: {
        pattern: /(^|[^.])(?:\+\+|--|&&|\|\||->|=>|<<|>>>?|==|!=|[<>]=?|[+\-*/%&|^=!<>])(?!=)/,
        lookbehind: true
    },
  });
}

type SharedData = {
  fileHandle: FileSystemFileHandle,
  executeCode: (code : string) => Promise<void>,
  interpreter : Interpreter,
};

export default function CodeEditor() {

  const [sharedData, setSharedData] = useState<SharedData | undefined>();
  useEffect(() => {
    async function retriveSharedData() {
      let sharedData = undefined;
      while (sharedData === undefined) {
        (window as any).readyForSharedData = true;
        sharedData = (window as unknown as (Window & { sharedData:  SharedData })).sharedData;
        if (!sharedData) await sleep(100);
      }
      setSharedData(sharedData)
    }
    retriveSharedData();
  }, [setSharedData]);

  if (sharedData) {
    return <CodeEditorContent sharedData={sharedData}/>
  }
  return <div>Loading</div>
}

function CodeEditorContent({sharedData} : {sharedData : SharedData}) {
  
  const openedFile = sharedData.fileHandle;
  const preparedExecuteCode = sharedData.executeCode;
  const interpreter = sharedData.interpreter;

  const logoModel = getLogoLanguagePrismModel(interpreter);

  const [saved, setSaved] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const save = async () => {
    if (fileContent) {
      const writableOpenedFile = await getWritableStream(openedFile);
      await writeFile(writableOpenedFile, fileContent);
      setSaved(true);
    }
  }
  
  const run = async () => {
    if (fileContent) {
      await preparedExecuteCode(fileContent);
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Floating buttons container */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "10px",
          zIndex: 10,
          display: "flex",
          gap: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <button onClick={run}>Run</button>
        <button onClick={save}>Save</button>
      </div>
  
      {/* Scrollable editor */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {fileContent === null ? (
          <h1>Loading...</h1>
        ) : (
          <Editor
            value={fileContent}
            onValueChange={(code) => {
              setSaved(false);
              setFileContent(code);
            }}
            highlight={(code) => highlight(code, logoModel, "javascript")}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              minHeight: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
}