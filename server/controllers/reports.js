// Fixed PDF generation in downloadReport function
case 'pdf': {
  try {
    console.log('Generating PDF report');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add first page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Draw title
    const title = survey?.title || 'Survey Report';
    page.drawText(title, { 
      x: 50, 
      y: height - 50, 
      size: 25,
      font: font,
      color: rgb(0, 0, 0)
    });

    if (report.sections && Array.isArray(report.sections)) {
      console.log('--- SECTIONS ---');
      console.log(JSON.stringify(report.sections, null, 2));
      console.log('--- END SECTIONS ---');
      
      let currentY = height - 100; // Start below title
      let currentPage = page;
      
      report.sections.forEach((section, index) => {
        // Check if we need a new page
        if (currentY < 100) {
          currentPage = pdfDoc.addPage();
          currentY = height - 50;
        }
        
        // Draw section title
        const sectionTitle = section.title || `Section ${index + 1}`;
        currentPage.drawText(sectionTitle, { 
          x: 50, 
          y: currentY, 
          size: 20,
          font: font,
          color: rgb(0, 0, 0)
        });
        
        currentY -= 40; // Move down for content
        
        // Draw section content
        if (section.content) {
          const content = String(section.content);
          const maxWidth = width - 100; // Leave margins
          const lines = wrapText(content, maxWidth, font, 12);
          
          lines.forEach(line => {
            if (currentY < 50) {
              currentPage = pdfDoc.addPage();
              currentY = height - 50;
            }
            
            currentPage.drawText(line, { 
              x: 50, 
              y: currentY, 
              size: 12,
              font: font,
              color: rgb(0, 0, 0)
            });
            
            currentY -= 20; // Line spacing
          });
        }
        
        currentY -= 20; // Extra spacing between sections
      });
    }

    const pdfBytes = await pdfDoc.save();
    const sanitizedTitle = sanitizeFilename(report.title);
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send as proper buffer
    res.end(Buffer.from(pdfBytes));
    console.log('PDF report sent successfully');
    
  } catch (err) {
    console.error('Error creating/saving pdf document:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Failed to create pdf document', details: err.message });
  }
  break;
}

// Helper function to wrap text for PDF
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
