import React from 'react';
import { Github, Bell, CheckCircle2, ChevronUp } from 'lucide-react';
import { useIDE } from '../context/IDEContext';

export const StatusBar: React.FC = () => {
  const { files, activeFileId } = useIDE();
  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="h-6 flex items-center justify-between px-3 bg-primary text-white text-[11px] font-medium border-t border-border/20 shadow-inner">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 hover:bg-white/10 px-2 h-full transition-colors">
          <Github size={12} strokeWidth={3} />
          <span className="font-bold">main*</span>
        </button>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 opacity-80">
             <CheckCircle2 size={11} strokeWidth={3} />
             <span>0 Errors</span>
           </div>
           <div className="flex items-center gap-1 opacity-80">
             <Bell size={11} strokeWidth={3} />
             <span>3 Warnings</span>
           </div>
        </div>
      </div>

      <div className="flex items-center h-full">
        <div className="px-3 border-l border-white/10 hover:bg-white/10 cursor-default h-full flex items-center">
           {activeFile?.language === 'typescript' ? 'TypeScript JSX' : activeFile?.language || 'Plain Text'}
        </div>
        <div className="px-3 border-l border-white/10 hover:bg-white/10 cursor-default h-full flex items-center">
           Spaces: 2
        </div>
        <div className="px-3 border-l border-white/10 hover:bg-white/10 cursor-default h-full flex items-center">
           UTF-8
        </div>
        <button className="px-2 hover:bg-white/10 h-full transition-colors flex items-center">
          <ChevronUp size={14} />
        </button>
      </div>
    </div>
  );
};
