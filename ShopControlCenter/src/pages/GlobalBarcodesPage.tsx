import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Search, Package, Image as ImageIcon } from 'lucide-react';

export const GlobalBarcodesPage: React.FC = () => {
  const [barcodes, setBarcodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'global_barcodes'), orderBy('addedAt', 'desc')), snap => {
      setBarcodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = barcodes.filter(b => 
    (b.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (b.barcode || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.company || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Global Barcode Database</h1>
        <p className="page-subtitle">{barcodes.length} products contributed universally by shops.</p>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Universal Products Catalog</span>
          <div className="search-bar">
            <Search size={14} />
            <input placeholder="Search by name, company or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">No barcodes found matching your search.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Barcode (SKU)</th>
                <th>Product Name</th>
                <th>Brand / Company</th>
                <th>Category</th>
                <th>Size / Unit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.imageUrl ? (
                       <img src={b.imageUrl} alt="Prod" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ImageIcon size={14} style={{ color: 'var(--muted)' }} />
                       </div>
                    )}
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-light)', backgroundColor: 'var(--surface2)', padding: '2px 6px', borderRadius: 6 }}>{b.barcode}</span></td>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td className="text-muted">{b.company || 'Universal'}</td>
                  <td><span className="badge plan">{b.category || 'General'}</span></td>
                  <td className="text-muted">{b.packSize ? `${b.packSize} ` : ''}{b.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
