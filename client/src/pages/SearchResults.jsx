import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { ErrorMessage, Spinner } from '../components/ui';

export default function SearchResults() {
  const [sp] = useSearchParams(); const q = sp.get('q') || '';
  const [res, setRes] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { setRes(null); api.get('/search', { params: { q } }).then((r) => setRes(r.data.results)).catch((e) => setErr(errMsg(e))); }, [q]);
  return (
    <div>
      <div className="page-head"><div><h1>Search results</h1><p className="muted">for “{q}”</p></div></div>
      <ErrorMessage message={err} />
      {!res && !err ? <Spinner /> : res && (res.length === 0 ? <div className="card empty">No matches found.</div> : res.map((g) => (
        <div className="card section" key={g.module}>
          <div className="between"><h3>{g.module}</h3><Link to={`${g.path}?q=${encodeURIComponent(q)}`}>View all in {g.module} →</Link></div>
          <ul className="list">{g.items.map((i) => <li key={i.id}><div><strong>{i.primary}</strong><small className="muted block">{i.secondary}</small></div></li>)}</ul>
        </div>
      )))}
    </div>
  );
}
