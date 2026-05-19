import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Extract Environment Variables injected by Kubernetes
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST || 'localhost'; 

// 2. Build MongoDB connection string (routes via K8s internal DNS service name)
const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/tacklebox?authSource=admin`;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('📁 Cast a line into MongoDB successfully!'))
  .catch((err) => console.error('❌ Database connection snapped:', err));

// Monitor MongoDB connection lifecycle events
mongoose.connection.on('connected', () => console.log('📁 MongoDB Status: Connected'));
mongoose.connection.on('error', (err) => console.error('🚨 MongoDB Error:', err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB Status: Disconnected from cluster!'));

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'Tacklebox is afloat!',
    ai: 'Gemini client active',
    database: dbStatus
  });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'The hook is empty!' });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    res.json({
      success: true,
      data: response.text || "No text returned",
      debug: response
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'The line snapped. Gemini is unreachable.' });
  }
});

// ⚠️ DEBUG ONLY: Simulate a catastrophic application failure
app.post('/api/debug/crash', (req, res) => {
  console.error('💣 Chaos Endpoint Triggered! Simulating a fatal backend crash...');
  res.status(500).json({ status: 'crashing', message: 'The engine room is on fire! Goodbye.' });
  setTimeout(() => { process.exit(1); }, 500);
});

app.listen(PORT, () => {
  console.log(`🎣 My Tacklebox backend is live on port ${PORT}`);
});