import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { Landing, About } from './pages/Public';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SearchResults from './pages/SearchResults';
import { CropsPage, DiseasesPage, ObservationsPage, RecommendationsPage, AdvisoriesPage, ProblemsPage, UsersPage } from './pages/resources';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/crops" element={<CropsPage />} />
        <Route path="/diseases" element={<DiseasesPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/advisories" element={<AdvisoriesPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/observations" element={<ProtectedRoute roles={['admin', 'expert']}><ObservationsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
