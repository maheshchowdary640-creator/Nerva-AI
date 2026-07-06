const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.get('/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: hasKey ? 'AVAILABLE' : 'NOT_CONFIGURED'
  });
});

router.post('/explain', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const { type, context } = req.body;
    if (!type || !context) {
      return res.status(400).json({ error: 'Missing explanation type or structured context.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are the intelligence explanation layer for NERVA AI, "The Autonomous Nervous System for Business Operations".
You must explain only the structured operational evidence provided to you.
Do not invent metrics, events, products, branches, financial values, actions, or causal evidence.
If information is not available in the provided NERVA context, explicitly say that the available operational data does not establish it.
Distinguish anomaly correlation from proven causation.
Treat root-cause conclusions as evidence-supported hypotheses unless explicitly marked otherwise.
Do not authorize actions.
Do not override organizational policy.
Do not recommend executing an action that NERVA's Policy Engine has blocked.
Do not claim an execution occurred unless execution state confirms completion.
Use concise professional business language.`
    });

    const prompt = `Perform an operational explanation of type: "${type}".
Context:
${JSON.stringify(context, null, 2)}

Provide a structured briefing explaining the operational circumstances, metrics, risks, and recommended strategies in concise markdown format. Avoid general preamble.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    console.error('Gemini Explain Error:', error);
    res.status(500).json({ error: 'Failed to generate generative explanation.', details: error.message });
  }
});

router.post('/ask', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Missing question or structured context.' });
    }

    // Context filter: block unrelated query attempts
    const questionLower = question.toLowerCase();
    const isNervaRelated = questionLower.includes('nerva') || 
                           questionLower.includes('incident') || 
                           questionLower.includes('strategy') || 
                           questionLower.includes('policy') || 
                           questionLower.includes('hyderabad') || 
                           questionLower.includes('vijayawada') || 
                           questionLower.includes('anomaly') || 
                           questionLower.includes('stock') || 
                           questionLower.includes('supplier') || 
                           questionLower.includes('workforce') || 
                           questionLower.includes('sentiment') || 
                           questionLower.includes('evidence') || 
                           questionLower.includes('transfer') || 
                           questionLower.includes('procurement') || 
                           questionLower.includes('metric');

    if (!isNervaRelated) {
      return res.json({ text: "Ask NERVA is strictly restricted to the active operational incident, anomalies, and NERVA evidence. Please ask an operational question regarding current signals, incident hypotheses, strategies, or policy rules." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are the intelligence explanation layer for NERVA AI.
You must answer questions about the active incident and NERVA's operational evidence using only the structured context provided.
Do not invent facts, metrics, or events.
If the question cannot be answered from the provided context, state that the context lacks sufficient operational data to establish it.
Use concise professional business language.`
    });

    const prompt = `Context:
${JSON.stringify(context, null, 2)}

Question:
${question}

Answer the question concisely using the provided context.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error) {
    console.error('Gemini Ask Error:', error);
    res.status(500).json({ error: 'Failed to process question.', details: error.message });
  }
});

module.exports = router;
