import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicNav() {
  const { user } = useAuth();
  return (
    <header className="public-nav">
      <Link to="/" className="brand dark">🌱 AgriBiotech</Link>
      <nav><Link to="/about">About</Link>{user ? <Link className="btn primary sm" to="/dashboard">Dashboard</Link> : <><Link to="/login">Login</Link><Link className="btn primary sm" to="/register">Register</Link></>}</nav>
    </header>
  );
}
const features = [
  ['🌾', 'Crop Varieties', 'A searchable catalogue of varieties with season, soil, water needs and disease resistance.'],
  ['🦠', 'Disease Surveillance', 'Report, track and map crop diseases with severity levels and photos.'],
  ['📋', 'Field Observations', 'Field officers record crop health, growth stage, weather and GPS on site.'],
  ['🧬', 'Biotech Guidance', 'Expert recommendations on biofertilizers, biopesticides and tissue culture.'],
  ['💬', 'Farmer Advisories', 'Personalised advice with priorities and follow-up dates for every farmer.'],
  ['⚠️', 'Problem Reporting', 'Farmers submit field problems with photos and get expert responses.'],
];
export function Landing() {
  return (
    <div className="public">
      <PublicNav />
      <section className="hero"><h1>Agri-Biotech Management &amp; Farmer Advisory System</h1>
        <p>One platform connecting agricultural scientists, field officers and farmers — from crop varieties to disease surveillance to personalised advisories.</p>
        <div className="row center"><Link className="btn primary" to="/register">Get Started</Link><Link className="btn light" to="/login">Login</Link></div></section>
      <section className="features">{features.map(([i, t, d]) => <div className="card feature" key={t}><div className="big">{i}</div><h3>{t}</h3><p className="muted">{d}</p></div>)}</section>
      <footer className="footer">© {new Date().getFullYear()} Agri-Biotech Management and Farmer Advisory System</footer>
    </div>
  );
}
export function About() {
  return (
    <div className="public"><PublicNav />
      <section className="prose card"><h1>About</h1>
        <p>The Agri-Biotech Management and Farmer Advisory System helps agri-biotechnology organisations manage crop varieties, monitor diseases, record field observations and deliver expert advisory services to farmers.</p>
        <h3>Roles</h3><p><strong>Admins</strong> manage users and all records. <strong>Experts / field officers</strong> record observations, report diseases, publish recommendations and advise farmers. <strong>Farmers</strong> browse varieties and disease information, report field problems and follow their advisories.</p>
        <h3>Please note</h3><p>Recommendations are agricultural information and expert guidance, not guarantees. Always follow product labels and local regulations, and consult an agricultural expert before applying treatments.</p>
      </section></div>
  );
}
