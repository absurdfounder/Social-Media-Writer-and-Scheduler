// server.js
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Use the desired model (for example: gemini-2.0-flash-lite)
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

// Configure generation settings (adjust maxOutputTokens as needed)
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 256,
  responseModalities: [],
  responseMimeType: "text/plain",
};

app.post("/generate-reply", async (req, res) => {
  const { inputText } = req.body;
  if (!inputText) {
    return res.status(400).json({ error: "No input text provided" });
  }
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the user-provided text as the message
    const result = await chatSession.sendMessage(inputText);

    // Retrieve the generated reply text
    const reply = result.response.text();
    res.json({ reply });
  } catch (error) {
    console.error("Error generating reply:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
