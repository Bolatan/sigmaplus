import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Report as ReportType, Section } from '../types';
import { Button } from '../components/ui/Button';
import useApi from '../hooks/useApi';

const EditReportSections: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiFetch = useApi();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiFetch(`/reports/${id}`);
        setReport(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, apiFetch]);

  const handleSectionChange = (sectionIndex: number, subSectionIndex: number, value: string) => {
    if (report) {
      const newSections = JSON.parse(JSON.stringify(report.sections));
      // newSections[sectionIndex].content[subSectionIndex].content = value;
      // setReport({ ...report, sections: newSections });

    }
  };

  const handleSaveChanges = async () => {
    if (report) {
      try {
        await apiFetch(`/reports/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ sections: report.sections }),
        });
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
        {report?.sections.map((section, sectionIndex) => (
          <div key={section.id} className="p-4 border rounded-md">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="mt-4 space-y-4">
              {Array.isArray(section.content) && section.content.map((subSection, subSectionIndex) => (
                <div key={subSection.title} className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium">{subSection.title}</h3>
                  {subSection.chart ? (
                    <img src={`data:image/png;base64,${subSection.chart}`} alt={subSection.title} />
                  ) : (
                    <textarea
                      value={subSection.content}
                      onChange={(e) => handleSectionChange(sectionIndex, subSectionIndex, e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditReportSections;
