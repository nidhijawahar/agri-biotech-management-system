import { useState } from 'react';
import ResourcePage from '../components/ResourcePage';
import ResourceForm from '../components/ResourceForm';
import { DiseaseStats } from './Dashboard';
import { Modal } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';
import { Badge } from '../components/ui';
import { fmtDate } from '../utils/format';

const CATEGORY = ['Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Fruit', 'Cash Crop', 'Other'];
const SEASON = ['Kharif', 'Rabi', 'Zaid', 'Perennial', 'Year-round'];
const SEVERITY = ['Low', 'Medium', 'High', 'Critical'];
const D_STATUS = ['Active', 'Under Control', 'Resolved'];
const HEALTH = ['Excellent', 'Good', 'Fair', 'Poor'];
const STAGES = ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'];
const METHODS = ['Biofertilizer', 'Biopesticide', 'Microbial Solution', 'Disease-Resistant Variety', 'Tissue Culture', 'Biological Crop Protection', 'Soil Microbial Management', 'Other'];
const PRIORITY = ['Low', 'Medium', 'High', 'Urgent'];
const A_STATUS = ['Pending', 'In Progress', 'Resolved'];
const P_STATUS = ['Open', 'Under Review', 'Advisory Issued', 'Closed'];
const P_CATEGORY = ['Pest', 'Disease', 'Nutrient Deficiency', 'Water Stress', 'Soil Issue', 'Weather Damage', 'Other'];

const useStaff = () => { const { user } = useAuth(); return { user, staff: user.role !== 'farmer', admin: user.role === 'admin' }; };

