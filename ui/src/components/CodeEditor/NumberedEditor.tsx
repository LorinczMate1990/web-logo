import Editor from "react-simple-code-editor";
import getLogoLanguagePrismModel from "./LogoSyntax.js";
import { highlight } from "prismjs";
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import "./editor.css"


type MultilinedEditorProps = {
  keywords: string[],
  onValueChange: (value: string) => void,
  fileContent: string,
}

export default function MultilinedEditor({ keywords, fileContent, onValueChange }: MultilinedEditorProps) {
  const logoModel = getLogoLanguagePrismModel(keywords);

  return <div
    style={{
      flex: 1,
      overflow: "auto",
    }}
  >
    <div className={"editor-container"}>
      <Editor
        value={fileContent}
        onValueChange={onValueChange}
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