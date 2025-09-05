import React, { useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import './ProjectExplorer.css';
import File from "./File.js"
import { createNewDirectory, createNewFile, deleteFileOrFolder } from "../../utils/FileHandling.js";
import { Interpreter } from "web-logo-core";

type FileOrFolderName = {
  name: string
}

export type FileOrFolder = {
  isFile: boolean;
  isFolder: boolean;
} & FileOrFolderName;

export type FileCategory = "lgo" | "lgl" | "unknown";

export function getFileCategory(file : FileOrFolderName) {
  if ( isLgoFile(file) ) return "lgo";
  if ( isLglFile(file) ) return "lgl";
  return "unknown"; 
}

export function isLglFile(v : FileOrFolderName) {return v.name.endsWith(".lgl")}
export function isLgoFile(v : FileOrFolderName) {return v.name.endsWith(".lgo")}
export const alphabeticFileOrFolderSort = (a : FileOrFolderName, b : FileOrFolderName) => (a.name == b.name) ? 0 : Number(a.name > b.name)*2-1;


type FolderProps = {
  name: string;
  handle: FileSystemDirectoryHandle;
  onFileDoubleClick: (file: FileSystemFileHandle) => void;
  parentDir: FileSystemDirectoryHandle;
  refreshParent: () => Promise<unknown>;
  interpreter : Interpreter;
};

const Folder: React.FC<FolderProps> = ({ name, handle, onFileDoubleClick, parentDir, refreshParent, interpreter }) => {
  const [items, setItems] = useState<FileOrFolder[] | null>(null);
  const [handles, setHandles] = useState<Record<string, FileSystemHandle>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    if (!isOpen) {
      await toggleFolder();
    } else {
      await reloadingContent();
    }
  }

  const reloadingContent = async () => {
    setIsLoading(true);

    try {
      const newItems: FileOrFolder[] = [];
      const newHandles: Record<string, FileSystemHandle> = {};

      // Fetch folder entries asynchronously
      for await (const [childName, childHandle] of handle.entries()) {
        newItems.push({
          name: childName,
          isFile: childHandle.kind === "file",
          isFolder: childHandle.kind === "directory",
        });
        newHandles[childName] = childHandle;
      }

      setItems(newItems);
      setHandles(newHandles);
      setIsOpen(true);
    } catch (error) {
      console.error("Error reading folder contents:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleFolder = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    await reloadingContent();
  };

  return (
    <div>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            onClick={toggleFolder}
            style={{
              cursor: "pointer",
              fontWeight: isOpen ? "bold" : "normal",
            }}
          >
            📁 {name} {isOpen ? "▼" : "▶"}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content className="context-menu">
          <ContextMenu.Item
            className="context-menu-item"
            onSelect={async () => {
              await createNewDirectory(handle);
              await refresh();
            }}
          >
            New folder
          </ContextMenu.Item>
          <ContextMenu.Item
            className="context-menu-item"
            onSelect={async () => {
              await createNewFile(handle);
              await refresh();
            }}
          >
            New file
          </ContextMenu.Item>  
          <ContextMenu.Item
            className="context-menu-item"
            onSelect={async () => {
              await deleteFileOrFolder(handle, parentDir)
              await refreshParent();
            }}
          >
            Delete (empty)
          </ContextMenu.Item>          
        </ContextMenu.Content>
      </ContextMenu.Root>
      {isOpen && isLoading && <p>Loading...</p>}
      {isOpen && !isLoading && items && (
        <div style={{ marginLeft: "20px" }}>
          {items.map((item, index) =>
            item.isFolder ? (
              <Folder
                parentDir={handle}
                refreshParent={refresh}
                interpreter={interpreter}
                key={index}
                name={item.name}
                handle={handles[item.name] as FileSystemDirectoryHandle}
                onFileDoubleClick={onFileDoubleClick}
              />
            ) : (
              <File
                refreshParent={refresh}
                parentDir={handle}
                name={item.name}
                handle={handles[item.name] as FileSystemFileHandle}
                interpreter={interpreter}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Folder;