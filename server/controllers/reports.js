case 'pdf': {
  console.log('Generating PDF report');
  
  // Add null checks and validation
  if (!survey) {
    console.error('Survey not found for PDF generation');
    return res.status(404).json({ error: 'Survey not found' });
  }
  
  if (!report) {
    console.error('Report not found for PDF generation');
    return res.status(404).json({ error: 'Report not found' });
  }
  
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    
    // Safe access to survey title with fallback
    const surveyTitle = survey?.title || report?.title || 'Untitled Survey';
    page.drawText(surveyTitle, { x: 50, y: 800, size: 25 });

    if (report.sections && Array.isArray(report.sections)) {
      console.log('--- SECTIONS ---');
      console.log(JSON.stringify(report.sections, null, 2));
      console.log('--- END SECTIONS ---');
      
      report.sections.forEach((section, index) => {
        const currentPage = index === 0 ? page : pdfDoc.addPage();
        
        // Safe access to section title with fallback
        const sectionTitle = section?.title || `Section ${index + 1}`;
        currentPage.drawText(sectionTitle, { x: 50, y: 800, size: 20 });
        
        if (section?.content) {
          currentPage.drawText(String(section.content), { x: 50, y: 750, size: 12 });
        }
      });
    }

    const pdfBytes = await pdfDoc.save();
    const sanitizedTitle = sanitizeFilename(report?.title || 'report');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.pdf`);
    res.send(Buffer.from(pdfBytes));
    console.log('PDF report sent');
    
  } catch (err) {
    console.error('Error creating pdf document:', err);
    res.status(500).json({ error: 'Failed to create pdf document' });
  }
  break;
}
