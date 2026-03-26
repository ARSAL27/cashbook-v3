import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Bell, Send, Users, CheckCircle2, Search, Info, History } from 'lucide-react';
import toast from 'react-hot-toast';

interface Shop {
  id: string;
  name: string;
  owner: string;
  plan?: string;
  city?: string;
}

interface BroadcastLog {
  id: string;
  title: string;
  message: string;
  type: string;
  targetCount: number;
  timestamp: any;
}

export const NotificationsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [history, setHistory] = useState<BroadcastLog[]>([]);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'system' | 'update' | 'important' | 'alert'>('system');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const snap = await getDocs(collection(db, 'shops'));
        setShops(snap.docs.map(d => ({ id: d.id, ...d.data() } as Shop)));
      } catch (err) {
        console.error("Fetch shops failed", err);
      }
    };
    fetchShops();

    const unsubHistory = onSnapshot(query(collection(db, 'broadcast_history'), orderBy('timestamp', 'desc')), snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as BroadcastLog)));
    });

    return () => unsubHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }

    const targets = targetType === 'all' ? shops.map(s => s.id) : selectedShops;
    if (targets.length === 0) {
      toast.error('Please select at least one shop');
      return;
    }

    if (!window.confirm(`Send this notification to ${targets.length} shops?`)) return;

    setSending(true);
    const date = new Date().toISOString();
    let sentCount = 0;
    let failCount = 0;

    try {
      // Loop through all target shops and post the notification
      // Note: For a large number of shops (>100), a Cloud Function or batch process is better.
      // But for a reasonable number, this client-side loop works fine.
      const promises = targets.map(async (shopId) => {
        try {
          await addDoc(collection(db, 'shops', shopId, 'notifications'), {
            title,
            message,
            type: type === 'important' ? 'system' : (type === 'alert' ? 'stock' : 'system'), // Mapping back to compatible types in KiryanaBook
            date,
            read: false,
            adminBroadcast: true, // Special flag to identify admin notifications
            createdAt: serverTimestamp()
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send to ${shopId}`, err);
          failCount++;
        }
      });

      await Promise.all(promises);

      // Log the broadcast to history
      await addDoc(collection(db, 'broadcast_history'), {
         title,
         message,
         type,
         targetCount: sentCount,
         timestamp: serverTimestamp()
      });

      if (failCount === 0) {
        toast.success(`Successfully sent to all ${sentCount} shops!`);
        setTitle('');
        setMessage('');
        setSelectedShops([]);
      } else {
        toast.success(`Sent to ${sentCount} shops. ${failCount} failed.`);
      }
    } catch (err) {
      console.error("Broadcast failed", err);
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const toggleShop = (id: string) => {
    setSelectedShops(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredShops = shops.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.owner || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="page-header">
        <h1 className="page-title">Send Notifications</h1>
        <p className="page-subtitle">Send alerts or announcements to registered shop apps</p>
      </div>

      <div className="grid">
        <form onSubmit={handleSend} className="card p-8 flex flex-col gap-8 shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(15,15,20,0.9))', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
               <Bell size={24} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Broadcast Hub</h3>
              <p className="text-[12px] text-muted-foreground opacity-60">Push notifications to all devices</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="input-group">
              <label className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-3 block">NOTIFICATION TITLE</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New Update Available!"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.08)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-purple-500/40 transition-all font-medium placeholder:opacity-30"
              />
            </div>

            <div className="input-group">
              <label className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-3 block">MESSAGE CONTENT</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your announcement here..."
                rows={5}
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.08)' }}
                className="w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none font-medium placeholder:opacity-30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="text-[12px] font-bold text-muted mb-2 block">ALERT TYPE</label>
                <div className="flex gap-2">
                   {['system', 'important', 'alert'].map((t) => (
                     <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as any)}
                        style={{
                          backgroundColor: type === t ? 'var(--accent)' : 'var(--surface2)',
                          color: type === t ? '#fff' : 'var(--muted)',
                          borderColor: type === t ? 'transparent' : 'var(--border)'
                        }}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase transition-all flex-1 border`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
              </div>
              <div className="input-group">
                <label className="text-[12px] font-bold text-muted mb-2 block">TARGET AUDIENCE</label>
                <div className="flex gap-2">
                   {[
                     { id: 'all', label: 'All Shops', icon: Users },
                     { id: 'specific', label: 'Selection', icon: Search }
                   ].map((t) => (
                     <button
                        key={t.id}
                        type="button"
                        onClick={() => setTargetType(t.id as any)}
                        style={{
                          backgroundColor: targetType === t.id ? '#3b82f6' : 'var(--surface2)',
                          color: targetType === t.id ? '#fff' : 'var(--muted)',
                          borderColor: targetType === t.id ? 'transparent' : 'var(--border)'
                        }}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2 flex-1 border`}
                     >
                       <t.icon size={12} />
                       {t.label}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="p-4 rounded-xl border border-dashed border-border bg-surface2 flex items-start gap-3"
          >
            <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted italic leading-relaxed">
              Real Work: This will post directly to the notifications feed of the target shop apps. 
              Recipients will see this the next time they open the KiryanaBook app.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
               background: sending ? '#333' : 'linear-gradient(90deg, #7C3AED 0%, #4F46E5 100%)',
               boxShadow: sending ? 'none' : '0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 8px 10px -6px rgba(124, 58, 237, 0.5)',
               border: 'none',
               color: 'white'
            }}
            className="mt-6 w-full p-5 rounded-2xl font-black uppercase tracking-[3px] text-[14px] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {sending ? <div className="spinner-small" /> : <Send size={20} />}
            {sending ? 'Processing Dispatch...' : 'Launch Broadcast'}
          </button>
        </form>

        {targetType === 'specific' && (
          <div className="card p-8 flex flex-col gap-6 mt-8 shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(30,30,45,0.6)', backdropFilter: 'blur(10px)', borderRadius: '24px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold text-[16px]">Targeted Selection ({selectedShops.length})</span>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '0 16px', width: '220px', height: '42px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search size={16} style={{ color: 'rgba(255,255,255,0.4)', marginRight: '10px' }} />
                <input 
                   placeholder="Search shops..." 
                   value={search} 
                   onChange={e => setSearch(e.target.value)} 
                   style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
              {filteredShops.length === 0 ? (
                <div className="text-center py-12 text-white/20 italic">No matches found in your database</div>
              ) : (
                filteredShops.map(s => (
                  <div
                    key={s.id}
                    onClick={() => toggleShop(s.id)}
                    style={{ 
                      backgroundColor: selectedShops.includes(s.id) ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)', 
                      borderColor: selectedShops.includes(s.id) ? 'rgba(124, 58, 237, 0.5)' : 'rgba(255,255,255,0.05)' 
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between hover:bg-white/5 active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-purple-400 capitalize">
                          {s.name?.charAt(0) || '?'}
                       </div>
                       <div>
                         <div className="font-bold text-[14px] text-white">{s.name || 'Unnamed Shop'}</div>
                         <div className="text-[11px] text-white/40 tracking-wide uppercase font-medium">{s.owner || 'No Owner'} • {s.city || 'Location Unknown'}</div>
                       </div>
                    </div>
                    {selectedShops.includes(s.id) ? (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <CheckCircle2 size={14} color="white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white/10" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card mt-16 overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(20,20,30,0.4)', backdropFilter: 'blur(5px)', borderRadius: '24px' }}>
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <History size={20} className="text-blue-400" />
            <span className="text-white font-bold text-[17px]">Transmission History</span>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase text-blue-400 tracking-widest">
            {history.length} Logs Found
          </span>
        </div>
        {history.length === 0 ? (
           <div className="p-16 text-center text-white/20 italic font-medium">No previous broadcasts archived.</div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-[13px]">
                <thead>
                   <tr className="border-b border-white/5 text-white/40 uppercase text-[10px] tracking-[2px] font-black">
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Notification Details</th>
                      <th className="px-8 py-5 text-center">Coverage</th>
                   </tr>
                </thead>
                <tbody>
                   {history.map(h => (
                      <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                         <td className="px-8 py-5 text-white/50 font-medium whitespace-nowrap">
                            {h.timestamp ? new Date(h.timestamp.toDate()).toLocaleString() : 'Processing...'}
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-2 mb-1.5">
                               <span className={`w-2 h-2 rounded-full ${h.type === 'alert' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`} />
                               <div className="font-bold text-white text-[15px] group-hover:text-purple-400 transition-colors uppercase tracking-tight">{h.title}</div>
                            </div>
                            <div className="text-[12px] text-white/40 font-medium line-clamp-2 max-w-[450px] leading-relaxed italic">{h.message}</div>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <div className="inline-flex flex-col items-center">
                               <span className="text-purple-400 font-black text-lg leading-tight">{h.targetCount}</span>
                               <span className="text-[9px] uppercase font-black text-white/20 tracking-tighter">Endpoints</span>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
};
