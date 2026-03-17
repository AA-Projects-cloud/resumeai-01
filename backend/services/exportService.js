const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

/**
 * Generate a professionally formatted PDF from resume data
 */
async function generatePdf(resumeData, generatedText) {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = currentPage.getSize();

  // Embed fonts to match reference
  const arialBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const arialRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  let y = height - 50;
  const margin = 50;
  const contentWidth = width - margin * 2;

  const addNewPage = () => {
    currentPage = pdfDoc.addPage([595, 842]);
    y = height - 50;
  };

  const drawText = (text, fontSize, font, color = rgb(0.1, 0.1, 0.1), indent = 0, align = 'left') => {
    const availableWidth = contentWidth - indent;
    const wrapped = wrapText(text, font, fontSize, availableWidth);
    
    wrapped.forEach(line => {
      if (y < 60) {
        addNewPage();
      }
      
      let x = margin + indent;
      if (align === 'center') {
        const textWidth = font.widthOfTextAtSize(line, fontSize);
        x = (width - textWidth) / 2;
      }

      currentPage.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
      y -= fontSize + 5; // Tight line spacing
    });
  };

  const drawSectionLine = () => {
    if (y < 30) addNewPage();
    y -= 4;
    currentPage.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: rgb(0.53, 0.53, 0.53), // Gray #878787
    });
    y -= 10; 
  };

  if (generatedText) {
    const lines = generatedText.split('\n');
    
    // First non-empty line is likely the name
    let nameIdx = lines.findIndex(l => l.trim().length > 0);
    if (nameIdx !== -1) {
      const name = lines[nameIdx].trim();
      drawText(name, 23, arialBold, rgb(0, 0, 0), 0, 'center');
      y -= 8;
      lines[nameIdx] = ''; // Clear so it's not redrawn
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        y -= 5;
        return;
      }

      // Detect headers
      const isHeader = trimmed.startsWith('###') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*'));
      
      if (isHeader) {
        const headerText = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '').replace(/[:]$/, '');
        if (y < 100) addNewPage();
        else y -= 12;

        drawText(headerText, 14, arialBold, rgb(0, 0, 0));
        drawSectionLine();
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const bulletText = trimmed.replace(/^[•\-*]\s*/, '').replace(/\*\*/g, '');
        currentPage.drawText('•', { x: margin + 5, y: y + 1, size: 10, font: arialRegular, color: rgb(0, 0, 0) });
        drawText(bulletText, 10, timesRegular, rgb(0.1, 0.1, 0.1), 18);
      } else {
        // Check if it looks like contact info (contains @ or |)
        const isContact = trimmed.includes('@') || trimmed.includes('|') || trimmed.includes('+91');
        const font = isContact ? timesItalic : timesRegular;
        const size = isContact ? 9 : 10;
        const align = isContact ? 'center' : 'left';
        const color = isContact ? rgb(0.2, 0.4, 0.8) : rgb(0.1, 0.1, 0.1); // Blue for links/contact
        
        drawText(trimmed.replace(/\*\*/g, ''), size, font, color, 0, align);
      }
    });
  } else if (resumeData?.personal) {
    const p = resumeData.personal;
    drawText(p.name || '', 23, arialBold, rgb(0, 0, 0), 0, 'center');
    y -= 4;
    if (p.title) drawText(p.title, 11, arialRegular, rgb(0.2, 0.2, 0.2), 0, 'center');
    const contact = [p.email, p.phone, p.location, p.links].filter(Boolean).join(' | ');
    if (contact) drawText(contact, 9, timesItalic, rgb(0.2, 0.4, 0.8), 0, 'center');
    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Wrap text to fit within a given width
 */
function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    try {
      const w = font.widthOfTextAtSize(test, fontSize);
      if (w > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    } catch {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

/**
 * Generate a DOCX document from resume data
 */
async function generateDocx(resumeData, generatedText) {
  const sections = [];

  if (generatedText) {
    const lines = generatedText.split('\n');
    
    // Name treatment
    let nameIdx = lines.findIndex(l => l.trim().length > 0);
    if (nameIdx !== -1) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: lines[nameIdx].trim(), bold: true, size: 46, font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      }));
      lines[nameIdx] = '';
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isHeader = trimmed.startsWith('###') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('•') && !trimmed.startsWith('-'));
      if (isHeader) {
        const headerText = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '').toUpperCase();
        sections.push(new Paragraph({
          children: [new TextRun({ text: headerText, bold: true, size: 28, font: 'Arial' })],
          spacing: { before: 240, after: 120 },
          border: { bottom: { color: '878787', style: BorderStyle.SINGLE, size: 6 } },
        }));
      } else {
        const isContact = trimmed.includes('@') || trimmed.includes('|') || trimmed.includes('+91');
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
        const cleanText = trimmed.replace(/^[•\-*]\s*/, '').replace(/\*\*/g, '');
        
        sections.push(new Paragraph({
          children: [new TextRun({ 
            text: cleanText, 
            size: isContact ? 18 : 20, 
            font: isContact ? 'Arial' : 'Times New Roman',
            italic: isContact,
            color: isContact ? '1154CC' : '000000'
          })],
          alignment: isContact ? AlignmentType.CENTER : AlignmentType.LEFT,
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 80 },
        }));
      }
    });
  } else if (resumeData?.personal) {
    const p = resumeData.personal;
    sections.push(new Paragraph({
      children: [new TextRun({ text: p.name || '', bold: true, size: 46, font: 'Arial' })],
      alignment: AlignmentType.CENTER,
    }));
    const contact = [p.email, p.phone, p.location, p.links].filter(Boolean).join(' | ');
    if (contact) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: contact, size: 18, font: 'Arial', italic: true, color: '1154CC' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 }
      }));
    }
  }

  const doc = new Document({
    sections: [{ children: sections }],
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20 },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}

/**
 * Generate plain text from resume
 */
function generateTxt(resumeData, generatedText) {
  if (generatedText) return generatedText;

  if (!resumeData) return '';

  const { personal, education, experience, projects, skills, certifications } = resumeData;
  const lines = [];

  if (personal) {
    lines.push((personal.name || '').toUpperCase());
    if (personal.title) lines.push(personal.title);
    const contact = [personal.email, personal.phone, personal.location, personal.links].filter(Boolean).join(' | ');
    if (contact) lines.push(contact);
    lines.push('');
  }

  const section = (title, items, render) => {
    if (!items?.length) return;
    lines.push(title.toUpperCase());
    lines.push('-'.repeat(40));
    items.forEach(item => render(item));
    lines.push('');
  };

  section('Education', education, e => {
    lines.push(`${e.degree} | ${e.institute}`);
    if (e.year || e.score) lines.push([e.year, e.score].filter(Boolean).join(' • '));
  });

  section('Experience', experience, ex => {
    lines.push(`${ex.role} | ${ex.company}`);
    if (ex.duration) lines.push(ex.duration);
    if (ex.description) lines.push(`• ${ex.description}`);
  });

  section('Projects', projects, p => {
    lines.push(`${p.title}${p.tech ? ' | ' + p.tech : ''}`);
    if (p.description) lines.push(`• ${p.description}`);
  });

  if (skills?.length) {
    lines.push('SKILLS');
    lines.push('-'.repeat(40));
    lines.push(Array.isArray(skills) ? skills.join(', ') : skills);
    lines.push('');
  }

  section('Certifications', certifications, c => {
    lines.push(`• ${c.name}${c.org ? ' | ' + c.org : ''}${c.year ? ' (' + c.year + ')' : ''}`);
  });

  return lines.join('\n');
}

module.exports = { generatePdf, generateDocx, generateTxt };
