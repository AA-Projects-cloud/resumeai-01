const exportService = require('../services/exportService');

async function exportPdf(req, res, next) {
  try {
    const { resumeData, generatedText } = req.body;
    if (!generatedText && !resumeData) {
      return res.status(400).json({ error: 'Resume data or generated text is required' });
    }

    const pdfBuffer = await exportService.generatePdf(resumeData, generatedText);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

async function exportDocx(req, res, next) {
  try {
    const { resumeData, generatedText } = req.body;
    if (!resumeData && !generatedText) {
      return res.status(400).json({ error: 'Resume data or generated text is required' });
    }

    const docxBuffer = await exportService.generateDocx(resumeData, generatedText);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
    res.send(docxBuffer);
  } catch (err) {
    next(err);
  }
}

async function exportTxt(req, res, next) {
  try {
    const { resumeData, generatedText } = req.body;
    if (!resumeData && !generatedText) {
      return res.status(400).json({ error: 'Resume data or generated text is required' });
    }

    const text = exportService.generateTxt(resumeData, generatedText);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.txt"');
    res.send(text);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportPdf, exportDocx, exportTxt };
