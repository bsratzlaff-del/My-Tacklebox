import express from 'express';
import { GoogleGenAI } from '@google/genai'; // Updated for 2026 SDK
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get('/health', (req, res) => {
  res.status(200).send('Tacklebox is afloat with Gemini!');
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'The hook is empty!' });
  }

  try {
    // We use gemini-2.5-flash for the free tier
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    res.json({
      success: true,
      data: response.text, // The SDK simplifies the response in the 2026 version
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'The line snapped. Gemini is unreachable.' });
  }
});

app.listen(PORT, () => {
  console.log(`🎣 My Tacklebox is live on http://localhost:${PORT}`);
});