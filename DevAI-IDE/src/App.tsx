import React from 'react';
import { useIDE, IDEProvider } from './context/IDEContext';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { EditorContainer } from './components/EditorContainer';
import { AIChatPanel } from './components/AIChatPanel';
import { StatusBar } from './components/StatusBar';
import { Toaster } from 'react-hot-toast';

const IDEContent: React.FC = () => {
  const { sidebarTab } = useIDE();

  return (
    <div className="flex flex-col h-screen select-none font-sans overflow-hidden" 
         style={{ backgroundColor: 'var(--bg-darker)' }}>
      
      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ACTION BAR (Icon Column) */}
        <Sidebar />

        {/* SIDEBAR PANEL (Explorer/Search/Chat) */}
        <div className="flex flex-col border-r border-border transition-all duration-300"
             style={{ width: sidebarTab === 'chat' ? '0px' : '260px', opacity: sidebarTab === 'chat' ? 0 : 1, overflow: 'hidden' }}>
          {sidebarTab === 'files' && <FileExplorer />}
          {sidebarTab === 'search' && <div className="p-4"><p className="text-text-muted text-xs font-bold uppercase">Search</p></div>}
          {/* Add more as needed */}
        </div>

        {/* MAIN EDITOR AREA */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <EditorContainer />
        </div>

        {/* AI COPILOT CHAT PANEL (Expandable) */}
        <div className="flex flex-col border-l border-border bg-sidebar transition-all duration-500"
             style={{ width: sidebarTab === 'chat' ? '450px' : '0px', opacity: sidebarTab === 'chat' ? 1 : 0, overflow: 'hidden' }}>
           <AIChatPanel />
        </div>
      </div>

      {/* STATUS BAR */}
      <StatusBar />
      
      <Toaster position="bottom-right" toastOptions={{ 
        style: { background: '#252526', color: '#fff', border: '1px solid #444', fontSize: '12px' } 
      }} />
    </div>
  );
};

function App() {
  return (
    <IDEProvider>
      <IDEContent />
    </IDEProvider>
  );
}

export default App;
