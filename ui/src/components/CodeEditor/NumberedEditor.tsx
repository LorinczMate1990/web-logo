import Editor from "react-simple-code-editor";
import getLogoLanguagePrismModel from "./LogoSyntax.js";
import { highlight } from "prismjs";
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import "./editor.css"
import { useRef } from "react";


type MultilinedEditorProps = {
  keywords: string[],
  onValueChange: (value: string) => void,
  onCursorPositionChange: (start : number, end : number) => void,
  fileContent: string,
}

export default function MultilinedEditor({ keywords, fileContent, onValueChange, onCursorPositionChange }: MultilinedEditorProps) {
  const logoModel = getLogoLanguagePrismModel(keywords);
  const editorRef = useRef<HTMLDivElement | null>(null);

  function handleCursorUpdate() {
    if (!editorRef.current) return;
    const textarea = editorRef.current?.querySelector('textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    onCursorPositionChange(start, end);
  }

  return <div
    style={{
      flex: 1,
      overflow: "auto",
    }}
  >
    <div className={"editor-container"} ref={editorRef}>
      <Editor
        onClick={handleCursorUpdate}
        onKeyUp={handleCursorUpdate}

        value={fileContent}
        onValueChange={onValueChange}
        onSelectionChange={(a: any) => console.log("got something: ", a)}

        highlight={(code) =>
          highlight(code, logoModel, "javascript")
            .split('\n')
            .map(
              (line, index) =>
                `<div style="position: relative;"><span class="container-editor-line-number">${index + 1}</span><span>${line} </span></div>`

            )
            .join('')
        }
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          minHeight: "100%",
        }}
      />
    </div>
  </div>
}