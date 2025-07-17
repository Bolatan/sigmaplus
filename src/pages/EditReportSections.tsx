import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Report as ReportType, Chart } from '../types/report';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ReportingService } from '../services/ReportingService';
import { Bar, Pie } from 'react-chartjs-2';

const EditReportSections: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError('Report ID not found in URL.');
        setIsLoading(false);
        return;
      }
      try {
        const fetchedReport = await ReportingService.getById(id);
        if (fetchedReport) {
          setReport(fetchedReport);
        } else {
          setError('Report not found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const addChart = (type: Chart['type']) => {
    if (report) {
      const newSections = JSON.parse(JSON.stringify(report.sections));
      newSections[sectionIndex].content[subSectionIndex].content = value;
      setReport({ ...report, sections: newSections });

  };

  const handleSaveChanges = async () => {
    if (report) {
      try {
        await ReportingService.update(report.id, report);
        alert('Changes saved successfully!');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Edit Report Sections for "{report?.title}"</h1>
      <div className="mt-4 space-y-4">
        {report?.charts.map((chart, chartIndex) => (
          <div key={chart.id} className="p-4 border rounded-md">
            <h2 className="text-xl font-semibold">Chart {chartIndex + 1}</h2>
            <div>
              {chart.type === 'bar' && <Bar data={chart.data} />}
              {chart.type === 'pie' && <Pie data={chart.data} />}
              {chart.type === 'line' && <p>Line chart not implemented yet</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <Button variant="primary" onClick={() => addChart('bar')}>
          Add Bar Chart
        </Button>
        <Button variant="primary" onClick={() => addChart('pie')}>
          Add Pie Chart
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditReportSections;
