const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '', 'v1');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not defined in environment variables!');
} else {
  console.log('✅ GEMINI_API_KEY is loaded (starts with:', process.env.GEMINI_API_KEY.substring(0, 6) + '...)');
}

module.exports = ai;
