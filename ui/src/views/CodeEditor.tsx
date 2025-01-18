import { Interpreter } from "web-logo-core";
import { readFile } from '../utils/FileHandling'
import { useEffect, useState } from "react";

export default function CodeEditor({ interpreter }: { interpreter: Interpreter }) {
  const sharedData = (window as unknown as (Window & { sharedData: { fileHandle: FileSystemFileHandle } })).sharedData;
  const openedFile = sharedData.fileHandle;

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
  }, [openedFile]);

  return (
    <div>
      {fileContent === null ? <h1>Loading...</h1> : <h1>{fileContent}</h1>}
    </div>
  );
}