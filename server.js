const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are the virtual assistant for Dimension Better Service, a professional cleaning company based in Melbourne, Australia. Be friendly, concise, and helpful. Only answer questions related to this business.

SERVICES & PRICING:
1. End of Lease Cleaning — from $250. Follows full REIV-approved checklist. Main specialty.
2. Regular Cleaning — from $100. Kitchen surfaces, bathrooms, floors, mirrors, toilets, sinks, stovetops, countertops.
3. Carpet & Floor Cleaning — from $60. Professional-grade deep clean equipment.

ADD-ONS: Oven +$40, Balcony +$50, Steam cleaning +$50, Pets +$100, Fridge +$50, Windows outside +$60, Microwave +$30, Blind +$150, No carpark +$20

CONTACT:
- WhatsApp: +61 452 091 092 and +61 410 729 438
- Email: admin@dimensionbetterservice.com
- Website: dimensionbetterservice.com

HOURS: Monday to Saturday 7am-6pm, Sunday 7am-2pm

ABOUT: 7+ years experience, 500+ happy clients, ALL Melbourne suburbs, vetted team, REIV checklist.

RULES:
- Only answer questions related to this business
- Keep answers concise and friendly (2-4 sentences max)
- When asked about pricing, say it starts from $250 and send them to: https://dimensionbetterservice.com/#pricing
- When asked about booking or how to book, give a brief answer and always include this link at the end: https://dimensionbetterservice.com/#pricing
- Respond in the same language the user writes in (English or Spanish)
- Never make up information not listed above`;

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }
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
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history]
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

app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'DBS Chatbot Backend' });
});

app.listen(PORT, () => {
  console.log(`DBS Chatbot backend running on port ${PORT}`);
});
