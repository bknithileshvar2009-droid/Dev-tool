import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '2mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==============================================================================
// BREVO FOCUS BREAK REQUEST & VERIFICATION (SHARED NETLIFY / SERVER SERVICE)
// ==============================================================================
import { handleRequestBreak, handleVerifyBreak } from './netlify/functions/brevoService';

// Support both standard API routes and Netlify function routes
app.post(['/api/focus-break/request', '/.netlify/functions/request-break'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
    const result = await handleRequestBreak(authHeader, req.body, clientIp);
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error processing break request' });
  }
});

app.post(['/api/focus-break/verify', '/.netlify/functions/verify-break'], async (req, res) => {
  try {
    const result = await handleVerifyBreak(req.body);
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error verifying break approval code' });
  }
});

// ==============================================================================
// DAILY REGISTRY AI SUMMARY ENDPOINT
// ==============================================================================
app.post('/api/summarize-day', async (req, res) => {
  try {
    const { reflectionText } = req.body;
    if (!reflectionText || typeof reflectionText !== 'string' || !reflectionText.trim()) {
      return res.status(400).json({ error: 'Reflection text is required.' });
    }

    const systemInstruction = `You are an expert personal reflection assistant. Analyze the user's daily reflection and provide a thoughtful, structured daily summary.
Base every conclusion strictly on what the user actually wrote. Never invent accomplishments, events, emotions, or progress not mentioned.
Structure your response clearly with:
1. Overview of the Day
2. Key Accomplishments
3. Activities & Progress
4. Important Lessons Learned
5. Challenges & Possible Improvements
6. Unfinished Tasks (if mentioned)
7. Suggested Priorities for Tomorrow
8. A positive, realistic closing message.`;

    const prompt = `Here is my reflection for today:\n\n${reflectionText}\n\nPlease generate a thoughtful daily summary and analysis based on the above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const summary = response.text || 'Unable to generate summary at this moment.';
    return res.json({ summary });
  } catch (err: any) {
    console.error('[Gemini Summary API Error]:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate AI summary. Please try again later.',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[Apesflow Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('[Apesflow Server Startup Error]:', err);
});
