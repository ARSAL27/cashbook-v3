import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Store, TrendingUp, Users, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ShopSummary {
  id: string; name: string; owner: string; city: string; currency: string; plan: string; email: string;
}

import { PlanBadge } from '../components/Badges';

export const Dashboard: React.FC<{ onShopSelect?: (id: string) => void }> = ({ onShopSelect }) => {
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let shopsData: Record<string, any> = {};
    let usersData: Record<string, any> = {};

    const syncDashboard = () => {
      const allIds = Array.from(new Set([...Object.keys(usersData), ...Object.keys(shopsData)]));
      const combined = allIds.map(id => {
        const u = usersData[id] || {};
        const s = shopsData[id] || {};
        return {
          id,
          name: s.name || u.name || id.substring(0, 8),
          owner: s.owner || u.name || '-',
          city: s.city || u.city || '-',
          currency: s.currency || u.currency || 'PKR',
          plan: s.plan || u.plan || 'free',
          email: u.email || s.email || '-' // Priority to user email auth
        };
      });
      setShops(combined);
      setLoading(false);
    };

    const unsubShops = onSnapshot(collection(db, 'shops'), (snap) => {
      snap.docs.forEach(d => shopsData[d.id] = d.data());
      syncDashboard();
    }, (err) => {
      console.error("Dashboard Shops Error:", err);
      setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      snap.docs.forEach(d => usersData[d.id] = d.data());
      syncDashboard();
    }, (err) => console.error("Dashboard Users Error:", err));

    // Listen for crash reports (new errors)
    const unsubErrors = onSnapshot(collection(db, 'system_errors'), (snap) => {
      const errList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by timestamp desc
      errList.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      // Deduplicate: keep only the LATEST error per shop (userId)
      const seen = new Set<string>();
      const deduped = errList.filter((e: any) => {
        const key = e.userId || 'anonymous';
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setErrors(deduped.slice(0, 10));
    });

    return () => { unsubShops(); unsubUsers(); unsubErrors(); };
  }, []);

  const PLAN_PRICES: Record<string, number> = { free: 0, pro: 1000, business: 3000 };
  const ourSales = shops.filter(s => s.plan !== 'free').length;
  const ourRevenue = shops.reduce((sum, s) => sum + (PLAN_PRICES[s.plan] || 0), 0);
  const freeShops = shops.filter(s => s.plan === 'free').length;
  const lastUpdated = new Date().toLocaleTimeString();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  console.log("Dashboard Rendering - Shops Count:", shops.length, "Data Sample:", shops[0]);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Live overview of all registered shops</p>
          </div>
          <div className="text-muted" style={{ fontSize: 10, textAlign: 'right' }}>
            Live Syncing...<br />
            Last Updated: {lastUpdated}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}><Store size={18} style={{ color: '#a855f7' }} /></div>
          <div className="stat-value" style={{ color: '#a855f7' }}>{shops.length}</div>
          <div className="stat-label">Total Shops</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><TrendingUp size={18} style={{ color: '#10b981' }} /></div>
          <div className="stat-value" style={{ color: '#10b981' }}>{ourSales}</div>
          <div className="stat-label">Platform Sales</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}><DollarSign size={18} style={{ color: '#3b82f6' }} /></div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>Rs {ourRevenue.toLocaleString()}</div>
          <div className="stat-label">Platform Revenue (MRR)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}><Users size={18} style={{ color: '#f59e0b' }} /></div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{freeShops}</div>
          <div className="stat-label">Free Shops</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '20px' }}>

        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#a855f7" /> Subscription Breakdown
            </span>
          </div>
          <div style={{ padding: '20px' }}>
             <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', backgroundColor: 'var(--surface2)' }}>
                <div title="Business" style={{ width: `${(shops.filter(s => s.plan === 'business').length / shops.length) * 100 || 0}%`, background: '#f59e0b' }} />
                <div title="Pro" style={{ width: `${(shops.filter(s => s.plan === 'pro').length / shops.length) * 100 || 0}%`, background: '#8b5cf6' }} />
                <div title="Free" style={{ width: `${(freeShops / shops.length) * 100 || 0}%`, background: '#10b981' }} />
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                   <div style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 'bold' }}>BUSINESS</div>
                   <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{shops.filter(s => s.plan === 'business').length}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
                   <div style={{ color: '#8b5cf6', fontSize: '10px', fontWeight: 'bold' }}>PRO</div>
                   <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{shops.filter(s => s.plan === 'pro').length}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                   <div style={{ color: '#10b981', fontSize: '10px', fontWeight: 'bold' }}>FREE</div>
                   <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{freeShops}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <span className="card-title">Shop Performance</span>
        </div>
        {shops.length === 0 ? (
          <div className="empty-state">No shops registered yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Shop</th><th>Plan</th><th>Owner</th><th>City</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {shops.map(s => (
                <tr key={s.id}>
                  <td><strong>🏪 {s.name || s.id || 'Unnamed'}</strong></td>
                  <td><PlanBadge plan={s.plan} /></td>
                  <td className="text-muted">{s.owner || '(No Owner)'}</td>
                  <td className="text-muted">{s.city}</td>
                  <td style={{ color: '#a855f7', fontWeight: 600, fontSize: '13px' }}>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
