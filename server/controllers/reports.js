// Fixed downloadReport function for your controllers/reports.js file

export const downloadReport = async (req, res) => {
  console.log('Download report request received');
  try {
    const db = getDb();
    const { id } = req.params;
    const { format } = req.query; // pptx, xlsx, pdf

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Access control
    if (req.user.role === 'client' && (!report.companyId || report.companyId.toString() !== req.user.companyId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(report.surveyId) });
    const responses = await db.collection('responses').find({ surveyId: new ObjectId(report.surveyId) }).toArray();
    const client = report.clientId ? await db.collection('users').findOne({ _id: new ObjectId(report.clientId) }) : null;

    console.log('--- REPORT DATA ---');
    console.log(JSON.stringify(report, null, 2));
    console.log('--- END REPORT DATA ---');

    switch (format) {
      case 'pptx': {
        try {
          console.log('Generating PPTX report');
          const presentation = new Presentation({ sections: report.sections || [] });
          const pptx = presentation.generate();
          const buffer = await pptx.write();
          
          // Set headers before sending
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
          res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pptx"`);
          res.setHeader('Content-Length', buffer.length);
          
          res.send(buffer);
          console.log('PPTX report sent');
        } catch (e) {
          console.error('Error generating pptx file:', e);
          res.status(500).json({ error: 'Failed to generate pptx report' });
        }
        break;
      }
      
      case 'xlsx': {
        try {
          console.log('Generating XLSX report');
          const workbook = new Excel.Workbook();
          const worksheet = workbook.addWorksheet('Report');

          worksheet.columns = [
            { header: 'ID', key: 'id', width: 30 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
          ];

          worksheet.addRow({
            id: report._id,
            title: report.title,
            description: report.description
          });

          const buffer = await workbook.xlsx.writeBuffer();
          
          // Set headers before sending
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${report.title}.xlsx"`);
          res.setHeader('Content-Length', buffer.length);
          
          res.send(buffer);
          console.log('XLSX report sent');
        } catch (e) {
          console.error('Error generating xlsx file:', e);
          res.status(500).json({ error: 'Failed to generate xlsx report' });
        }
        break;
      }
      
      case 'pdf': {
        try {
          console.log('Generating PDF report');
          
          // Create PDF document
          const doc = new PDFDocument();
          const buffers = [];
          
          // Collect PDF data in memory instead of writing to file
          doc.on('data', (chunk) => {
            buffers.push(chunk);
          });
          
          doc.on('end', () => {
            // Combine all chunks into a single buffer
            const pdfBuffer = Buffer.concat(buffers);
            
            // Set headers before sending
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            
            // Send the PDF buffer
            res.send(pdfBuffer);
            console.log(`PDF report sent (${pdfBuffer.length} bytes)`);
          });
          
          doc.on('error', (err) => {
            console.error('PDF generation error:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Failed to generate PDF report' });
            }
          });

          // Add content to PDF
          doc.fontSize(25).text(survey?.title || 'No Title', 50, 50);

          if (report.sections && Array.isArray(report.sections)) {
            report.sections.forEach((section, index) => {
              if (index > 0) doc.addPage(); // Add page for each section except first
              doc.fontSize(20).text(section.title || 'No Section Title', 50, 50);
              if (section.content) {
                doc.fontSize(12).text(String(section.content), 50, 100, {
                  width: 500,
                  align: 'left'
                });
              }
            });
          }

          // Finalize the PDF
          doc.end();
          
        } catch (e) {
          console.error('Error generating pdf file:', e);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate pdf report' });
          }
        }
        break;
      }
      
      default:
        return res.status(400).json({ error: 'Invalid format specified. Supported formats: pdf, pptx, xlsx' });
    }
  } catch (err) {
    console.error(`Failed to download report ${req.params.id}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download report' });
    }
  }
};

// Added deleteReport function
export const deleteReport = async (req, res) => {
  console.log('Delete report request received');
  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    // First, check if the report exists
    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Access control - ensure user can only delete their own reports
    if (req.user.role === 'client' && (!report.companyId || report.companyId.toString() !== req.user.companyId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the report
    const result = await db.collection('reports').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Report not found or already deleted' });
    }

    console.log(`Report ${id} deleted successfully`);
    res.status(200).json({ 
      message: 'Report deleted successfully',
      id: id 
    });

  } catch (err) {
    console.error(`Failed to delete report ${req.params.id}:`, err);
    res.status(500).json({ 
      error: 'Failed to delete report',
      details: err.message 
    });
  }
};
