import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FileText, Download, AlertTriangle, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { Report as ReportType, Section } from '../types';
import useApi from '../hooks/useApi';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<ReportType | null>(null);
  const [newReport, setNewReport] = useState<{
    title: string;
    description: string;
    surveyId: string;
    sections: Section[];
  }>({
    title: '',
    description: '',
    surveyId: '',
    sections: [],
  });
  const [availableSurveys, setAvailableSurveys] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(false);

  const { user } = useAuth();
  const apiFetch = useApi();
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (isAddModalOpen) {
      fetchAvailableSurveys();
    }
  }, [isAddModalOpen]);

  const fetchAvailableSurveys = async () => {
    setIsLoadingSurveys(true);
    try {
      const data = await apiFetch('/surveys');
      setAvailableSurveys((data.data || data || []).map((s: any) => ({ id: s._id || s.id, title: s.title })));
    } catch (error) {
      console.error("Error fetching available surveys:", error);
      // Optionally set an error state for the modal
    } finally {
      setIsLoadingSurveys(false);
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await apiFetch('/reports');
      const fetchedReports = (data.data || data || []).map((r: any) => ({
        ...r,
        id: r._id,
      }));
      setReports(fetchedReports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setApiError(error.message || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!newReport.title || !newReport.description || !newReport.surveyId) {
      setApiError("Title, description, and survey selection are required.");
      return;
    }

    const reportPayload = {
      title: newReport.title,
      description: newReport.description,
      surveyId: newReport.surveyId,
      companyId: user?.companyId,
      sections: newReport.sections,
    };

    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(reportPayload),
      });

      setIsAddModalOpen(false);
      setNewReport({
        title: '',
        description: '',
        surveyId: '',
        sections: [],
      });

      await fetchReports();

    } catch (error: any) {
      console.error('Error generating report:', error);
      setApiError(error.message || 'Failed to generate report. Please try again.');
    }
  };

  const handleSectionChange = (sectionIndex: number, subSectionIndex: number, value: string) => {
    const newSections = [...newReport.sections];
    const newSubSections = [...newSections[sectionIndex].content];
    newSubSections[subSectionIndex] = { ...newSubSections[subSectionIndex], content: value };
    newSections[sectionIndex] = { ...newSections[sectionIndex], content: newSubSections };
    setNewReport({ ...newReport, sections: newSections });
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (report: ReportType) => {
    setSelectedReportForDetail(report);
    setIsDetailModalOpen(true);
  };

  const handleDownloadReport = async (report: ReportType, format: 'pdf' | 'pptx' | 'xlsx') => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError('Authentication required to download reports.');
      return;
    }

    try {
      const response = await fetch(`/api/reports/${report.id}/download?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report.');
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      const fileName = `${report.title.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 50) || 'report'}.${format}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while downloading the report.');
    }
  };

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
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold mr-1">API Error!</strong>
          <span className="block sm:inline">{apiError}</span>
          <AlertTriangle className="inline ml-2 h-5 w-5" />
        </div>
      )}
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
                  <p className="text-sm text-gray-500">
                    {report.description}
                  </p>
                   <p className="text-xs text-gray-400 mt-1">
                    Survey: {report.surveyName || report.surveyId}
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadReport(report, 'pdf')}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadReport(report, 'pptx')}
                  >
                    Download PPTX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadReport(report, 'xlsx')}
                  >
                    Download XLSX
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(report)}
                >
                  View Details
                </Button>
                <Link to={`/reports/${report.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Edit Report
                  </Button>
                </Link>
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
        <div>
          <label htmlFor="surveySelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Survey
          </label>
          <select
            id="surveySelect"
            value={newReport.surveyId}
            onChange={(e) => setNewReport({ ...newReport, surveyId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            required
            disabled={isLoadingSurveys}
          >
            <option value="" disabled>
              {isLoadingSurveys ? 'Loading surveys...' : 'Select a survey'}
            </option>
            {availableSurveys.map(survey => (
              <option key={survey.id} value={survey.id}>
                {survey.title}
              </option>
            ))}
          </select>
          {availableSurveys.length === 0 && !isLoadingSurveys && (
            <p className="text-xs text-gray-500 mt-1">No surveys available or failed to load.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">Report Sections</h2>
          <div className="mt-4 space-y-4">
            {newReport.sections.map((section, sectionIndex) => (
              <div key={section.id} className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <div className="mt-4 space-y-4">
                  {Array.isArray(section.content) && section.content.map((subSection, subSectionIndex) => (
                    <div key={subSection.title} className="p-4 border rounded-md">
                      <h4 className="text-md font-medium">{subSection.title}</h4>
                      <textarea
                        value={subSection.content}
                        onChange={(e) => handleSectionChange(sectionIndex, subSectionIndex, e.target.value)}
                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        rows={4}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {selectedReportForDetail && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReportForDetail(null);
          }}
          title="Report Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedReportForDetail.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedReportForDetail.description}</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Survey</dt>
                  <dd className="text-sm text-gray-900 mt-1">{selectedReportForDetail.surveyName || selectedReportForDetail.surveyId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReportForDetail.status)}`}>
                      {selectedReportForDetail.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="text-sm text-gray-900 mt-1">{formatDate(selectedReportForDetail.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900 mt-1">{formatDate(selectedReportForDetail.updatedAt)}</dd>
                </div>
                {selectedReportForDetail.companyId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company ID</dt>
                    <dd className="text-sm text-gray-900 mt-1">{selectedReportForDetail.companyId}</dd>
                  </div>
                )}
                {selectedReportForDetail.sections && selectedReportForDetail.sections.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sections</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      <ul>
                        {selectedReportForDetail.sections.map((section, index) => (
                          <li key={index}>{section.title}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedReportForDetail(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

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