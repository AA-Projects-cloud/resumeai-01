const ai = require('../config/gemini');

const GEMINI_MODEL = 'gemini-1.5-flash';

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

  const toneInstructions = {
    professional: 'Use formal, polished, professional language. Emphasize achievements and responsibilities clearly.',
    simple: 'Use clear, easy-to-read language. Keep sentences short and direct.',
    impact: 'Use powerful action verbs and quantify impact wherever possible. Make every bullet point results-driven.',
  };

  const typeInstructions = {
    fresher: 'Focus on education, academic achievements, projects, internships (if any), and technical skills. Keep it concise and impactful.',
    developer: 'Emphasize technical skills, programming languages, frameworks, projects, and development experience with measurable outcomes.',
    internship: 'Highlight academic performance, relevant coursework, projects, certifications, and eagerness to learn.',
    experienced: 'Prioritize work experience, achievements, leadership, and measurable impact. Show clear career progression.',
  };

  const systemInstructions = `
You are an expert ATS-optimized resume writer and professional document formatter.

Your task is to generate a clean, modern, and highly professional resume in plain text format with PERFECT alignment and structure similar to top-tier resumes.

STRICT FORMATTING RULES:

1. Output ONLY resume content — no explanations, no extra text.
2. Start DIRECTLY with:
   FULL NAME (CENTER-ALIGNED STYLE USING SPACING)
   Professional Title
   Contact Information (single line)

3. Use consistent spacing and alignment to mimic a professionally designed resume.

4. Section formatting:
   - Use ALL CAPS for section titles
   - Add a horizontal divider using:
     --------------------------------------------------
   - Maintain equal spacing before and after each section

5. Use bullet points:
   • Start each bullet with strong action verbs
   • Keep points concise (1–2 lines max)
   • Include measurable achievements (%, numbers, impact)

6. Maintain clean hierarchy:
   Job Title
   Company Name, Location                          Dates (right-aligned style)
   
7. Ensure proper alignment using spacing (IMPORTANT):
   - Dates should appear visually right-aligned
   - Sections must look balanced and symmetrical
   - Avoid uneven spacing

8. Resume structure (follow strictly):
   - Name + Contact
   - PROFESSIONAL SUMMARY
   - WORK EXPERIENCE
   - EDUCATION
   - SKILLS
   - CERTIFICATIONS (if applicable)
   - PROJECTS (if applicable)

9. Writing guidelines:
   - Use industry keywords for ATS optimization
   - Avoid paragraphs longer than 3 lines
   - Use professional, concise language
   - No personal pronouns (I, me, my)

10. DO NOT include:
   - Any markdown (**, #, etc.)
   - Any HTML
   - Emojis or symbols except bullet (•)
   - Explanations or notes

11. Ensure the resume fits within 1–1.5 pages when printed.

12. The final output must look like a real professionally formatted resume when pasted into Word or PDF.

IMPORTANT:
The resume must visually resemble a clean, structured format like a corporate-level resume with proper alignment and spacing — NOT just plain text blocks.
`;

  const userPrompt = `Please generate a complete, ATS-optimized resume using the following information:

${context}

CRITICAL: Provide ONLY the resume text. No introductory or concluding remarks.`;

  try {
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: systemInstructions });
    const response = await model.generateContent(userPrompt);
    const result = await response.response;
    let text = result.text();
    
    // Clean the response from any leftover conversational filler
    text = cleanAiResponse(text);

    // Calculate a basic strength score based on sections filled
    const strengthScore = calculateStrengthScore(resumeData);

    return { text, strengthScore };
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
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: 'You are an expert resume writer. Return only the improved content, no explanations.' });
    const response = await model.generateContent(`${prompt}\n\nContent:\n${content}`);
    const result = await response.response;
    return result.text() || content;
    
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
