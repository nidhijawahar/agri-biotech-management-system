import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { ErrorMessage } from '../components/ui';

function Shell({ title, children }) {
  return <div className="auth-page"><div className="card auth-card"><Link to="/" className="brand dark">🌱 AgriBiotech</Link><h2>{title}</h2>{children}</div></div>;
}
export function Login() {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.email, f.password); nav('/dashboard'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Welcome back"><form className="form" onSubmit={submit}>
      <ErrorMessage message={err} />
      <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div className="field"><label>Password</label><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
      <button className="btn primary block" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
      <p className="muted center-text">No account? <Link to="/register">Register</Link></p>
    </form></Shell>
  );
}
export function Register() {
  const { user, register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', role: 'farmer', phone: '', location: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters');
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    setBusy(true);
    try { const { confirm, ...payload } = f; await register(payload); nav('/dashboard'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Create your account"><form className="form" onSubmit={submit}>
      <ErrorMessage message={err} />
      <div className="field"><label>Full name *</label><input className="input" required value={f.name} onChange={set('name')} /></div>
      <div className="field"><label>Email *</label><input className="input" type="email" required value={f.email} onChange={set('email')} /></div>
      <div className="field"><label>I am a *</label><select className="input" value={f.role} onChange={set('role')}><option value="farmer">Farmer</option><option value="expert">Agricultural Expert / Field Officer</option></select></div>
      <div className="form-grid"><div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div><div className="field"><label>Location</label><input className="input" value={f.location} onChange={set('location')} /></div></div>
      <div className="form-grid"><div className="field"><label>Password *</label><input className="input" type="password" required minLength={6} value={f.password} onChange={set('password')} /></div><div className="field"><label>Confirm *</label><input className="input" type="password" required value={f.confirm} onChange={set('confirm')} /></div></div>
      <button className="btn primary block" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
      <p className="muted center-text">Already registered? <Link to="/login">Login</Link></p>
    </form></Shell>
  );
}
