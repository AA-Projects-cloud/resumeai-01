const geminiService = require('../services/geminiService');

async function generateResume(req, res, next) {
  try {
    const { resumeData, resumeType, tone, jobRole } = req.body;

    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    const result = await geminiService.generateFullResume({
      resumeData,
      resumeType: resumeType || 'fresher',
      tone: tone || 'professional',
      jobRole: jobRole || '',
    });

    res.json({ generatedText: result.text, strengthScore: result.strengthScore });
  } catch (err) {
    next(err);
  }
}

async function improveContent(req, res, next) {
  try {
    const { content, type, tone } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: 'content and type are required' });
    }

    const improved = await geminiService.improveContent({ content, type, tone });
    res.json({ improved });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateResume, improveContent };
