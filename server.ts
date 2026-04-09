import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Prediction
  app.post("/api/predict", async (req, res) => {
    const { temperature, vibration, pressure } = req.body;

    if (temperature === undefined || vibration === undefined || pressure === undefined) {
      return res.status(400).json({ error: "Missing sensor data" });
    }

    try {
      // Use Gemini to analyze the data and provide a recommendation
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following sensor data for an industrial machine and predict if a failure is likely. 
        Temperature: ${temperature}°C
        Vibration: ${vibration} mm/s
        Pressure: ${pressure} PSI
        
        Return the result in JSON format with two fields:
        1. "status": either "Failure likely" or "Normal"
        2. "action": a recommended maintenance action or "No action needed".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ["status", "action"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Fallback logic if AI fails
      let status = "Normal";
      let action = "No action needed";
      
      if (temperature > 85 || vibration > 15 || pressure > 120) {
        status = "Failure likely";
        action = "Schedule immediate maintenance check";
      }
      
      res.json({ status, action });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
