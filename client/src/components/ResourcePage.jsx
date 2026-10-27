import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import ResourceForm from './ResourceForm';
import { Spinner, ErrorMessage, Modal, ConfirmDialog, SearchBar, Pagination, Badge } from './ui';
import { display } from '../utils/format';

const ok = (f, row) => (typeof f === 'function' ? f(row) : !!f);

export default function ResourcePage({ title, subtitle, endpoint, columns, fields, filters = [], upload = false, can = {}, header, rowActions, newLabel = 'Add New', notice }) {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [params, setParams] = useState({ q: sp.get('q') || '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const p = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api.get(endpoint, { params: p }).then((r) => { setItems(r.data.items); setMeta(r.data); setError(''); })
      .catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [endpoint, params]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { if (sp.get('new') && can.create) setForm({ mode: 'create' }); }, [sp.get('new')]);

  const setFilter = (k, v) => setParams((p) => ({ ...p, [k]: v, page: 1 }));
  const closeForm = () => { setForm(null); setFormErr(''); if (sp.get('new')) setSp({}); };

  const save = async (values, files) => {
    setSaving(true); setFormErr('');
    try {
      let data = values;
      if (upload) { data = new FormData(); Object.entries(values).forEach(([k, v]) => data.append(k, v ?? '')); files.forEach((f) => data.append('images', f)); }
      if (form.mode === 'edit') await api.put(`${endpoint}/${form.row._id}`, data); else await api.post(endpoint, data);
      closeForm(); load();
    } catch (e) { setFormErr(errMsg(e)); } finally { setSaving(false); }
  };
  const remove = async () => {
    setSaving(true);
    try { await api.delete(`${endpoint}/${del._id}`); setDel(null); load(); } catch (e) { setError(errMsg(e)); setDel(null); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-head">
        <div><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>
        {can.create && <button className="btn primary" onClick={() => setForm({ mode: 'create' })}>＋ {newLabel}</button>}
      </div>
      {notice && <div className="alert info">{notice}</div>}
      {header}
      <div className="toolbar card">
        <SearchBar value={params.q} onChange={(v) => setFilter('q', v)} placeholder={`Search ${title.toLowerCase()}…`} />
        {filters.map((f) => f.type === 'select' ? (
          <select key={f.key} className="input" value={params[f.key] || ''} onChange={(e) => setFilter(f.key, e.target.value)}>
            <option value="">{f.label}: All</option>{f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input key={f.key} className="input" type={f.type || 'text'} title={f.label} placeholder={f.label} value={params[f.key] || ''} onChange={(e) => setFilter(f.key, e.target.value)} />
        ))}
        {Object.entries(params).some(([k, v]) => k !== 'page' && v) && <button className="btn ghost sm" onClick={() => setParams({ q: '', page: 1 })}>Clear</button>}
      </div>
      <ErrorMessage message={error} />
      <div className="card table-wrap">
        {loading ? <Spinner /> : items.length === 0 ? <div className="empty">No records found.</div> : (
          <table>
            <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th>Actions</th></tr></thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  {columns.map((c) => <td key={c.label} data-label={c.label}>{c.render ? c.render(row) : c.badge ? <Badge value={row[c.key]} /> : display(row[c.key])}</td>)}
                  <td className="actions">
                    <button className="btn ghost sm" onClick={() => setView(row)}>View</button>
                    {ok(can.edit, row) && <button className="btn ghost sm" onClick={() => setForm({ mode: 'edit', row })}>Edit</button>}
                    {ok(can.remove, row) && <button className="btn danger-ghost sm" onClick={() => setDel(row)}>Delete</button>}
                    {rowActions && rowActions(row, load)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination page={meta.page} pages={meta.pages} onChange={(p) => setParams((s) => ({ ...s, page: p }))} />

      {form && (
        <Modal title={(form.mode === 'edit' ? 'Edit ' : 'New ') + title} onClose={closeForm} wide>
          <ResourceForm fields={fields} initial={form.row || {}} upload={upload} onSubmit={save} onCancel={closeForm} saving={saving} error={formErr} />
        </Modal>
      )}
      {view && (
        <Modal title="Details" onClose={() => setView(null)} wide>
          <dl className="details">
            {fields.filter((f) => f.type !== 'password').map((f) => <div key={f.name} className={f.type === 'textarea' ? 'full' : ''}><dt>{f.label}</dt><dd>{display(f.type === 'farmer' ? view.farmer : view[f.name])}</dd></div>)}
            {['reportedBy', 'observedBy', 'expert', 'createdBy', 'createdAt', 'updatedAt'].filter((k) => view[k]).map((k) => <div key={k}><dt>{k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</dt><dd>{display(view[k])}</dd></div>)}
          </dl>
          {view.images?.length > 0 && <div className="gallery">{view.images.map((src) => <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt="upload" /></a>)}</div>}
        </Modal>
      )}
      {del && <ConfirmDialog message="This record will be permanently deleted. Continue?" onConfirm={remove} onCancel={() => setDel(null)} busy={saving} />}
    </div>
  );
}
