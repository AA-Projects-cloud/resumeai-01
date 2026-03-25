const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ CRITICAL: GEMINI_API_KEY is missing in process.env!');
} else {
  console.log('✅ GEMINI_API_KEY found (starts with:', apiKey.substring(0, 8) + '...)');
}

// In current SDK version, only API key should be passed to constructor
const ai = new GoogleGenerativeAI(apiKey || '');

module.exports = ai;
