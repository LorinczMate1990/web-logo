import React, { useRef, useState } from "react";
import './ProjectExplorer.css';
import * as ContextMenu from "@radix-ui/react-context-menu";
import Folder, { FileOrFolder } from "./Folder";
import File from "./File";
import { createNewDirectory, createNewFile } from "../../utils/FileHandling";
import { Interpreter } from "web-logo-core";

const ProjectExplorer: React.FC<{
  onFileDoubleClick: (file: FileSystemFileHandle) => void;
  interpreter : Interpreter,
}> = ({ onFileDoubleClick, interpreter }) => {
  const rootHandle = useRef<FileSystemDirectoryHandle | null>(null);
  const [items, setItems] = useState<FileOrFolder[] | null>(null);
  const [handles, setHandles] = useState<Record<string, FileSystemHandle>>({});
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    await reloadContentList();
  }

  const reloadContentList = async () => {
    try {
      if (!rootHandle.current) {
        throw new Error("There is no root dir");
      }
      setIsLoading(true);

      const newItems: FileOrFolder[] = [];
      const newHandles: Record<string, FileSystemHandle> = {};

      for await (const [name, handle] of rootHandle.current.entries()) {
        newItems.push({
          name,
          isFile: handle.kind === "file",
          isFolder: handle.kind === "directory",
        });
        newHandles[name] = handle;
      }

      setItems(newItems);
      setHandles(newHandles);
    } catch (error) {
      console.error("Error opening folder:", error);
    } finally {
      setIsLoading(false);
    }
  }

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
      <button onClick={openFolder} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Open Folder
      </button>
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
                    handle={handles[item.name] as FileSystemDirectoryHandle}
                    parentDir={rootHandle.current!}
                    onFileDoubleClick={onFileDoubleClick}
                  />
                ) : (
                  <File
                    refreshParent={refresh}
                    interpreter={interpreter}
                    name={item.name}
                    parentDir={rootHandle.current!}
                    handle={handles[item.name] as FileSystemFileHandle}
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
