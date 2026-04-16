import React from 'react';
import { ChevronDown, FileCode, FileText, Hash, Type } from 'lucide-react';
import { useIDE } from '../context/IDEContext';

export const FileExplorer: React.FC = () => {
  const { files, activeFileId, setActiveFile } = useIDE();

  const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={14} className="text-blue-400" />;
    if (name.endsWith('.css')) return <Hash size={14} className="text-pink-400" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-sidebar">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Explorer</p>
      </div>

      <div className="mt-2">
        <div className="flex items-center gap-1 px-2 py-1 text-text-muted hover:bg-bg-active cursor-pointer">
          <ChevronDown size={14} />
          <span className="text-[11px] font-black uppercase tracking-widest leading-none">VIBE-TO-PRO</span>
        </div>

        <div className="mt-1">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`flex items-center gap-2 px-6 py-1.5 cursor-pointer transition-all ${
                activeFileId === file.id ? 'bg-bg-active text-text-bright' : 'hover:bg-bg-active/50 text-text-muted'
              }`}
            >
              {getFileIcon(file.name)}
              <span className="text-[13px] font-medium truncate">{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
