import { Interpreter } from "web-logo-core";
import { CommandLineMessage, commandLinePubSub } from "../pubsub/pubsubs";
import PubSub from "typesafe-bus";

export const readFile = async (handle: FileSystemFileHandle) => {
  // Get a file object from the handle
  const file = await handle.getFile();

  // Read the content of the file
  const content = await file.text();
  return content;
}

export const getWritableStream = async (handle: FileSystemFileHandle) => {
  return (handle as any).createWritable() as FileSystemWritableFileStream;
};

export const writeFile = async (writableHandle: FileSystemWritableFileStream, content: string) => {
  console.log("navigator.userActivation before createWritable: ", (window.navigator as any).userActivation)
  await writableHandle.write(content);
  await writableHandle.close();
};

export const executeCode = async (code: string, interpreter: Interpreter, commandLinePubSub : PubSub<CommandLineMessage>) => {
  try {
    let success = false;

    try {
      await interpreter.execute(code);
      success = true;
    } catch (e) {
      commandLinePubSub.publish({
        topic: "commandLine",
        error: true,
        content: `Error during executing: ${e}`
      })
    }
    if (success) {
      console.log("Success")
      commandLinePubSub.publish({
        topic: "commandLine",
        error: false,
        content: `Commands executed successfully`
      })
    }
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error; // Optionally rethrow the error
  }
}

export const executeFile = async (handle: FileSystemFileHandle, interpreter: Interpreter) => {
  try {
    // Get a file object from the handle
    const file = await handle.getFile();

    // Read the content of the file
    const content = await file.text();
    let success = false;

    try {
      await interpreter.execute(content);
      success = true;
    } catch (e) {
      commandLinePubSub.publish({
        topic: "commandLine",
        error: true,
        content: `Error during executing ${handle.name}: ${e}`
      })
    }
    if (success) {
      commandLinePubSub.publish({
        topic: "commandLine",
        error: false,
        content: `${handle.name} executed successfully`
      })
    }
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error; // Optionally rethrow the error
  }
};



// Function to create a new directory
export const createNewDirectory = async (parentHandle: FileSystemDirectoryHandle) => {
  const dirName = window.prompt("Enter the name of the new directory:");
  if (!dirName) {
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
    if ((error as Error).name == "InvalidModificationError") {
      window.alert("You can only delete empty folder");
    } else {
      console.error("Error deleting file or folder:", error);
    }
  }
};

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