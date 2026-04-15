const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the index.html file
app.use(express.static(path.join(__dirname)));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Dr. Nick's virtual assistant for Apple Rehab Group in Chattanooga, Tennessee. 

Dr. Nick (Dr. Nicholas J. Circolone) is a board-certified Chiropractic Orthopedist (DC, DIANM) — one of only two in Tennessee with this distinction. He is the CEO of Apple Rehab Group, a multispecialty practice focused on collaborative conservative care.

You help patients and visitors by:
- Answering questions about Apple Rehab Group's services
- Explaining what a Chiropractic Orthopedist is and how it differs from a general chiropractor
- Providing information about Dr. Nick's background, credentials, and approach
- Mentioning Dr. Nick's books: The Fire Within, The Second Brain, The Conservative Orthopedist, The Awakened Christian, It's OK to Ask God That, Before the Trumpet Sounds, and The Redeemed Cases of Sherlock Holmes series
- Directing people to the Health Chatt podcast and YouTube channel
- Encouraging patients in the Chattanooga area to schedule a consultation

Always be warm, professional, and helpful. If you don't know a specific answer, suggest they call the office or visit drnick.co.`;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }]
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
