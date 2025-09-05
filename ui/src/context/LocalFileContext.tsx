import { createContext, useContext } from 'react';

export type FileRegistry = Record<string, FileSystemHandle>;

const LocalFilesContext = createContext<FileRegistry>({});

export const useLocalFiles = () => {
  const context = useContext(LocalFilesContext);
  if (!context) throw new Error("useLocalFiles must be used within LocalFilesProvider");
  return context;
};

export const LocalFilesProvider = ({ children, dictionary }: { children: React.ReactNode, dictionary: FileRegistry }) => (
  <LocalFilesContext.Provider value={dictionary}>
    {children}
  </LocalFilesContext.Provider>
);
