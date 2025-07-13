import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { SurveyDetailModal } from '../../components/dashboard/SurveyDetailModal';
import { ShareModal } from '../../components/dashboard/ShareModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ClientDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [chartType, setChartType] = useState('bar');
  const [region, setRegion] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleBarClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const { index } = elements[0];
      setSelectedSurvey(filteredSurveys[index]);
    }
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/surveys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch surveys.');
        }
        const { data } = await response.json();
        setSurveys(data || []);
        setFilteredSurveys(data || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching surveys.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();
  }, [user]);

  useEffect(() => {
    let newFilteredSurveys = [...surveys];

    if (region !== 'all') {
      // This is a placeholder for region filtering.
      // In a real application, you would filter based on the survey's location data.
    }

    if (timePeriod !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (timePeriod === '30days') {
        startDate.setDate(now.getDate() - 30);
      } else if (timePeriod === '90days') {
        startDate.setDate(now.getDate() - 90);
      } else if (timePeriod === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      newFilteredSurveys = newFilteredSurveys.filter(s => new Date(s.createdAt) >= startDate);
    }

    setFilteredSurveys(newFilteredSurveys);
  }, [surveys, region, timePeriod]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const [isEditingHeaders, setIsEditingHeaders] = useState(false);
  const [headers, setHeaders] = useState({
    title: 'Title',
    status: 'Status',
    responses: 'Responses',
  });

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeaders((prev) => ({ ...prev, [name]: value }));
  };

  const saveHeaders = async () => {
    // In a real application, you would save the headers to the database.
    // For this example, we'll just log them to the console.
    console.log('Saving headers:', headers);
    setIsEditingHeaders(false);
  };

  const [dashboardItems, setDashboardItems] = useState(['surveys', 'chart', 'annotations']);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(dashboardItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardItems(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="dashboard">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/client-dashboard?id=${user?.companyId}`;
                  setShareUrl(url);
                  setIsShareModalOpen(true);
                }}
              >
                Share
              </Button>
            </div>
            <p>Welcome to your dedicated client portal.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
                <select id="region" name="region" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All</option>
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                </select>
              </div>
              <div>
                <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700">Time Period</label>
                <select id="timePeriod" name="timePeriod" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All Time</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>
            {dashboardItems.map((item, index) => (
              <Draggable key={item} draggableId={item} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {item === 'surveys' && (
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Your Surveys</h2>
                          {isEditingHeaders ? (
                            <button onClick={saveHeaders} className="bg-blue-500 text-white px-4 py-2 rounded">Save Headers</button>
                          ) : (
                            <button onClick={() => setIsEditingHeaders(true)} className="bg-gray-200 px-4 py-2 rounded">Edit Headers</button>
                          )}
                        </div>
                        {surveys.length === 0 ? (
                          <p>You do not have any surveys yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isEditingHeaders ? <input type="text" name="title" value={headers.title} onChange={handleHeaderChange} className="w-full" /> : headers.title}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isEditingHeaders ? <input type="text" name="status" value={headers.status} onChange={handleHeaderChange} className="w-full" /> : headers.status}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {isEditingHeaders ? <input type="text" name="responses" value={headers.responses} onChange={handleHeaderChange} className="w-full" /> : headers.responses}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {surveys.map((survey) => (
                                  <tr key={survey.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{survey.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{survey.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{survey.responseCount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                    {item === 'chart' && (
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold">Survey Responses</h2>
                        <div className="mt-4">
                          <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          >
                            <option value="bar">Bar Chart</option>
                            <option value="pie">Pie Chart</option>
                          </select>
                        </div>
                        <div className="mt-4">
                          {chartType === 'bar' ? (
                            <Bar
                              data={{
                labels: filteredSurveys.map((s) => s.title),
                                datasets: [
                                  {
                                    label: 'Number of Responses',
                    data: filteredSurveys.map((s) => s.responseCount),
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                  },
                                ],
                              }}
              options={{
                onClick: handleBarClick,
              }}
                            />
                          ) : (
                            <Pie
                              data={{
                                labels: surveys.map((s) => s.title),
                                datasets: [
                                  {
                                    data: surveys.map((s) => s.responseCount),
                                    backgroundColor: [
                                      'rgba(255, 99, 132, 0.6)',
                                      'rgba(54, 162, 235, 0.6)',
                                      'rgba(255, 206, 86, 0.6)',
                                      'rgba(75, 192, 192, 0.6)',
                                      'rgba(153, 102, 255, 0.6)',
                                      'rgba(255, 159, 64, 0.6)',
                                    ],
                                  },
                                ],
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    {item === 'annotations' && (
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold">Annotations</h2>
                        <textarea
                          className="w-full h-32 p-2 border rounded"
                          placeholder="Add your annotations here..."
                        ></textarea>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <SurveyDetailModal
        isOpen={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        survey={selectedSurvey}
      />
    </DragDropContext>
  );
};

export default ClientDashboard;
