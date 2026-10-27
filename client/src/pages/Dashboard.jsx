import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, ErrorMessage, Spinner, StatCard } from '../components/ui';

const COLORS = ['#2e7d32', '#f9a825', '#0277bd', '#c62828', '#6a1b9a', '#00838f', '#ef6c00', '#558b2f'];

export function Chart({ title, type, data }) {
  return (
    <div className="card chart">
      <h3>{title}</h3>
      {!data.length ? <div className="empty">No data yet</div> : (
        <ResponsiveContainer width="100%" height={240}>
          {type === 'pie' ? (
            <PieChart><Pie data={data} dataKey="count" nameKey="name" outerRadius={80} label>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
          ) : (
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="count" fill="#2e7d32" radius={[4, 4, 0, 0]} /></BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function DiseaseStats() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/dashboard/diseases').then((r) => setS(r.data)).catch(() => {}); }, []);
  if (!s) return null;
  return (
    <div className="section">
      <div className="stats"><StatCard icon="🦠" label="Total disease reports" value={s.total} /><StatCard icon="🔴" label="Active cases" value={s.active} /><StatCard icon="⚠️" label="High-severity cases" value={s.high} /></div>
      <div className="grid-2"><Chart title="Diseases by crop" type="bar" data={s.byCrop} /><Chart title="Reports by location" type="bar" data={s.byLocation} /></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/dashboard').then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  const links = { 'Latest farmer problems': '/problems', 'Pending farmer problems': '/problems', 'Recent observations': '/observations', 'Recent disease reports': '/diseases', 'Upcoming follow-ups': '/advisories', 'Recent recommendations': '/recommendations' };
  return (
    <div>
      <div className="page-head"><div><h1>Welcome, {user.name.split(' ')[0]} 👋</h1><p className="muted">{user.role === 'admin' ? 'Administration overview' : user.role === 'expert' ? 'Expert / Field Officer workspace' : 'Your farm at a glance'}</p></div></div>
      <ErrorMessage message={err} />
      {!d && !err ? <Spinner /> : d && (
        <>
          <div className="stats">{d.cards.map((c) => <StatCard key={c.label} {...c} />)}</div>
          <div className="grid-2">{d.charts.map((c) => <Chart key={c.title} {...c} />)}</div>
          <div className="grid-2">
            {d.lists.map((l) => (
              <div className="card" key={l.title}>
                <div className="between"><h3>{l.title}</h3>{links[l.title] && <Link to={links[l.title]}>View all →</Link>}</div>
                {!l.items.length ? <div className="empty">Nothing here yet</div> : <ul className="list">{l.items.map((i) => <li key={i.id}><div><strong>{i.primary}</strong>{i.secondary && <small className="muted block">{i.secondary}</small>}</div><Badge value={i.badge} /></li>)}</ul>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
