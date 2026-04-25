import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, Plus, X } from 'lucide-react';
import { fuzzySearch, highlightMatch, getSearchHistory, saveToHistory } from '../services/searchService';
import { getBrandStyle } from '../data/kiryanaDatabase';

interface SearchableSelectorProps {
  items: any[];
  keys: string[];
  placeholder: string;
  onSelect: (item: any) => void;
  onAddNew?: (name: string) => void;
  category: string;
  label?: string;
  className?: string;
}

export const SearchableSelector: React.FC<SearchableSelectorProps> = ({
  items,
  keys,
  placeholder,
  onSelect,
  onAddNew,
  category,
  label,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const history = useMemo(() => getSearchHistory(category), [category, isOpen]);

  const searchResults = useMemo(() => {
    return fuzzySearch(searchTerm, items, keys, 15);
  }, [searchTerm, items, keys]);

  const handleSelect = (item: any) => {
    saveToHistory(category, item);
    onSelect(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">{label}</p>}
      
      <div className={`relative transition-all duration-300 rounded-[1.8rem] border ${isOpen ? 'border-[#4BFF94] shadow-[0_0_20px_rgba(75,255,148,0.1)]' : 'border-border'} overflow-hidden bg-card`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        <input 
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full py-4 pl-12 pr-10 bg-transparent outline-none font-bold text-[15px]"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute top-full left-0 right-0 z-[100] mt-2 bg-card border border-border shadow-2xl rounded-[2.2rem] overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto no-scrollbar p-2 space-y-1">
              {/* SEARCH RESULTS */}
              {searchTerm.trim().length > 0 ? (
                <>
                  {searchResults.map((item, idx) => {
                    const style = getBrandStyle(item.company || item.name);
                    return (
                      <button 
                        key={idx}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-left group transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border border-border" style={{ background: style.bg, color: style.text }}>
                          {item.logoUrl ? <img src={item.logoUrl} className="w-full h-full object-contain p-1" alt="" /> : style.abbr}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] truncate leading-tight">
                            {highlightMatch(item.name, searchTerm).map((part, i) => (
                              <span key={i} className={part.match ? 'text-[#4BFF94] underline' : 'text-white'}>{part.text}</span>
                            ))}
                          </p>
                          {(item.company || item.category) && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">
                              {item.company} • {item.category}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  
                  {searchResults.length === 0 && onAddNew && (
                    <button 
                      onClick={() => {
                        onAddNew(searchTerm);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#4BFF94]/10 text-[#4BFF94] font-black text-[13px] border border-dashed border-[#4BFF94]/30"
                    >
                      <Plus size={16} />
                      Add "{searchTerm}" as new
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* RECENT HISTORY */}
                  {history.length > 0 && (
                    <div className="py-2">
                       <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2 px-3">Recent Selections</p>
                       {history.map((item, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handleSelect(item)}
                           className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-left group transition-colors opacity-70 hover:opacity-100"
                         >
                           <History size={16} className="text-gray-500 group-hover:text-primary shrink-0" />
                           <div className="flex-1 min-w-0">
                             <p className="font-bold text-[13px] truncate text-white">{item.name}</p>
                           </div>
                         </button>
                       ))}
                    </div>
                  )}
                  {history.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                       <Plus size={24} className="mx-auto mb-2 opacity-20" />
                       <p className="text-[12px] font-bold">Type to search brands or products</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
