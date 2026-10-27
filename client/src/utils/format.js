export const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const today = () => new Date().toISOString().slice(0, 10);
export const display = (v) => {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (typeof v === 'object') return v.name || '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return fmtDate(v);
  return String(v);
};
export const badgeClass = (v) => {
  if (['Good', 'Excellent', 'Resolved', 'Low', 'Closed', 'Under Control', 'farmer'].includes(v)) return 'green';
  if (['Medium', 'Pending', 'In Progress', 'Fair', 'Under Review', 'Open', 'expert'].includes(v)) return 'amber';
  if (['High', 'Critical', 'Urgent', 'Poor', 'Active', 'admin'].includes(v)) return 'red';
  return 'blue';
};
