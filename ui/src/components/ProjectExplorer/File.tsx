import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import './ProjectExplorer.css';
import { openCodeEditor } from "./MenuActions";
import { deleteFileOrFolder, executeFile } from "../../utils/FileHandling";
import { Interpreter } from "web-logo-core";

type FileProps = {
  name: string;
  handle: FileSystemFileHandle;
  parentDir: FileSystemDirectoryHandle;
  refreshParent: () => Promise<unknown>;
  interpreter : Interpreter;
};

const File: React.FC<FileProps> = ({ name, handle, parentDir, refreshParent, interpreter }) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div
          onDoubleClick={() => openCodeEditor(handle)}
          className="file"
        >
          📄 {name}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="context-menu">
        <ContextMenu.Item
          className="context-menu-item"
          onSelect={() => executeFile(handle, interpreter)}
        >
          Run code
        </ContextMenu.Item>
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
