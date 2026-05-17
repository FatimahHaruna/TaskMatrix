require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

let dbReady = false;

// Health check — always responds so Render never marks the service as crashed
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbReady ? 'connected' : 'connecting' });
});

// Root route — friendly info page
app.get('/', (req, res) => {
  res.json({ name: 'TaskMatrix API', status: 'running', db: dbReady ? 'connected' : 'connecting', health: '/api/health' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to DB — server stays alive even if this fails
connectDB()
  .then(() => { dbReady = true; })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.error('Add MONGO_URI to Render environment variables (use MongoDB Atlas).');
  });
