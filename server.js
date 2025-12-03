import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Quick status route
app.get("/status", (req, res) => {
  res.json({ ok: true, message: "KittyAI is alive and fast ⚡️" });
});

// Chat route with timeout + streaming
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Abort if OpenAI takes too long
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s max

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
        stream: true // <— stream responses
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Stream chunks directly to client
    res.setHeader("Content-Type", "text/event-stream");
    response.body.on("data", chunk => {
      res.write(chunk);
    });
    response.body.on("end", () => {
      res.end();
    });

  } catch (err) {
    res.status(500).json({ error: "KittyAI request failed", details: err.message });
  }
});

// Image route with timeout
app.post("/generate-image", async (req, res) => {
  const prompt = req.body.prompt;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s max

  try {
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

app.listen(PORT, () => {
  console.log(`KittyAI running on http://localhost:${PORT}`);
});
