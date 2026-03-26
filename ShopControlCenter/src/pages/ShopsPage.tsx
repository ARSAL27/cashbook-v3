import React, { useState, useEffect } from 'react';
import { PlanBadge } from '../components/Badges';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Search, Package, ShoppingCart, Wallet, Users, Trash2, Star, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Shop { id: string; name: string; owner: string; city: string; phone: string; currency: string; plan?: string; email?: string; securityPin?: string; signupPassword?: string; logoUrl?: string; }

const ShopDetail: React.FC<{ shopId: string; onBack: () => void }> = ({ shopId, onBack }) => {
  const [tab, setTab] = useState('sales');
  const [sales, setSales] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [udhaars, setUdhaars] = useState<any[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const shopRef = doc(db, 'shops', shopId);
    const unsub = onSnapshot(shopRef, snap => { if (snap.exists()) setShop({ id: snap.id, ...snap.data() } as Shop); });
    const loadSub = async () => {
      const [s, st, e, u] = await Promise.all([
        getDocs(collection(db, 'shops', shopId, 'sales')),
        getDocs(collection(db, 'shops', shopId, 'stock')),
        getDocs(collection(db, 'shops', shopId, 'expenses')),
        getDocs(collection(db, 'shops', shopId, 'udhaar')),
      ]);
      setSales(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setStock(st.docs.map(d => ({ id: d.id, ...d.data() })));
      setExpenses(e.docs.map(d => ({ id: d.id, ...d.data() })));
      setUdhaars(u.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadSub();
    return () => unsub();
  }, [shopId]);

  const updatePlan = async (newPlan: string) => {
    const tid = toast.loading(`Changing plan to ${newPlan}...`);
    try {
      await updateDoc(doc(db, 'shops', shopId), { plan: newPlan });
      toast.success(`Plan changed to ${newPlan}!`, { id: tid });
    } catch (err: any) {
      console.error(err);
      toast.error('Plan change failed: ' + (err.code === 'permission-denied' ? 'Permission denied. Check Firestore rules.' : err.message), { id: tid });
    }
  };

  const deleteShop = async () => {
    if (!window.confirm('⚠️ WARNING: Delete this shop and ALL its data? This cannot be undone.')) return;
    setIsDeleting(true);
    const tid = toast.loading('Deleting shop completely...');
    try {
      // For a real production app, you'd use a Cloud Function to delete sub-collections properly.
      // But we must at least delete the core identities to prevent them reappearing
      await deleteDoc(doc(db, 'shops', shopId));
      await deleteDoc(doc(db, 'users', shopId)); // Delete auth shadow profile
      
      toast.success('Shop completely deleted from the system.', { id: tid });
      onBack();
    } catch (err: any) {
      console.error(err);
      toast.error('Delete failed: ' + (err.code === 'permission-denied' ? 'Permission denied. Check Firestore rules.' : err.message), { id: tid });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetPin = async () => {
    if (!window.confirm('Reset this shop\'s security PIN? The owner will be able to log in without PIN.')) return;
    const tid = toast.loading('Resetting PIN...');
    try {
      await updateDoc(doc(db, 'shops', shopId), { 
        securityPin: null, 
        pinEnabled: false,
        failedAttempts: 0,
        lockedUntil: null
      });
      await updateDoc(doc(db, 'users', shopId), {
        securityPin: null,
        pinEnabled: false,
        failedAttempts: 0,
        lockedUntil: null
      });
      toast.success('Security PIN has been reset! Owner can now log in freely.', { id: tid });
    } catch (err: any) {
      console.error(err);
      toast.error('Reset failed: ' + (err.code === 'permission-denied' ? 'Permission denied. Check Firestore rules.' : err.message), { id: tid });
    }
  };

  const totalRev = sales.reduce((s, x) => s + (x.total || 0), 0);
  const totalExp = expenses.reduce((s, x) => s + (x.amount || 0), 0);
  const cur = shop?.currency || 'PKR';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button className="back-btn" onClick={onBack} style={{ margin: 0 }}><ArrowLeft size={14} /> All Shops</button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={resetPin}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(245,158,11,0.2)',
                backgroundColor: 'rgba(245,158,11,0.1)',
                color: 'var(--yellow)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={14} /> Reset PIN
            </button>
            <div style={{ 
              display: 'flex', 
              background: 'var(--surface2)', 
              padding: '4px', 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              gap: '4px'
            }}>
              {[
                { id: 'free', label: 'Free', color: 'var(--green)' }, 
                { id: 'pro', label: 'Pro', color: 'var(--accent-light)' }, 
                { id: 'business', label: 'Business', color: 'var(--yellow)' }
              ].map((p) => {
                const isActive = (shop?.plan || 'free') === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => updatePlan(p.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                      color: isActive ? p.color : 'var(--muted)',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.color, opacity: isActive ? 1 : 0.4 }} />
                    {p.label}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={deleteShop} 
              disabled={isDeleting} 
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.2)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: 'var(--red)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
      </div>

      {shop && (
        <div className="shop-hero">
          <div className="shop-avatar" style={{ overflow: 'hidden', padding: shop.logoUrl ? 0 : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '🏪'}
          </div>
          <div>
            <div className="shop-name">
               {shop.name} 
               {shop.plan === 'business' && <Shield size={16} className="inline ml-2 text-yellow-500 fill-yellow-500/20" />}
               <span className="badge plan" style={{ verticalAlign: 'middle', marginLeft: 8 }}>{shop.plan || 'Free'}</span>
            </div>
            <div className="shop-meta">
              <span>👤 {shop.owner}</span>
              <span>📍 {shop.city || 'N/A'}</span>
              <span>📞 {shop.phone}</span>
              <span>💰 {shop.currency}</span>
              <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>📧 {shop.email || 'N/A'}</span>
              <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>🔑 PIN: {shop.securityPin || 'None'}</span>
              <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>🔒 PASS: {shop.signupPassword || 'No Password Recorded'}</span>
            </div>
          </div>
          <div className="sub-stats">
            <div className="sub-stat">
              <div className="sub-stat-value">{sales.length}</div>
              <div className="sub-stat-label">Sales</div>
            </div>
            <div className="sub-stat">
              <div className="sub-stat-value">{stock.length}</div>
              <div className="sub-stat-label">Items</div>
            </div>
            <div className="sub-stat">
              <div className="sub-stat-value">{udhaars.length}</div>
              <div className="sub-stat-label">Udhaars</div>
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        {[['sales', 'Sales', ShoppingCart], ['stock', 'Stock', Package], ['expenses', 'Expenses', Wallet], ['udhaar', 'Udhaar', Users]].map(([id, label, Icon]: any) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={13} style={{ display: 'inline', marginRight: 5 }} />{label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'sales' && (
          <>
            <div className="card-header"><span className="card-title">Sales ({sales.length})</span><span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Total: {cur} {totalRev.toLocaleString()}</span></div>
            {sales.length === 0 ? <div className="empty-state">No sales yet</div> : (
              <table><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Items</th></tr></thead>
                <tbody>{sales.map(s => (
                  <tr key={s.id}>
                    <td className="text-muted">{new Date(s.date).toLocaleDateString()}</td>
                    <td><span className={`badge ${s.type === 'cash' ? 'active' : 'plan'}`}>{s.type}</span></td>
                    <td className="currency-amount">{cur} {(s.total || 0).toLocaleString()}</td>
                    <td className="text-muted">{s.items?.length || 0} items</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </>
        )}
        {tab === 'stock' && (
          <>
            <div className="card-header"><span className="card-title">Stock ({stock.length} items)</span></div>
            {stock.length === 0 ? <div className="empty-state">No stock items</div> : (
              <table><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Qty</th><th>Sold</th></tr></thead>
                <tbody>{stock.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td className="text-muted">{s.category || '-'}</td>
                    <td className="currency-amount">{cur} {(s.price || 0).toLocaleString()}</td>
                    <td><span className={s.quantity < 5 ? 'text-red' : 'text-green'}>{s.quantity}</span></td>
                    <td className="text-muted">{s.soldCount || 0}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </>
        )}
        {tab === 'expenses' && (
          <>
            <div className="card-header"><span className="card-title">Expenses ({expenses.length})</span><span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Total: {cur} {totalExp.toLocaleString()}</span></div>
            {expenses.length === 0 ? <div className="empty-state">No expenses</div> : (
              <table><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
                <tbody>{expenses.map(e => (
                  <tr key={e.id}>
                    <td className="text-muted">{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.description}</td>
                    <td className="currency-amount text-red">{cur} {(e.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </>
        )}
        {tab === 'udhaar' && (
          <>
            <div className="card-header"><span className="card-title">Udhaar ({udhaars.length})</span></div>
            {udhaars.length === 0 ? <div className="empty-state">No udhaar records</div> : (
              <table><thead><tr><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{udhaars.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.customerName}</strong></td>
                    <td className="text-muted">{new Date(u.date).toLocaleDateString()}</td>
                    <td className="currency-amount text-yellow">{cur} {(u.amount || 0).toLocaleString()}</td>
                    <td><span className={`badge ${u.settled ? 'active' : 'inactive'}`}>{u.settled ? 'Settled' : 'Pending'}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ShopsPage: React.FC<{ onShopSelect: (id: string) => void }> = ({ onShopSelect }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // We listen to both 'users' (for identity) and 'shops' (for business data)
    // and merge them to ensure every registered person shows up.
    let shopsData: Record<string, any> = {};
    let usersData: Record<string, any> = {};

    const syncLists = () => {
      const allIds = Array.from(new Set([...Object.keys(usersData), ...Object.keys(shopsData)]));
      const combined = allIds.map(id => {
        const u = usersData[id] || {};
        const s = shopsData[id] || {};
        return {
          id,
          name: s.name || u.name || id.substring(0, 8),
          owner: s.owner || u.name || 'Owner Name',
          email: u.email || s.email || '-',
          city: s.city || u.city || '-',
          phone: s.phone || u.phone || '-',
          plan: s.plan || u.plan || 'free',
          currency: s.currency || u.currency || 'PKR',
          securityPin: s.securityPin || u.securityPin,
          signupPassword: s.signupPassword || u.signupPassword,
          logoUrl: s.logoUrl || u.logoUrl || null
        } as Shop;
      });
      setShops(combined.sort((a,b) => b.name.localeCompare(a.name)));
      setLoading(false);
    };

    const unsubShops = onSnapshot(collection(db, 'shops'), snap => {
      snap.docs.forEach(d => shopsData[d.id] = d.data());
      syncLists();
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      snap.docs.forEach(d => usersData[d.id] = d.data());
      syncLists();
    });

    return () => {
      unsubShops();
      unsubUsers();
    };
  }, []);

  const filtered = shops.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.owner || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Shops</h1>
        <p className="page-subtitle">{shops.length} shops registered in the system</p>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Shop Directory</span>
          <div className="search-bar">
            <Search size={14} />
            <input placeholder="Search shops…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">{search ? 'No results found' : 'No shops registered yet'}</div>
        ) : (
          <table>
            <thead><tr><th>Shop Name</th><th>Owner</th><th>Email</th><th>Signup Password</th><th>Plan Status</th><th>City</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(s => (
              <tr key={s.id} onClick={() => onShopSelect(s.id)}>
                <td>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏪 {s.name || s.id || 'Unnamed'}
                    {s.plan === 'business' && <Shield size={14} style={{ color: '#f59e0b' }} />}
                    {s.plan === 'pro' && <Star size={14} style={{ color: '#8b5cf6' }} />}
                  </span>
                </td>
                <td className="text-muted">{s.owner || '(No Owner)'}</td>
                <td className="text-muted" style={{ fontSize: '12px' }}>{s.email || '-'}</td>
                <td className="text-muted" style={{ fontSize: '12px', fontWeight: 600, color: '#0ea5e9' }}>{s.signupPassword || '-'}</td>
                <td><PlanBadge plan={s.plan || 'free'} /></td>
                <td className="text-muted">{s.city || '-'}</td>
                <td><span style={{ fontSize: 12, color: '#a855f7', fontWeight: 700, letterSpacing: '0.5px' }}>MANAGE →</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export { ShopDetail };
