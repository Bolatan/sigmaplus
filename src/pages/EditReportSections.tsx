import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Report as ReportType, Section } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2 } from 'lucide-react';

const EditReportSections: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        const data = await response.json();
        setReport(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleSectionChange = (index: number, field: keyof Section, value: any) => {
    if (report) {
      const newSections = [...report.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      setReport({ ...report, sections: newSections });
    }
  };

  const handleAddSection = () => {
    if (report) {
      const newSection: Section = {
        id: `new-${Date.now()}`,
        title: 'New Section',
        order: report.sections.length + 1,
        content: '',
      };
      setReport({ ...report, sections: [...report.sections, newSection] });
    }
  };

  const handleDeleteSection = (index: number) => {
    if (report) {
      const newSections = [...report.sections];
      newSections.splice(index, 1);
      setReport({ ...report, sections: newSections });
    }
  };

  const handleSaveChanges = async () => {
    if (report) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/reports/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ sections: report.sections }),
        });
        if (!response.ok) {
          throw new Error('Failed to save changes');
        }
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
        {report?.sections.map((section, index) => (
          <div key={section.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <Input
                label="Section Title"
                value={section.title}
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
              />
              <Button variant="danger" size="sm" onClick={() => handleDeleteSection(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              value={section.content.toString()}
              onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={4}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <Button onClick={handleAddSection}>Add Section</Button>
        <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditReportSections;
