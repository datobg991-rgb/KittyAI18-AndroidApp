// server.js — KittyAI Shrine Gateway ⚡️

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());            // allow cross-origin requests
app.use(express.json());    // parse JSON bodies

const PORT = process.env.PORT || 3000;

// 🟢 Status route — instant reply
app.get("/status", (req, res) => {
  res.json({ ok: true, message: "KittyAI shrine is alive ⚡️" });
});

// 💬 Chat route — streaming + timeout
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s max

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
        stream: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Stream chunks directly to client
    res.setHeader("Content-Type", "text/event-stream");
    response.body.on("data", chunk => res.write(chunk));
    response.body.on("end", () => res.end());

  } catch (err) {
    res.status(500).json({ error: "KittyAI request failed", details: err.message });
  }
});

// 🎨 Image generation route — with timeout
app.post("/generate-image", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s max

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "512x512"
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Image generation failed", details: err.message });
  }
});

// 🚀 Launch server
app.listen(PORT, () => {
  console.log(`KittyAI running on http://localhost:${PORT}`);
});
