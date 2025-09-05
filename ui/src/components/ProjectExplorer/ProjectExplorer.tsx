import React, { useRef, useState } from "react";
import './ProjectExplorer.css';
import * as ContextMenu from "@radix-ui/react-context-menu";
import Folder, { alphabeticFileOrFolderSort, FileOrFolder, isLglFile, isLgoFile } from "./Folder.js";
import File from "./File.js";
import { createNewDirectory, createNewFile, executeFile } from "../../utils/FileHandling.js";
import { Interpreter } from "web-logo-core";
import { useLocalFiles } from "../../context/LocalFileContext.js";

const ProjectExplorer: React.FC<{
  onFileDoubleClick: (file: FileSystemFileHandle) => void;
  interpreter: Interpreter;
  openInterpreterSettings: () => void;
}> = ({ onFileDoubleClick, interpreter, openInterpreterSettings }) => {
  const rootHandle = useRef<FileSystemDirectoryHandle | null>(null);
  const [items, setItems] = useState<FileOrFolder[] | null>(null);
  const localFileRegistry = useLocalFiles();
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    await reloadContentList();
  };

  const orderFilesAndFolders = (list: FileOrFolder[]) => {
    const folders = list.filter(v => v.isFolder).sort(alphabeticFileOrFolderSort);
    const lglFiles = list.filter(v => v.isFile && isLglFile(v)).sort(alphabeticFileOrFolderSort);
    const lgoFiles = list.filter(v => v.isFile && isLgoFile(v)).sort(alphabeticFileOrFolderSort);
    const otherFiles = list.filter(v => v.isFile && !isLgoFile(v) && !isLglFile(v)).sort(alphabeticFileOrFolderSort);

    return [
      ...folders,
      ...lglFiles,
      ...lgoFiles,
      ...otherFiles
    ];
  }

  const reloadContentList = async () => {
    const lglFiles: FileOrFolder[] = [];
    const newItems: FileOrFolder[] = [];
    for (const key in localFileRegistry) {
      delete localFileRegistry[key];
    }

    setIsLoading(true);
    try {
      if (!rootHandle.current) {
        throw new Error("There is no root dir");
      }

      for await (const [name, handle] of rootHandle.current.entries()) {
        const newItem: FileOrFolder = {
          name,
          isFile: handle.kind === "file",
          isFolder: handle.kind === "directory",
        };
        newItems.push(newItem);
        if (isLglFile(newItem)) lglFiles.push(newItem);
        localFileRegistry[name] = handle;
      }

      const orderedNewItems = orderFilesAndFolders(newItems);

      setItems(orderedNewItems);
    } catch (error) {
      console.error("Error opening folder:", error);
    } finally {
      setIsLoading(false);
    }

    for (const lglFile of lglFiles) {
      const handle = localFileRegistry[lglFile.name] as FileSystemFileHandle;
      await executeFile(handle, interpreter)
    }
  };

  const openFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      rootHandle.current = dirHandle;
      await reloadContentList();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // The user aborted, nothing to do
      } else {
        throw error;
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={openFolder} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Open Folder
        </button>
        <button
          onClick={openInterpreterSettings}
          style={{ padding: "10px", fontSize: "16px" }}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {rootHandle.current !== null && (
        <div style={{ marginTop: "20px" }}>
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <h3>Project Explorer</h3>
            </ContextMenu.Trigger>
            <ContextMenu.Content className="context-menu">
              <ContextMenu.Item
                className="context-menu-item"
                onSelect={async () => {
                  await createNewDirectory(rootHandle.current!);
                  refresh();
                }}
              >
                New folder
              </ContextMenu.Item>
              <ContextMenu.Item
                className="context-menu-item"
                onSelect={async () => {
                  await createNewFile(rootHandle.current!);
                  refresh();
                }}
              >
                New file
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
          {isLoading && <p>Loading...</p>}
          {items && !isLoading && rootHandle && (
            <div style={{ marginLeft: "20px" }}>
              {items.map((item, index) =>
                item.isFolder ? (
                  <Folder
                    refreshParent={refresh}
                    interpreter={interpreter}
                    key={index}
                    name={item.name}
                    handle={localFileRegistry[item.name] as FileSystemDirectoryHandle}
                    parentDir={rootHandle.current!}
                    onFileDoubleClick={onFileDoubleClick}
                  />
                ) : (
                  <File
                    refreshParent={refresh}
                    interpreter={interpreter}
                    name={item.name}
                    parentDir={rootHandle.current!}
                    handle={localFileRegistry[item.name] as FileSystemFileHandle}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectExplorer;
