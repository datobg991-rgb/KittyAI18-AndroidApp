const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Directly using your API key (simpler, but less secure)
const API_KEY = "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";

app.use(bodyParser.json());

// 🏠 Root
app.get('/', (req, res) => {
  res.send('🐱 KittyAI server is running with real AI power!');
});

// 💬 Chat with AI
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI chat failed", details: error.message });
  }
});

// 🖼️ Generate Image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      { model: "gpt-image-1", prompt },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );

    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    res.status(500).json({ error: "Image generation failed", details: error.message });
  }
});

// 🎬 Generate Video (placeholder until API supports video)
app.post('/generate-video', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  res.json({ message: `Video generation for "${prompt}" is not yet supported.` });
});

app.listen(PORT, () => {
  console.log(`KittyAI is live at http://localhost:${PORT}`);
});
