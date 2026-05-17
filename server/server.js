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

// Health check — must respond before DB connects so Render marks service healthy
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Root route — friendly message instead of Express "Cannot GET /"
app.get('/', (req, res) => res.json({ name: 'TaskMatrix API', status: 'running', health: '/api/health' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to DB after server is listening
connectDB().catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  console.error('Set MONGO_URI to a MongoDB Atlas connection string in Render environment variables.');
  process.exit(1);
});