export function CropsPage() {
  const { staff, user } = useStaff();
  return <ResourcePage title="Crop Varieties" subtitle="Registered crop varieties and their growing requirements" endpoint="/crops" upload newLabel="Add Crop Variety"
    can={{ create: staff, edit: staff, remove: staff }}
    columns={[{ key: 'cropName', label: 'Crop' }, { key: 'varietyName', label: 'Variety' }, { key: 'category', label: 'Category' }, { key: 'season', label: 'Season', badge: true }, { key: 'expectedYield', label: 'Expected Yield' }]}
    filters={[{ key: 'category', label: 'Category', type: 'select', options: CATEGORY }, { key: 'season', label: 'Season', type: 'select', options: SEASON }]}
    fields={[
      { name: 'cropName', label: 'Crop name', required: true }, { name: 'varietyName', label: 'Variety name', required: true },
      { name: 'category', label: 'Crop category', type: 'select', options: CATEGORY, required: true, default: 'Cereal' },
      { name: 'scientificName', label: 'Scientific name' }, { name: 'season', label: 'Growing season', type: 'select', options: SEASON, required: true, default: 'Kharif' },
      { name: 'soilType', label: 'Soil type' }, { name: 'waterRequirement', label: 'Water requirement' }, { name: 'temperatureRange', label: 'Temperature range' },
      { name: 'expectedYield', label: 'Expected yield' }, { name: 'diseaseResistance', label: 'Disease resistance' },
      { name: 'recommendedRegions', label: 'Recommended regions', help: 'Comma separated', full: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ]} />;
}

export function DiseasesPage() {
  const { staff, user } = useStaff();
  return <ResourcePage title={staff ? 'Disease Surveillance' : 'Disease Information'} endpoint="/diseases" upload newLabel="Report Disease"
    subtitle="Crop disease reports, symptoms and biotechnology-based management approaches" header={staff ? <DiseaseStats /> : null}
    can={{ create: staff, edit: staff, remove: staff }}
    columns={[{ key: 'diseaseName', label: 'Disease' }, { key: 'crop', label: 'Crop' }, { key: 'severity', label: 'Severity', badge: true }, { key: 'status', label: 'Status', badge: true }, { key: 'location', label: 'Location' }, { key: 'dateReported', label: 'Reported' }, { key: 'reportedBy', label: 'By' }]}
    filters={[{ key: 'crop', label: 'Crop' }, { key: 'severity', label: 'Severity', type: 'select', options: SEVERITY }, { key: 'status', label: 'Status', type: 'select', options: D_STATUS }, { key: 'location', label: 'Location' }]}
    fields={[
      { name: 'diseaseName', label: 'Disease name', required: true }, { name: 'crop', label: 'Crop affected', type: 'crop', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: SEVERITY, required: true, default: 'Medium' }, { name: 'status', label: 'Status', type: 'select', options: D_STATUS, required: true, default: 'Active' },
      { name: 'location', label: 'Location' }, { name: 'dateReported', label: 'Date reported', type: 'date', default: 'today' },
      { name: 'symptoms', label: 'Symptoms', type: 'textarea', required: true }, { name: 'causes', label: 'Causes', type: 'textarea' },
      { name: 'preventionMethods', label: 'Prevention methods', type: 'textarea' }, { name: 'treatment', label: 'Treatment / recommended biotechnology approach', type: 'textarea' },
      { name: 'environmentalConditions', label: 'Environmental conditions', type: 'textarea' },
    ]} />;
}

export function ObservationsPage() {
  return <ResourcePage title="Field Observations" subtitle="Observations recorded during field visits" endpoint="/observations" upload newLabel="New Observation"
    can={{ create: true, edit: true, remove: true }}
    columns={[{ key: 'observationDate', label: 'Date' }, { key: 'farmerName', label: 'Farmer' }, { key: 'location', label: 'Location' }, { key: 'crop', label: 'Crop' }, { key: 'growthStage', label: 'Stage' }, { key: 'plantHealth', label: 'Health', badge: true }, { key: 'observedBy', label: 'Officer' }]}
    filters={[{ key: 'crop', label: 'Crop' }, { key: 'location', label: 'Location' }, { key: 'from', label: 'From date', type: 'date' }, { key: 'to', label: 'To date', type: 'date' }]}
    fields={[
      { name: 'farmerName', label: 'Farmer name', required: true }, { name: 'location', label: 'Field / location', required: true },
      { name: 'crop', label: 'Crop', type: 'crop', required: true }, { name: 'cropVariety', label: 'Crop variety' },
      { name: 'growthStage', label: 'Plant growth stage', type: 'select', options: STAGES, required: true, default: 'Vegetative' },
      { name: 'plantHealth', label: 'Plant health', type: 'select', options: HEALTH, required: true, default: 'Good' },
      { name: 'soilCondition', label: 'Soil condition' }, { name: 'weatherCondition', label: 'Weather condition' },
      { name: 'observationDate', label: 'Date of observation', type: 'date', default: 'today' }, { name: 'gps', label: 'GPS location', type: 'gps' },
      { name: 'pestDiseaseSymptoms', label: 'Pest / disease symptoms', type: 'textarea' }, { name: 'notes', label: 'Observation notes', type: 'textarea' },
    ]} />;
}

export function RecommendationsPage() {
  const { staff } = useStaff();
  return <ResourcePage title="Recommendations" subtitle="Biotechnology recommendations from agricultural experts" endpoint="/recommendations" newLabel="Add Recommendation"
    notice="Recommendations are agricultural information and expert guidance. Results vary with field conditions — follow product labels and consult an agricultural expert before applying any treatment."
    can={{ create: staff, edit: staff, remove: staff }}
    columns={[{ key: 'title', label: 'Title' }, { key: 'crop', label: 'Crop' }, { key: 'problem', label: 'Problem' }, { key: 'method', label: 'Method', badge: true }, { key: 'expertName', label: 'Expert' }, { key: 'createdAt', label: 'Created' }]}
    filters={[{ key: 'crop', label: 'Crop' }, { key: 'method', label: 'Method', type: 'select', options: METHODS }]}
    fields={[
      { name: 'title', label: 'Recommendation title', required: true }, { name: 'method', label: 'Biotechnology method', type: 'select', options: METHODS, required: true, default: 'Biofertilizer' },
      { name: 'crop', label: 'Crop', type: 'crop', required: true }, { name: 'cropVariety', label: 'Crop variety' },
      { name: 'problem', label: 'Problem / disease' }, { name: 'growthStage', label: 'Recommended growth stage' },
      { name: 'expertName', label: 'Expert name', help: 'Defaults to your name' },
      { name: 'requiredInputs', label: 'Required inputs' },
      { name: 'description', label: 'Recommendation description', type: 'textarea', required: true }, { name: 'applicationMethod', label: 'Application method', type: 'textarea' },
      { name: 'expectedBenefits', label: 'Expected benefits', type: 'textarea' }, { name: 'precautions', label: 'Precautions', type: 'textarea' },
    ]} />;
}

export const advisoryFields = [
  { name: 'farmer', label: 'Farmer', type: 'farmer', required: true, roles: ['admin', 'expert'] },
  { name: 'crop', label: 'Crop', type: 'crop', required: true }, { name: 'cropVariety', label: 'Crop variety' }, { name: 'field', label: 'Field' },
  { name: 'priority', label: 'Priority', type: 'select', options: PRIORITY, required: true, default: 'Medium' },
  { name: 'status', label: 'Status', type: 'select', options: A_STATUS, required: true, default: 'Pending' },
  { name: 'followUpDate', label: 'Follow-up date', type: 'date' },
  { name: 'problemIdentified', label: 'Problem identified', required: true, full: true },
  { name: 'recommendedAction', label: 'Recommended action', type: 'textarea', required: true },
  { name: 'message', label: 'Advisory message', type: 'textarea', required: true },
];

export function AdvisoriesPage() {
  const { staff, user } = useStaff();
  return <ResourcePage title={staff ? 'Farmer Advisories' : 'My Advisories'} subtitle={staff ? 'Create and track advisories for farmers' : 'Advice from agricultural experts for your fields'} endpoint="/advisories" newLabel="Create Advisory"
    can={{ create: staff, edit: staff, remove: staff }}
    columns={[{ key: 'createdAt', label: 'Date' }, { key: 'farmer', label: 'Farmer' }, { key: 'crop', label: 'Crop' }, { key: 'problemIdentified', label: 'Problem' }, { key: 'priority', label: 'Priority', badge: true }, { key: 'status', label: 'Status', badge: true }, { key: 'followUpDate', label: 'Follow-up' }, { key: 'expert', label: 'Expert' }]}
    filters={[{ key: 'crop', label: 'Crop' }, { key: 'status', label: 'Status', type: 'select', options: A_STATUS }, { key: 'priority', label: 'Priority', type: 'select', options: PRIORITY }]}
    fields={advisoryFields} />;
}

function AdvisoryAction({ row, reload }) {
  const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [err, setErr] = useState('');
  const submit = async (v) => {
    setSaving(true); setErr('');
    try { await api.post('/advisories', { ...v, problem: row._id }); setOpen(false); reload(); } catch (e) { setErr(errMsg(e)); } finally { setSaving(false); }
  };
  const initial = { farmer: row.farmer?._id, crop: row.crop, cropVariety: row.cropVariety, field: row.location, problemIdentified: `${row.category}: ${row.description}`.slice(0, 200), priority: 'Medium', status: 'Pending' };
  return (
    <>
      <button className="btn primary sm" onClick={() => setOpen(true)}>Advise</button>
      {open && <Modal title={`Create advisory for ${row.farmer?.name || 'farmer'}`} wide onClose={() => setOpen(false)}>
        <ResourceForm fields={advisoryFields} initial={initial} onSubmit={submit} onCancel={() => setOpen(false)} saving={saving} error={err} submitLabel="Send advisory" />
      </Modal>}
    </>
  );
}

export function ProblemsPage() {
  const { user, staff } = useStaff();
  return <ResourcePage title={staff ? 'Farmer Problems' : 'My Problems'} subtitle={staff ? 'Problems reported by farmers — review them and issue advisories' : 'Problems you have reported from your fields'} endpoint="/problems" upload newLabel="Submit Problem"
    can={{ create: !staff, edit: (r) => staff || r.status === 'Open', remove: (r) => user.role === 'admin' || (!staff && true) }}
    columns={[{ key: 'dateObserved', label: 'Date' }, { key: 'farmer', label: 'Farmer' }, { key: 'crop', label: 'Crop' }, { key: 'category', label: 'Category' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status', badge: true }]}
    filters={[{ key: 'crop', label: 'Crop' }, { key: 'category', label: 'Category', type: 'select', options: P_CATEGORY }, { key: 'status', label: 'Status', type: 'select', options: P_STATUS }]}
    rowActions={staff ? (row, reload) => <AdvisoryAction row={row} reload={reload} /> : null}
    fields={[
      { name: 'crop', label: 'Crop', type: 'crop', required: true }, { name: 'cropVariety', label: 'Crop variety' },
      { name: 'location', label: 'Location', required: true }, { name: 'category', label: 'Problem category', type: 'select', options: P_CATEGORY, required: true, default: 'Pest' },
      { name: 'dateObserved', label: 'Date', type: 'date', default: 'today' },
      { name: 'status', label: 'Status', type: 'select', options: P_STATUS, required: true, default: 'Open', roles: ['admin', 'expert'] },
      { name: 'description', label: 'Description', type: 'textarea', required: true }, { name: 'symptoms', label: 'Symptoms', type: 'textarea' },
    ]} />;
}

export function UsersPage() {
  return <ResourcePage title="User Management" subtitle="Create, update and remove platform users" endpoint="/users" newLabel="Add User"
    can={{ create: true, edit: true, remove: true }}
    columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', badge: true }, { key: 'phone', label: 'Phone' }, { key: 'location', label: 'Location' }, { key: 'createdAt', label: 'Joined' }]}
    filters={[{ key: 'role', label: 'Role', type: 'select', options: ['admin', 'expert', 'farmer'] }]}
    fields={[
      { name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true }, { name: 'role', label: 'Role', type: 'select', options: ['admin', 'expert', 'farmer'], required: true, default: 'farmer' },
      { name: 'phone', label: 'Phone' }, { name: 'location', label: 'Location' },
    ]} />;
}
