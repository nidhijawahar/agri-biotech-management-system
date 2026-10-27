const path = require('path'), fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express'), cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const resources = require('./routes/resources');

const app = express();
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff') }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/dashboard'));
Object.entries(resources).forEach(([name, router]) => app.use('/api/' + name, router));

const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get(/^(?!\/api|\/uploads).*/, (req, res) => res.sendFile(path.join(dist, 'index.html'))); }

app.use('/api', notFound);
app.use(errorHandler);

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Missing JWT_SECRET or MONGO_URI in server/.env'); process.exit(1); }
const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
