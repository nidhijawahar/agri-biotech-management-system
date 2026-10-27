import { badgeClass } from '../utils/format';

export const Spinner = ({ full }) => <div className={full ? 'spinner-full' : 'spinner-wrap'}><div className="spinner" /></div>;
export const ErrorMessage = ({ message }) => (message ? <div className="alert error">⚠️ {message}</div> : null);
export const Badge = ({ value }) => (value ? <span className={'badge ' + badgeClass(value)}>{value}</span> : null);
export const StatCard = ({ icon, label, value }) => (
  <div className="stat-card"><div className="stat-icon">{icon}</div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></div>
);
export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
export function ConfirmDialog({ message, onConfirm, onCancel, busy }) {
  return (
    <Modal title="Please confirm" onClose={onCancel}>
      <p>{message}</p>
      <div className="form-actions"><button className="btn ghost" onClick={onCancel}>Cancel</button><button className="btn danger" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Yes, delete'}</button></div>
    </Modal>
  );
}
export const SearchBar = ({ value, onChange, placeholder }) => (
  <input className="input search" type="search" value={value} placeholder={placeholder || 'Search…'} onChange={(e) => onChange(e.target.value)} />
);
export const Pagination = ({ page, pages, onChange }) => (pages > 1 ? (
  <div className="pagination">
    <button className="btn ghost sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
    <span>Page {page} of {pages}</span>
    <button className="btn ghost sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
  </div>
) : null);
