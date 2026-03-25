const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('--- Models via SDK ---');
    // The SDK doesn't have a direct listModels, we use the REST API for that
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log('No models found or error:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
}

listModels();
