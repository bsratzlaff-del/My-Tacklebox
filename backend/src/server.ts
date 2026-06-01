import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; // Handles loading environment variables automatically

// 🛠️ FIXED: Changed extension to .js so the compiler doesn't choke!
import Profile from './models/Profile.js'; 
import Gear from './models/Gear.js'; 
import scanRoutes from './routes/scan.routes.js'; 

import cors from 'cors';

const app = express();
// Ensure PORT is a number for Node's listen signature
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// 🔓 Tell your Express server to welcome requests coming from your Vue app!
app.use(cors({
  origin: '*'
}));

app.use(express.json());
app.use('/api/inventory', scanRoutes);

// ==========================================
// 🗄️ SECURE DATABASE AUTHENTICATION LOGIC
// ==========================================

// 1. Grab your credentials dynamically from your hidden .env variables
const dbUser = process.env.DB_USER ? encodeURIComponent(process.env.DB_USER) : '';
const dbPass = process.env.DB_PASS ? encodeURIComponent(process.env.DB_PASS) : '';

let mongoURI: string;

// 2. Build the connection string dynamically 
if (process.env.MONGO_URI) {
  // Use the full explicit string if defined in your .env
  mongoURI = process.env.MONGO_URI;
} else if (dbUser && dbPass) {
  // 🔐 Authenticate securely using your .env login credentials on port 27017
  mongoURI = `mongodb://${dbUser}:${dbPass}@127.0.0.1:27017/tacklebox?authSource=admin`;
} else {
  // Fallback if no variables are found
  mongoURI = 'mongodb://127.0.0.1:27017/tacklebox';
}

// 3. Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('📁 Cast a line into MongoDB successfully!'))
  .catch((err: any) => console.error(`❌ Database connection snapped: ${err.message}`));

// Connection lifecycle logs
mongoose.connection.on('connected', () => console.log('📁 MongoDB Status: Connected'));
mongoose.connection.on('error', (err: any) => console.error('🚨 MongoDB Error:', err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB Status: Disconnected!'));

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Search profiles by username or email
app.get('/api/profiles/search', async (req, res) => {
  try {
    // 🛠️ FIXED: Force the query parameter to be a string
    const username = String(req.query.username || ''); 
    
    if (!username) {
      return res.status(400).json({ error: 'Please provide a username to search for.' });
    }

    // Now TypeScript knows for a fact that 'username' is a pure string
    const foundProfiles = await Profile.find({ 
      username: { $regex: username, $options: 'i' } 
    });

    console.log(`🔍 Search completed. Found ${foundProfiles.length} profiles matching: ${username}`);
    res.status(200).json(foundProfiles);
  } catch (error: any) {
    console.error(`🚨 Profile search failed: ${error.message}`);
    res.status(500).json({ error: 'Database error encountered during profile search.' });
  }
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

// GET: Fetch all gear for a specific user
app.get('/api/gear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tacklebox = await Gear.find({ userId });
    console.log(`📦 Retrieved ${tacklebox.length} gear items for user ${userId}`);
    res.status(200).json(tacklebox);
  } catch (error: any) {
    console.error(`🚨 Failed to fetch tacklebox: ${error.message}`);
    res.status(500).json({ error: 'Could not retrieve tacklebox inventory.' });
  }
});

// POST: Add new gear item
app.post('/api/gear', async (req, res) => {
  try {
    const { userId, name, category, brand, color, metadata } = req.body;
    const newGear = new Gear({ userId, name, category, brand, color, metadata });
    const savedGear = await newGear.save();
    console.log(`🪱 Added ${category}: ${name} to tacklebox!`);
    res.status(201).json(savedGear);
  } catch (error: any) {
    console.error(`🚨 Failed to add gear: ${error.message}`);
    res.status(500).json({ error: 'The database layer rejected the gear item.' });
  }
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
      data: response.text || "No text returned"
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'The line snapped. Gemini is unreachable.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server casting wide lines on http://0.0.0.0:${PORT}`);
});