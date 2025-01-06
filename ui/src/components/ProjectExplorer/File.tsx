import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import './ProjectExplorer.css';
import { createNewDirectory, createNewFile, deleteFileOrFolder } from "./MenuActions";

type FileProps = {
  name: string;
  handle: FileSystemFileHandle;
  onDoubleClick: (file: FileSystemFileHandle) => void;
  parentDir: FileSystemDirectoryHandle;
  refreshParent: () => Promise<unknown>;
};

const File: React.FC<FileProps> = ({ name, handle, onDoubleClick, parentDir, refreshParent }) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onDoubleClick={() => onDoubleClick(handle)}
          className="file"
        >
          📄 {name}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="context-menu">
        <ContextMenu.Item
          className="context-menu-item"
          onSelect={() => console.log(`Can't rename it currently...`)}
        >
          Rename
        </ContextMenu.Item>        
        <ContextMenu.Item
          className="context-menu-item"
          onSelect={async () => {
            await deleteFileOrFolder(handle, parentDir);
            await refreshParent();
          }}
        >
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

export default File;
