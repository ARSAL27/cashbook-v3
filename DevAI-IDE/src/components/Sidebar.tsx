import React from 'react';
import { Files, Search, Settings, Bug, User, MessageSquareCode, Github } from 'lucide-react';
import { useIDE } from '../context/IDEContext';

export const Sidebar: React.FC = () => {
  const { sidebarTab, toggleSidebarTab } = useIDE();

  const items = [
    { id: 'files', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: Github, label: 'Source Control' },
    { id: 'debug', icon: Bug, label: 'Run and Debug' },
    { id: 'chat', icon: MessageSquareCode, label: 'AI Copilot', active: true },
  ] as const;

  return (
    <div className="w-[50px] flex flex-col items-center justify-between py-4 border-r border-border"
         style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = sidebarTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => toggleSidebarTab(item.id)}
              className="relative group p-2 transition-all duration-200"
              title={item.label}
            >
              <Icon 
                size={24} 
                className={`transition-colors duration-200 ${isActive ? 'text-text-bright' : 'text-text-muted hover:text-text-main'}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-secondary shadow-[0_0_8px_var(--secondary)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <button className="p-2 text-text-muted hover:text-text-main transition-colors">
          <User size={22} />
        </button>
        <button className="p-2 text-text-muted hover:text-text-main transition-colors">
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
};
