interface Window {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
}

interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
}

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}