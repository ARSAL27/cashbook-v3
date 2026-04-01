import React from 'react';
import { LayoutDashboard, Store, LogOut, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  page: string;
  setPage: (p: string) => void;
}

export const Sidebar: React.FC<Props> = ({ page, setPage }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏪</div>
        <div>
          <div className="logo-text">Control Center</div>
          <div className="logo-sub">Admin Panel</div>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Overview</div>
        <a className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
          <LayoutDashboard size={16} /> Dashboard
        </a>
        <a className={`nav-item ${page === 'shops' ? 'active' : ''}`} onClick={() => setPage('shops')}>
          <Store size={16} /> All Shops
        </a>
        <a className={`nav-item ${page === 'notifications' ? 'active' : ''}`} onClick={() => setPage('notifications')}>
          <Bell size={16} /> Broadcasts
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-label">Host Configuration</div>
        <div style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--muted2)', borderLeft: '2px solid var(--accent-glow)', marginLeft: '12px' }}>
           <div>Local Host: <span style={{ color: 'var(--text)', fontWeight: 600 }}>127.0.0.1:5173</span></div>
           <div style={{ marginTop: '2px' }}>Live URL: <span style={{ color: 'var(--accent-light)' }}>kiryanabook-control.web.app</span></div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="nav-section">
          <a className="nav-item" onClick={logout} style={{ color: '#ef4444' }}>
            <LogOut size={16} /> Sign Out
          </a>
        </div>
        <div className="admin-badge">
          <div className="admin-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
              : '👤'}
          </div>
          <div className="admin-info">
            <div className="admin-name">{user?.displayName?.split(' ')[0] || 'Admin'}</div>
            <div className="admin-role"><ShieldCheck size={10} style={{ display: 'inline' }} /> Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};
