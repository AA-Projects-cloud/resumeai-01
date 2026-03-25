const ai = require('../config/gemini');

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-3-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-pro'
];

/**
 * Helper to call Gemini with multiple fallback models and direct REST API recovery
 */
async function callGeminiWithFallback(prompt, systemInstruction = '') {
  let lastError = null;

  // 1. Try SDK with multiple models
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`🤖 Attempting AI generation with model: ${modelName}...`);
      const model = ai.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(
        systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
      );
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ AI generation successful with model: ${modelName}`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} failed: ${err.message}`);
      lastError = err;
    }
  }

  // 2. Final Fallback: Direct REST API call (bypasses SDK quirks)
  console.log('🚀 All SDK models failed. Attempting direct REST API fallback...');
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }] }]
      })
    });

    const data = await res.json();
      console.log('✅ AI generation successful via direct REST API (v1beta/gemini-2.5-flash)');
      return data.candidates[0].content.parts[0].text;
    
    if (data.error) {
      throw new Error(`REST API Error: ${data.error.message}`);
    }
  } catch (restErr) {
    console.error('❌ Direct REST API fallback also failed:', restErr.message);
    lastError = restErr;
  }

  throw new Error(`All AI generation attempts failed. Last error: ${lastError?.message}`);
}

/**
 * Build a structured prompt describing the user's resume data
 */
function buildResumeContext(resumeData) {
  const { personal, education, experience, projects, skills, certifications } = resumeData;
  const lines = [];

  if (personal) {
    lines.push(`NAME: ${personal.name || ''}`);
    lines.push(`TITLE: ${personal.title || ''}`);
    lines.push(`EMAIL: ${personal.email || ''}`);
    lines.push(`PHONE: ${personal.phone || ''}`);
    lines.push(`LOCATION: ${personal.location || ''}`);
    lines.push(`LINKS: ${personal.links || ''}`);
    lines.push(`SUMMARY: ${personal.summary || ''}`);
  }

  if (education?.length) {
    lines.push('\nEDUCATION:');
    education.forEach(e => lines.push(`- ${e.degree} at ${e.institute} (${e.year || ''}, ${e.score || ''})`));
  }

  if (experience?.length) {
    lines.push('\nEXPERIENCE:');
    experience.forEach(ex => lines.push(`- ${ex.role} at ${ex.company} | ${ex.duration || ''}: ${ex.description || ''}`));
  }

  if (projects?.length) {
    lines.push('\nPROJECTS:');
    projects.forEach(p => lines.push(`- ${p.title} (${p.tech || ''}): ${p.description || ''}`));
  }

  if (skills?.length) {
    lines.push(`\nSKILLS: ${Array.isArray(skills) ? skills.join(', ') : skills}`);
  }

  if (certifications?.length) {
    lines.push('\nCERTIFICATIONS:');
    certifications.forEach(c => lines.push(`- ${c.name} | ${c.org || ''} (${c.year || ''})`));
  }

  return lines.join('\n');
}

/**
 * Generate a full resume using Gemini AI
 */
async function generateFullResume({ resumeData, resumeType, tone, jobRole }) {
  const context = buildResumeContext(resumeData);

  const systemInstructions = `
You are an expert ATS-optimized resume writer and professional document formatter.
Your task is to generate a clean, modern, and highly professional resume in plain text format.
STRICT FORMATTING RULES:
1. Output ONLY resume content.
2. Section titles in ALL CAPS.
3. Use bullet points (•).
4. Maintain proper alignment and spacing.
`;

  const userPrompt = `Please generate a complete, ATS-optimized resume using the following information:\n\n${context}\n\nCRITICAL: Provide ONLY the resume text.`;

  try {
    const text = await callGeminiWithFallback(userPrompt, systemInstructions);
    const strengthScore = calculateStrengthScore(resumeData);
    return { text: cleanAiResponse(text), strengthScore };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

/**
 * Clean AI response from conversational filler
 */
function cleanAiResponse(text) {
  if (!text) return '';
  
  let cleaned = text.trim();
  
  // Remove common prefixes
  const prefixesToRemove = [
    /^This is a professional/i,
    /^Here is a professionally/i,
    /^Below is the/i,
    /^I have generated/i,
    /^Sure, here is/i
  ];
  
  // Remove internal notes often preceded by bullets or *
  const patternsToRemove = [
    /[•\*]?\s*\*?Note on.*/is,
    /[•\*]?\s*\*?Pro-tip.*/is,
    /If this was a typo.*/is,
    /I have expanded your summary.*/is,
    /passes through Applicant Tracking Systems.*/is
  ];

  // Attempt to find the first likely header (PERSONAL INFORMATION or NAME)
  // and strip everything before it if it looks conversational
  const lines = cleaned.split('\n');
  let startIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    // If line is ALL CAPS and significant, or looks like a name (not starting with "This is" or "Here")
    if (line && !prefixesToRemove.some(p => p.test(line)) && (line === line.toUpperCase() || i === 0)) {
      startIndex = i;
      break;
    }
  }
  
  cleaned = lines.slice(startIndex).join('\n').trim();

  // Apply specific pattern removals (mostly for notes at the end)
  patternsToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned.trim();
}

/**
 * Improve specific resume content using Gemini AI
 */
async function improveContent({ content, type, tone }) {
  const prompts = {
    summary: 'Rewrite this professional summary to be more compelling and ATS-optimized. Return only the improved text.',
    bullet: `Improve these bullet points to be more impactful with action verbs and quantified results. Tone: ${tone || 'professional'}. Return only the improved bullet points.`,
    skills: 'Suggest 10 additional relevant skills based on these existing skills. Return as a comma-separated list.',
  };

  const prompt = prompts[type] || prompts.bullet;

  try {
    const text = await callGeminiWithFallback(`${prompt}\n\nContent:\n${content}`, 'You are an expert resume writer. Return only the improved content, no explanations.');
    return text || content;
    
  } catch (err) {
    console.error('Gemini improve error:', err.message);
    throw new Error(`AI improvement failed: ${err.message}`);
  }
}

/**
 * Calculate ATS strength score (0-100)
 */
function calculateStrengthScore(resumeData) {
  let score = 0;
  const { personal, education, experience, projects, skills, certifications } = resumeData;

  if (personal?.name) score += 10;
  if (personal?.email) score += 10;
  if (personal?.phone) score += 5;
  if (personal?.location) score += 5;
  if (personal?.summary && personal.summary.length > 50) score += 15;
  if (personal?.links) score += 5;

  if (education?.length > 0) score += 10;
  if (experience?.length > 0) score += 15;
  if (experience?.length > 1) score += 5;

  if (projects?.length > 0) score += 10;
  if (projects?.length > 2) score += 5;

  const skillCount = Array.isArray(skills) ? skills.length : 0;
  if (skillCount >= 5) score += 10;
  if (skillCount >= 10) score += 5;

  if (certifications?.length > 0) score += 5;

  return Math.min(score, 100);
}

module.exports = { generateFullResume, improveContent };
