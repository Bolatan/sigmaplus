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
        break;
      }
      case 'xlsx': {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 30 },
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
        ];

        worksheet.addRow({id: report._id, title: report.title, description: report.description});

        const buffer = await workbook.xlsx.writeBuffer();
        const sanitizedTitle = sanitizeFilename(report.title);
        res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        break;
      }
      case 'pdf': {
        try {
          console.log('Generating PDF report');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          page.drawText(survey.title || 'No Title', { x: 50, y: 800, size: 25 });

          if (report.sections && Array.isArray(report.sections)) {
            console.log('--- SECTIONS ---');
            console.log(JSON.stringify(report.sections, null, 2));
            console.log('--- END SECTIONS ---');
            report.sections.forEach((section, index) => {
              const currentPage = index === 0 ? page : pdfDoc.addPage();
              currentPage.drawText(section.title || 'No Section Title', { x: 50, y: 800, size: 20 });
              if (section.content) {
                currentPage.drawText(String(section.content), { x: 50, y: 750, size: 12 });
              }
            });
          }

          const pdfBytes = await pdfDoc.save();

          const sanitizedTitle = sanitizeFilename(report.title);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.pdf`);
          res.send(Buffer.from(pdfBytes));
          console.log('PDF report sent');
        } catch (e) {
          console.error('Error generating pdf file:', e);
          res.status(500).json({ error: 'Failed to generate pdf report' });
        }
        break;
      }
      default:
        console.error('Invalid format specified');
        return res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (err) {
    console.error(`Failed to download report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to download report' });
  }
};


// @desc    Update a report's metadata (e.g., title, sections)
// @route   PUT /api/reports/:id
// @access  Private (Admin, Agent)
export const updateReport = async (req, res) => {


  try {
    const db = getDb();
    const { id } = req.params;
    const { title, sections } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const updateDoc = {
      $set: {
        ...(title && { title }),
        ...(sections && { sections }),
        updatedAt: new Date(),
      },
    };

    const result = await db.collection('reports').updateOne({ _id: new ObjectId(id) }, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });

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
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
export const deleteReport = async (req, res) => {

  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const result = await db.collection('reports').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error(`Failed to delete report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

export const generateAllReports = async () => {
  console.log('Generating all reports...');
  // This is a placeholder for the actual report generation logic
};

