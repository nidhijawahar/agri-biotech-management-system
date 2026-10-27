import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [['/dashboard', '📊', 'Dashboard'], ['/users', '👥', 'User Management'], ['/crops', '🌾', 'Crop Varieties'], ['/diseases', '🦠', 'Diseases'], ['/recommendations', '🧬', 'Recommendations'], ['/observations', '📋', 'Field Observations'], ['/problems', '⚠️', 'Farmer Problems'], ['/advisories', '💬', 'Advisories']],
  expert: [['/dashboard', '📊', 'Dashboard'], ['/observations', '📋', 'Field Observations'], ['/diseases', '🦠', 'Disease Surveillance'], ['/crops', '🌾', 'Crop Varieties'], ['/recommendations', '🧬', 'Recommendations'], ['/problems', '⚠️', 'Farmer Problems'], ['/advisories', '💬', 'Farmer Advisories']],
  farmer: [['/dashboard', '📊', 'Dashboard'], ['/crops', '🌾', 'Crop Varieties'], ['/diseases', '🦠', 'Disease Information'], ['/recommendations', '🧬', 'Recommendations'], ['/problems', '⚠️', 'My Problems'], ['/problems?new=1', '➕', 'Submit Problem'], ['/advisories', '💬', 'My Advisories']],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const loc = useLocation(), nav = useNavigate();
  const active = (to) => { const [p, s] = to.split('?'); return loc.pathname === p && (s ? loc.search.includes(s) : !loc.search.includes('new=1')); };
  const search = (e) => { e.preventDefault(); if (q.trim().length >= 2) { nav('/search?q=' + encodeURIComponent(q.trim())); setQ(''); } };

  return (
    <div className="app-shell">
      <aside className={'sidebar' + (open ? ' open' : '')}>
        <Link to="/" className="brand">🌱 AgriBiotech</Link>
        <nav onClick={() => setOpen(false)}>
          {NAV[user.role].map(([to, icon, label]) => <Link key={to} to={to} className={active(to) ? 'active' : ''}><span>{icon}</span>{label}</Link>)}
        </nav>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="navbar">
          <button className="icon-btn menu" onClick={() => setOpen(true)} aria-label="Menu">☰</button>
          <form onSubmit={search} className="global-search"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crops, diseases, recommendations…" /></form>
          <div className="user-chip"><div><strong>{user.name}</strong><small className="role">{user.role === 'expert' ? 'Expert / Field Officer' : user.role}</small></div>
            <button className="btn ghost sm" onClick={() => { logout(); nav('/login'); }}>Logout</button></div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
