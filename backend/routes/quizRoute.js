const express = require('express');
const Groq = require('groq-sdk');
const vectorStore = require('../services/vectorStoreService');

const router = express.Router();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post("/generate-quiz", async (req, res) => {
    try {

        // 1. Retrieve relevant chunks (REAL RAG STEP)
        const matches = await vectorStore.queryMemories(
            "Generate quiz questions from uploaded document",
            8
        );

        const context = matches
            .map(m => m.text)
            .join("\n");

        if (!context || context.trim().length === 0) {
            return res.status(400).json({
                error: "No document data found. Please upload files first."
            });
        }

        // 2. AI Prompt
        const prompt = `
You are an expert teacher.

Create 5 multiple-choice questions from the document below.

Rules:
- Return ONLY valid JSON
- Each question must have 4 options
- The answer must exactly match one option.

Format:
[
  {
    "question": "...",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "answer": "option 1"
  }
]

Document:
${context}
        `;

        // 3. Call AI
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }]
        });

        // 4. Parse safely
        const content = response.choices[0].message.content;

        let quiz;
        try {
            quiz = JSON.parse(content);
        } catch (err) {
            console.error("Invalid JSON from AI:", content);
            return res.status(500).json({
                error: "AI returned invalid format"
            });
        }

        res.json({ quiz });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Quiz generation failed" });
    }
});

module.exports = router;