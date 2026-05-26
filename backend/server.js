import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import Profile from './models/Profile.js';
import Gear from './models/Gear.js';
import logger from './logger.js'; // 🛠️ Imports your clean logger.js file!
import scanRoutes from '/src/routes/scan.routes.js'; // 🧑‍🔬 Import the new scan routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/inventory', scanRoutes);

// 1. Extract Environment Variables injected by Kubernetes
const mongoUser = encodeURIComponent(process.env.MONGO_USER || '');
const mongoPass = encodeURIComponent(process.env.MONGO_PASS || '');
const mongoHost = process.env.MONGO_HOST || 'localhost';

const mongoURI = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/tacklebox?authSource=admin`;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => logger.info('📁 Cast a line into MongoDB successfully!'))
  .catch((err) => logger.error(`❌ Database connection snapped: ${err.message}`));

// Monitor MongoDB connection lifecycle events
mongoose.connection.on('connected', () => logger.info('📁 MongoDB Status: Connected'));
mongoose.connection.on('error', (err) => logger.error('🚨 MongoDB Error:', err));
mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB Status: Disconnected from cluster!'));

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

// GET: Fetch all gear/bait inside a specific user's tacklebox
app.get('/api/gear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all gear documents that match this userId
    const tacklebox = await Gear.find({ userId });

    logger.info(`📦 Retrieved ${tacklebox.length} gear items for user ${userId}`);
    res.status(200).json(tacklebox);
  } catch (error) {
    logger.error(`🚨 Failed to fetch tacklebox: ${error.message}`);
    res.status(500).json({ error: 'Could not retrieve tacklebox inventory.' });
  }
});

app.post('/api/gear', async (req, res) => {
  try {
    const { userId, name, category, brand, color, metadata } = req.body;
    const newGear = new Gear({ userId, name, category, brand, color, metadata });
    const savedGear = await newGear.save();
    logger.info(`🪱 Added ${category}: ${name} to tacklebox!`);
    res.status(201).json(savedGear);
  } catch (error) {
    logger.error(`🚨 Failed to add gear: ${error.message}`);
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

app.post('/api/profiles', async (req, res) => {
  try {
    const { username, email, experienceLevel, preferredStyle, homeWaters } = req.body;

    // Validate minimum required fields
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required to cast a profile!' });
    }

    // Create a new instance of the Profile model
    const newProfile = new Profile({
      username,
      email,
      experienceLevel,
      preferredStyle,
      homeWaters
    });

    // Save it directly into the running MongoDB cluster
    const savedProfile = await Profile.create(newProfile);

    // Log the success to your permanent combined.log file!
    logger.info(`👤 Profile created successfully for user: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Profile hooked and saved!',
      data: savedProfile
    });

  } catch (error) {
    // If MongoDB throws a duplicate key error (e.g., username already taken)
    if (error.code === 11000) {
      logger.warn(`⚠️ Duplicate profile attempt for username/email`);
      return res.status(400).json({ error: 'That username or email already exists in our database!' });
    }

    // Catch-all for unexpected database failures
    logger.error(`🚨 Failed to save profile: ${error.message}`);
    res.status(500).json({ error: 'The database layer rejected the profile. Check mongo.log!' });
  }
});

app.listen(PORT, () => {
  console.log(`🎣 My Tacklebox backend is live on port ${PORT}`);
});