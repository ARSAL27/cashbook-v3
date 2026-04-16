import React, { createContext, useContext, useState } from 'react';

export interface FileNode {
  id: string;
  name: string;
  language: string;
  content: string;
  isOpen?: boolean;
  isFolder?: boolean;
  children?: FileNode[];
}

interface IDEContextType {
  files: FileNode[];
  activeFileId: string | null;
  openFileIds: string[];
  sidebarTab: 'files' | 'search' | 'git' | 'debug' | 'extensions' | 'chat';
  
  setActiveFile: (id: string) => void;
  toggleSidebarTab: (tab: IDEContextType['sidebarTab']) => void;
  closeFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
}

const IDEContext = createContext<IDEContextType | undefined>(undefined);

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'App.tsx',
      language: 'typescript',
      content: '// Welcome to Antigravity AI IDE\n\nfunction Main() {\n  return (\n    <div className="p-10">\n      <h1 className="text-4xl font-bold">Hello World</h1>\n    </div>\n  );\n}',
      isOpen: true
    },
    {
      id: '2',
      name: 'styles.css',
      language: 'css',
      content: 'body {\n  background: #111;\n  color: white;\n}',
      isOpen: false
    },
    {
       id: '3',
       name: 'utils.ts',
       language: 'typescript',
       content: 'export const formatDate = (date: Date) => {\n  return date.toLocaleDateString();\n};',
       isOpen: false
    }
  ]);

  const [activeFileId, setActiveFileId] = useState<string | null>('1');
  const [openFileIds, setOpenFileIds] = useState<string[]>(['1']);
  const [sidebarTab, setSidebarTab] = useState<IDEContextType['sidebarTab']>('files');

  const setActiveFile = (id: string) => {
    setActiveFileId(id);
    if (!openFileIds.includes(id)) {
      setOpenFileIds(prev => [...prev, id]);
    }
  };

  const closeFile = (id: string) => {
    const newOpenIds = openFileIds.filter(fid => fid !== id);
    setOpenFileIds(newOpenIds);
    if (activeFileId === id) {
      setActiveFileId(newOpenIds[newOpenIds.length - 1] || null);
    }
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content } : f));
  };

  const toggleSidebarTab = (tab: IDEContextType['sidebarTab']) => {
    setSidebarTab(prev => prev === tab ? (sidebarTab === 'chat' ? 'files' : prev) : tab);
  };

  return (
    <IDEContext.Provider value={{ 
      files, activeFileId, openFileIds, sidebarTab, 
      setActiveFile, toggleSidebarTab, closeFile, updateFileContent 
    }}>
      {children}
    </IDEContext.Provider>
  );
};

export const useIDE = () => {
  const context = useContext(IDEContext);
  if (!context) throw new Error('useIDE must be used within an IDEProvider');
  return context;
};
