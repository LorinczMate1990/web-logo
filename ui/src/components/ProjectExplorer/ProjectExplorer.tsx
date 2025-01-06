import React, { useState } from 'react';

type FileOrFolder = {
  name: string;
  isFile: boolean;
  isFolder: boolean;
};

const ProjecrExplorer: React.FC = () => {
  const [items, setItems] = useState<FileOrFolder[]>([]);

  const openFolder = async () => {
    try {
      // Request a directory handle from the user
      const dirHandle = await window.showDirectoryPicker();

      const newItems: FileOrFolder[] = [];

      // Iterate through the directory entries
      for await (const [name, handle] of dirHandle.entries()) {
        newItems.push({
          name,
          isFile: handle.kind === "file",
          isFolder: handle.kind === "directory",
        });
      }

      // Update the state with the directory contents
      setItems(newItems);
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <button onClick={openFolder} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Open Folder
      </button>
      <div style={{ marginTop: '20px' }}>
        <h3>Folder Contents:</h3>
        <ul>
          {items.length > 0 ? (
            items.map((item, index) => (
              <li key={index}>
                {item.name} ({item.isFile ? 'File' : 'Folder'})
              </li>
            ))
          ) : (
            <p>No folder opened or folder is empty.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProjecrExplorer;
