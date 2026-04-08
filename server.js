// ═══════════════════════════════════════════════════════
//  Dimension Better Service — Chatbot Backend
//  Node.js + Express server that calls Groq API
//
//  SETUP:
//  1. Upload this file to your server
//  2. Run: npm install express cors node-fetch
//  3. Set your Groq API key below
//  4. Run: node server.js
//  5. Update DBS_API_URL in chatbot-widget.html
// ═══════════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── YOUR GROQ API KEY ──────────────────────────────────
const GROQ_API_KEY = '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';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
// ──────────────────────────────────────────────────────

// Allow requests from your website domain
app.use(cors({
  origin: [
    'https://dimensionbetterservice.com',
    'https://www.dimensionbetterservice.com',
    'http://localhost',       // for local testing
    'http://127.0.0.1'
  ]
}));

app.use(express.json());

// System prompt — all business knowledge
const SYSTEM_PROMPT = `You are the virtual assistant for Dimension Better Service, a professional cleaning company based in Melbourne, Australia. Be friendly, concise, and helpful. Only answer questions related to this business.

SERVICES & PRICING:
1. End of Lease Cleaning — from $250. Follows full REIV-approved checklist. Main specialty.
2. Regular Cleaning — from $100. Kitchen surfaces, bathrooms, floors, mirrors, toilets, sinks, stovetops, countertops.
3. Carpet & Floor Cleaning — from $60. Professional-grade deep clean equipment.

PRICING FORMULA (End of Lease):
Base price = bedrooms x $45 + full bathrooms x $120 + half bathroom x $60
Examples:
- 1 bed / 1 bath = $165
- 2 bed / 1 bath = $210
- 3 bed / 2 bath = $375
- 4 bed / 2 bath = $420
- 5 bed / 3 bath = $585

ADD-ONS (extra on top of base price):
- Oven: +$40
- Balcony: +$50
- Steam cleaning: +$50
- Pets: +$100
- Fridge: +$50
- Windows outside: +$60
- Microwave: +$30
- Blind: +$150
- No carpark available for team: +$20

CONTACT:
- WhatsApp: +61 452 091 092 and +61 410 729 438
- Email: admin@dimensionbetterservice.com
- Website: dimensionbetterservice.com
- Instagram: @dimension_better_service

HOURS:
- Monday to Saturday: 7am – 6pm
- Sunday: 7am – 2pm

ABOUT:
- 7+ years of experience
- 500+ happy clients
- Covers ALL Melbourne suburbs
- Fully vetted team
- REIV-approved checklist for end-of-lease jobs
- Clients regularly receive their full bond back

RULES:
- Only answer questions related to this business and its services
- If asked about something unrelated, politely redirect to the services
- Keep answers concise and friendly (2-4 sentences max when possible)
- For custom quotes, encourage users to use the online pricing calculator or contact via WhatsApp
- Respond in the same language the user writes in (English or Spanish)
- Never make up information not listed above`;

// ── CHAT ENDPOINT ──────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // Limit history to last 10 messages to save tokens
  const history = messages.slice(-10);

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 400,
        temperature: 0.5,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ]
      })
    });

    const data = await groqRes.json();

    if (data.error) {
      console.error('Groq error:', data.error);
      return res.status(500).json({ error: 'AI service error' });
    }

    const reply = data.choices[0].message.content;
    return res.json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── Health check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'DBS Chatbot Backend' });
});

app.listen(PORT, () => {
  console.log(`DBS Chatbot backend running on port ${PORT}`);
});
