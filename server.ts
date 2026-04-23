import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  // Helper to get model
  const getAIModel = () => {
    if (!genAI) throw new Error("GEMINI_API_KEY is not configured on the server.");
    return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  };

  // API Routes
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, schema, isMultimodal, imageData, mimeType } = req.body;
      const model = getAIModel();

      let result;
      if (isMultimodal && imageData) {
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType
            }
          }
        ]);
      } else {
        const generationConfig = schema ? {
          responseMimeType: "application/json",
          responseSchema: schema
        } : undefined;

        result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        });
      }

      const response = await result.response;
      const text = response.text();
      res.json({ text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to call Gemini API" });
    }
  });

  // Vite integration for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
