// Function to create a new file
export const createNewFile = async (parentHandle: FileSystemDirectoryHandle) => {
  const fileName = window.prompt("Enter the name of the new file:");
  if (fileName == null) {
    console.log("Error creating file: File creation canceled.");
    return;
  }

  const fileHandle = await parentHandle.getFileHandle(fileName, { create: true });
  console.log(`File "${fileName}" created successfully.`);
  return fileHandle;
};

// Function to create a new directory
export const createNewDirectory = async (parentHandle: FileSystemDirectoryHandle) => {
  const dirName = window.prompt("Enter the name of the new directory:");
  if (!dirName)  {
    console.log("Error creating directory: Directory creation canceled.");
    return;
  }

  const dirHandle = await parentHandle.getDirectoryHandle(dirName, { create: true });
  console.log(`Directory "${dirName}" created successfully.`);
  return dirHandle;
};

const renameFileOrFolder = async (handle: FileSystemHandle) => {
  // TODO This seems impossible.
  // Maybe by recreating and removing the file, but I won't do that.
};

// Function to delete a file or folder
export const deleteFileOrFolder = async (handle: FileSystemHandle, parentHandle: FileSystemDirectoryHandle) => {
  try {
    const confirmation = window.confirm(`Are you sure you want to delete "${handle.name}"?`);
    if (!confirmation) {
      console.log("Deletion is canceled");
      return;
    }

    await parentHandle.removeEntry(handle.name); // This is not recursive by design
    console.log(`Deleted "${handle.name}".`);
  } catch (error) {
    if ((error as Error).name == "InvalidModificationError" ) {
      window.alert("You can only delete empty folder");
    } else {
      console.error("Error deleting file or folder:", error);
    }
  }
};
