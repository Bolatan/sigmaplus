import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

interface Report {
  id: string;
  title: string;
  description: string;
  surveyId: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    surveyId: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch reports';
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      const mockReport: Report = {
        id: Date.now().toString(),
        ...newReport,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setReports([...reports, mockReport]);
      setIsAddModalOpen(false);
      setNewReport({
        title: '',
        description: '',
        surveyId: '',
      });
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Generate Report
          </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Button
          variant="outline"
          leftIcon={<Filter className="h-5 w-5" />}
        >
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {report.description}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <FileText className="h-4 w-4 mr-1" />
                <span>Created {formatDate(report.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Generate New Report"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <Input
            label="Report Title"
            value={newReport.title}
            onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newReport.description}
              onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              rows={4}
              required
            />
          </div>
          <Input
            label="Survey ID"
            value={newReport.surveyId}
            onChange={(e) => setNewReport({ ...newReport, surveyId: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Generate Report
            </Button>
          </div>
        </form>
      </Modal>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Generate your first report to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;