import React from 'react';
import Editor from '@monaco-editor/react';
import { useIDE } from '../context/IDEContext';
import { X, Play, Code2, Zap } from 'lucide-react';

export const EditorContainer: React.FC = () => {
  const { files, activeFileId, openFileIds, setActiveFile, closeFile, updateFileContent } = useIDE();
  
  const activeFile = files.find(f => f.id === activeFileId);
  const openFiles = files.filter(f => openFileIds.includes(f.id));

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-dark overflow-hidden">
      
      {/* TAB BAR */}
      <div className="h-9 flex items-center bg-bg-darker overflow-x-auto no-scrollbar border-b border-border shadow-md">
        {openFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`group h-full flex items-center gap-2 px-3 border-r border-border cursor-pointer transition-all min-w-[120px] max-w-[200px] ${
              activeFileId === file.id ? 'bg-bg-dark border-t-2 border-t-secondary' : 'hover:bg-bg-light/30 opacity-70'
            }`}
          >
            <span className={`text-[12px] truncate ${activeFileId === file.id ? 'text-text-bright' : 'text-text-muted'}`}>
              {file.name}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
              className={`p-0.5 rounded-md transition-all ${
                activeFileId === file.id ? 'text-text-muted hover:bg-bg-active hover:text-text-bright' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* EDITOR HEADER */}
      {activeFile && (
        <div className="h-10 px-4 flex items-center justify-between border-b border-border bg-bg-dark/50">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[11px] font-black tracking-widest text-text-muted opacity-50 uppercase">
                <Code2 size={14} /> {activeFile.language}
             </div>
             <div className="h-4 w-[1px] bg-border" />
             <div className="flex items-center gap-2 text-[11px] font-black tracking-widest text-secondary uppercase">
                <Zap size={14} className="fill-secondary" /> AI Active
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1 bg-secondary text-bg-darker rounded-md font-bold text-[11px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all">
              <Play size={14} fill="currentColor" /> Run
            </button>
          </div>
        </div>
      )}

      {/* MONACO EDITOR */}
      <div className="flex-1 w-full overflow-hidden">
        {activeFile ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language={activeFile.language}
            value={activeFile.content}
            onChange={(val) => updateFileContent(activeFile.id, val || '')}
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineNumbersMinChars: 3,
              renderLineHighlight: 'all',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-4 opacity-20">
            <Code2 size={100} strokeWidth={0.5} />
            <p className="text-sm font-bold uppercase tracking-widest">Open a file to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};
