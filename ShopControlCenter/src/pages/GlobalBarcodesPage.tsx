import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { Search, Package, Image as ImageIcon } from 'lucide-react';

export const GlobalBarcodesPage: React.FC = () => {
  const [barcodes, setBarcodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBarcode, setSelectedBarcode] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBarcode) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 400;
        if (width > height && width > MAX) {
          height *= MAX / width;
          width = MAX;
        } else if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        setDoc(doc(db, 'global_barcodes', selectedBarcode.id), { imageUrl: base64 }, { merge: true })
          .then(() => {
             setSelectedBarcode({ ...selectedBarcode, imageUrl: base64 });
          })
          .catch(err => alert('Failed to update image: ' + err.message));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'global_barcodes'), orderBy('addedAt', 'desc')), snap => {
      setBarcodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEditClick = () => {
    setEditForm({ ...selectedBarcode });
    setIsEditing(true);
  };

  const handleSaveDetails = async () => {
    try {
      await setDoc(doc(db, 'global_barcodes', selectedBarcode.id), {
        name: editForm.name,
        company: editForm.company,
        category: editForm.category,
        packSize: editForm.packSize || '',
        unit: editForm.unit || 'pcs'
      }, { merge: true });
      setSelectedBarcode({ ...selectedBarcode, ...editForm });
      setIsEditing(false);
    } catch (e: any) {
      alert('Failed to update: ' + e.message);
    }
  };

  const handleDeleteBarcode = async () => {
    if (!window.confirm(`Are you sure you want to delete this barcode (${selectedBarcode.barcode})? This action cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, 'global_barcodes', selectedBarcode.id));
      setSelectedBarcode(null);
      setIsEditing(false);
    } catch (e: any) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const filtered = barcodes.filter(b => 
    (b.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (b.barcode || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.company || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (selectedBarcode) {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => { setSelectedBarcode(null); setIsEditing(false); }} style={{ background: 'var(--surface)', padding: '8px 16px', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            &larr; Back to List
          </button>
          <div>
            <h1 className="page-title">Barcode Details</h1>
            <p className="page-subtitle">{selectedBarcode.barcode}</p>
          </div>
          <div style={{ flex: 1 }}></div>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveDetails} style={{ background: '#4BFF94', border: 'none', color: '#0A3D24', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleDeleteBarcode} 
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ef4444', e.currentTarget.style.color = 'white')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)', e.currentTarget.style.color = '#ef4444')}
              >
                Delete Barcode
              </button>
              <button onClick={handleEditClick} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Edit Details
              </button>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div 
              style={{ position: 'relative', width: 160, height: 160, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload image"
            >
              {selectedBarcode.imageUrl ? (
                <img src={selectedBarcode.imageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={48} style={{ color: 'var(--muted)' }} />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                CLICK TO EDIT
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', marginBottom: '16px', fontSize: '24px', padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                />
              ) : (
                <h2 style={{ margin: '0 0 16px 0', fontSize: '28px', color: 'white' }}>{selectedBarcode.name}</h2>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Brand / Company</p>
                  {isEditing ? (
                    <input value={editForm.company || ''} onChange={e => setEditForm({...editForm, company: e.target.value})} style={{ width: '100%', padding: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }} />
                  ) : (
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{selectedBarcode.company || 'Universal'}</p>
                  )}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Category</p>
                  {isEditing ? (
                    <input value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ width: '100%', padding: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }} />
                  ) : (
                    <span className="badge plan">{selectedBarcode.category || 'General'}</span>
                  )}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Pack Size</p>
                  {isEditing ? (
                    <input value={editForm.packSize || ''} onChange={e => setEditForm({...editForm, packSize: e.target.value})} placeholder="e.g. 500g, 1L" style={{ width: '100%', padding: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }} />
                  ) : (
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{selectedBarcode.packSize || '-'}</p>
                  )}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Unit</p>
                  {isEditing ? (
                    <input value={editForm.unit || ''} onChange={e => setEditForm({...editForm, unit: e.target.value})} placeholder="pcs, kg, etc." style={{ width: '100%', padding: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }} />
                  ) : (
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{selectedBarcode.unit || 'pcs'}</p>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
                   <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>System Information</p>
                   <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--muted)' }}>Added By Shop ID: <span style={{ color: 'white', fontFamily: 'monospace' }}>{selectedBarcode.addedByShop}</span></p>
                   <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Added At: <span style={{ color: 'white' }}>{selectedBarcode.addedAt ? new Date(selectedBarcode.addedAt).toLocaleString() : 'Unknown'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Global Barcode Database</h1>
          <p className="page-subtitle">{barcodes.length} products contributed universally by shops.</p>
        </div>
        <button 
          onClick={async () => {
            if (!window.confirm("Are you sure you want to sync all existing barcodes from all shops?")) return;
            setLoading(true);
            try {
              let count = 0;
              const shopsSnap = await getDocs(collection(db, 'shops'));
              for (const shopDoc of shopsSnap.docs) {
                const stockSnap = await getDocs(collection(shopDoc.ref, 'stock'));
                for (const itemDoc of stockSnap.docs) {
                  const item = itemDoc.data();
                  if (item.sku && String(item.sku).length >= 4 && !String(item.sku).startsWith('SKU-')) {
                    await setDoc(doc(db, 'global_barcodes', String(item.sku)), {
                      barcode: String(item.sku),
                      name: item.name,
                      company: item.company || 'Universal',
                      category: item.category || 'General',
                      packSize: item.packSize || '',
                      imageUrl: item.imageUrl || '',
                      unit: item.unit || 'pcs',
                      addedByShop: shopDoc.id,
                      addedAt: new Date().toISOString()
                    }, { merge: true });
                    count++;
                  }
                }
              }
              alert(`Successfully synced ${count} barcodes!`);
            } catch (e: any) {
              alert("Sync failed: " + e.message);
            }
            setLoading(false);
          }}
          style={{ backgroundColor: '#4BFF94', color: '#0A3D24', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(75,255,148,0.2)' }}
        >
          Sync Existing Barcodes
        </button>
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
                <tr key={b.id} onClick={() => setSelectedBarcode(b)} style={{ cursor: 'pointer' }} className="hover-row">
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
