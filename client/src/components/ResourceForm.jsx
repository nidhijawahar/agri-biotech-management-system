import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from './ui';
import { today } from '../utils/format';

export default function ResourceForm({ fields, initial = {}, upload, onSubmit, onCancel, saving, error, submitLabel = 'Save' }) {
  const { user } = useAuth();
  const visible = fields.filter((f) => !f.roles || f.roles.includes(user.role));
  const [vals, setVals] = useState(() => {
    const v = {};
    visible.forEach((f) => {
      let x = initial[f.name];
      if (x && typeof x === 'object' && !Array.isArray(x)) x = x._id;
      if (Array.isArray(x)) x = x.join(', ');
      if (f.type === 'date' && x) x = String(x).slice(0, 10);
      v[f.name] = x ?? (f.default === 'today' ? today() : f.default ?? '');
    });
    return v;
  });
  const [files, setFiles] = useState([]);
  const [local, setLocal] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [cropNames, setCropNames] = useState([]);

  useEffect(() => {
    if (visible.some((f) => f.type === 'farmer')) api.get('/users/farmers').then((r) => setFarmers(r.data)).catch(() => {});
    if (visible.some((f) => f.type === 'crop')) api.get('/crops', { params: { limit: 100 } }).then((r) => setCropNames([...new Set(r.data.items.map((c) => c.cropName))])).catch(() => {});
  }, []);

  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));
  const pickFiles = (e) => {
    const list = [...e.target.files];
    if (list.length > 5) return setLocal('You can upload at most 5 images');
    const bad = list.find((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024);
    if (bad) { e.target.value = ''; return setLocal(`"${bad.name}" must be a JPG/PNG/WEBP image under 5MB`); }
    setLocal(''); setFiles(list);
  };
  const locate = (name) => {
    if (!navigator.geolocation) return setLocal('Geolocation is not supported in this browser');
    navigator.geolocation.getCurrentPosition((p) => set(name, `${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`), () => setLocal('Could not get your location'));
  };
  const submit = (e) => {
    e.preventDefault();
    const missing = visible.find((f) => (f.required || (f.requiredOnCreate && !initial._id)) && !String(vals[f.name]).trim());
    if (missing) return setLocal(`${missing.label} is required`);
    setLocal('');
    onSubmit(vals, files);
  };

  const input = (f) => {
    const req = f.required || (f.requiredOnCreate && !initial._id);
    const common = { id: f.name, className: 'input', value: vals[f.name], required: req, onChange: (e) => set(f.name, e.target.value) };
    switch (f.type) {
      case 'textarea': return <textarea {...common} rows={3} />;
      case 'select': return <select {...common}>{!req && <option value="">—</option>}{req && !vals[f.name] && <option value="">Select…</option>}{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
      case 'farmer': return <select {...common}><option value="">Select farmer…</option>{farmers.map((x) => <option key={x._id} value={x._id}>{x.name}{x.location ? ` — ${x.location}` : ''}</option>)}</select>;
      case 'crop': return <><input {...common} list="crop-list" autoComplete="off" /><datalist id="crop-list">{cropNames.map((n) => <option key={n} value={n} />)}</datalist></>;
      case 'gps': return <div className="row"><input {...common} placeholder="lat,lng" /><button type="button" className="btn ghost sm" onClick={() => locate(f.name)}>📍 Use my location</button></div>;
      case 'password': return <input {...common} type="password" minLength={6} placeholder={initial._id ? 'Leave blank to keep current' : ''} autoComplete="new-password" />;
      default: return <input {...common} type={f.type || 'text'} />;
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <ErrorMessage message={local || error} />
      <div className="form-grid">
        {visible.map((f) => (
          <div key={f.name} className={'field' + (f.type === 'textarea' || f.full ? ' full' : '')}>
            <label htmlFor={f.name}>{f.label}{(f.required || (f.requiredOnCreate && !initial._id)) && <span className="req"> *</span>}</label>
            {input(f)}
            {f.help && <small>{f.help}</small>}
          </div>
        ))}
        {upload && (
          <div className="field full">
            <label>Images (JPG/PNG/WEBP, max 5 files, 5MB each)</label>
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickFiles} />
            {initial.images?.length > 0 && <small>{initial.images.length} image(s) already attached; new uploads are added.</small>}
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
