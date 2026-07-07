const express = require('express');
const router = express.Router();

let GoogleGenAIClass = null;

// Dynamic import function for @google/genai ESM package in CommonJS
async function getGoogleGenAI() {
  if (!GoogleGenAIClass) {
    const genai = await import('@google/genai');
    GoogleGenAIClass = genai.GoogleGenAI;
  }
  return GoogleGenAIClass;
}

router.get('/health', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('[GEMINI] Health check: GEMINI_API_KEY not configured.');
    return res.json({ status: 'NOT_CONFIGURED' });
  }

  try {
    const GoogleGenAI = await getGoogleGenAI();
    const ai = new GoogleGenAI({ apiKey });
    
    // Perform a lightweight verification call to verify configuration is operational
    console.log('[GEMINI] Performing operational health check generation request...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping',
    });
    
    if (result && result.text) {
      console.log('[GEMINI] Operational health check successful.');
      return res.json({ status: 'AVAILABLE' });
    } else {
      console.log('[GEMINI ERROR] Health check returned empty response.');
      return res.json({ status: 'UNAVAILABLE' });
    }
  } catch (error) {
    console.error('[GEMINI ERROR] Operational health check failed:', error.message);
    return res.json({ status: 'UNAVAILABLE' });
  }
});

router.post('/explain', async (req, res) => {
  console.log('[GEMINI] Investigation request received');
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = !!apiKey;
  console.log(`[GEMINI] API key configured: ${isKeyConfigured}`);

  if (!apiKey) {
    console.log('[GEMINI ERROR] Gemini API Key is not configured on the server.');
    return res.status(400).json({ error: 'Gemini API Key is not configured on the server.' });
  }

  const { type, context } = req.body;
  if (!type || !context) {
    console.log('[GEMINI ERROR] Missing explanation type or structured context.');
    return res.status(400).json({ error: 'Missing explanation type or structured context.' });
  }

  const modelName = 'gemini-2.5-flash';
  console.log(`[GEMINI] Model being used: ${modelName}`);

  try {
    const GoogleGenAI = await getGoogleGenAI();
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the intelligence explanation layer for NERVA AI, "The Autonomous Nervous System for Business Operations".
You must explain only the structured operational evidence provided to you.
Do not invent metrics, events, products, branches, financial values, actions, or causal evidence.
If information is not available in the provided NERVA context, explicitly say that the available operational data does not establish it.
Distinguish anomaly correlation from proven causation.
Treat root-cause conclusions as evidence-supported hypotheses unless explicitly marked otherwise.
Do not authorize actions.
Do not override organizational policy.
Do not recommend executing an action that NERVA's Policy Engine has blocked.
Do not claim an execution occurred unless execution state confirms completion.
Use concise professional business language.`;

    const prompt = `Perform an operational explanation of type: "${type}".
Context:
${JSON.stringify(context, null, 2)}

Provide a structured briefing explaining the operational circumstances, metrics, risks, and recommended strategies in concise markdown format. Avoid general preamble.`;

    console.log('[GEMINI] Sending generation request');
    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const text = result.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response.');
    }

    console.log('[GEMINI] Generation successful');
    res.json({ text });
  } catch (error) {
    console.error('[GEMINI ERROR]', error.message);
    res.status(500).json({ error: 'Failed to generate generative explanation.', details: error.message });
  }
});

router.post('/ask', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GEMINI ERROR] process.env.GEMINI_API_KEY is not configured.');
    return res.status(400).json({ error: 'Gemini API Key is not configured on the server.' });
  }

  const { question, context } = req.body;
  if (!question || !context) {
    return res.status(400).json({ error: 'Missing question or structured context.' });
  }

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

  const modelName = 'gemini-2.5-flash';
  try {
    const GoogleGenAI = await getGoogleGenAI();
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the intelligence explanation layer for NERVA AI.
You must answer questions about the active incident and NERVA's operational evidence using only the structured context provided.
Do not invent facts, metrics, or events.
If the question cannot be answered from the provided context, state that the context lacks sufficient operational data to establish it.
Use concise professional business language.`;

    const prompt = `Context:
${JSON.stringify(context, null, 2)}

Question:
${question}

Answer the question concisely using the provided context.`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const text = result.text;
    res.json({ text });
  } catch (error) {
    console.error('[GEMINI ERROR] Ask question error:', error.message);
    res.status(500).json({ error: 'Failed to process question.', details: error.message });
  }
});

module.exports = router;
