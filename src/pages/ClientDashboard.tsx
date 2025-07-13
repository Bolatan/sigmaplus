import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Heatmap from '../components/dashboard/Heatmap';
import Scorecard from '../components/dashboard/Scorecard';
import Annotations from '../components/dashboard/Annotations';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ClientDashboard: React.FC = () => {
  const [annotations, setAnnotations] = useState([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [chartType, setChartType] = useState('bar');
  const [region, setRegion] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [demographics, setDemographics] = useState('all');
  const [outletType, setOutletType] = useState('all');

  useEffect(() => {
    const fetchSurveys = async () => {
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

    if (user) {
      fetchSurveys();
    }
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
  }, [surveys, region, timePeriod, demographics, outletType]);

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

  const [dashboardItems, setDashboardItems] = useState(['surveys', 'chart']);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(dashboardItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardItems(items);
  };

  const brandStyles = {
    primaryColor: user?.branding?.primaryColor || '#000000',
    secondaryColor: user?.branding?.secondaryColor || '#FFFFFF',
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="dashboard">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6" style={{ backgroundColor: brandStyles.secondaryColor, color: brandStyles.primaryColor }}>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{user?.branding?.logoUrl ? <img src={user.branding.logoUrl} alt="Client Logo" className="h-10" /> : 'Client Dashboard'}</h1>
              <p>Welcome to your dedicated client portal.</p>
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('filters', JSON.stringify({ region, timePeriod, demographics, outletType }));
                  navigator.clipboard.writeText(url.toString());
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Share
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="region" className="block text-sm font-medium">Region</label>
                <select id="region" name="region" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All</option>
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                </select>
              </div>
              <div>
                <label htmlFor="timePeriod" className="block text-sm font-medium">Time Period</label>
                <select id="timePeriod" name="timePeriod" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All Time</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div>
                <label htmlFor="demographics" className="block text-sm font-medium">Demographics</label>
                <select id="demographics" name="demographics" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All</option>
                  <option>Age</option>
                  <option>Gender</option>
                  <option>Occupation</option>
                  <option>Income</option>
                </select>
              </div>
              <div>
                <label htmlFor="outletType" className="block text-sm font-medium">Outlet Type</label>
                <select id="outletType" name="outletType" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>All</option>
                  <option>Retail</option>
                  <option>Food Service</option>
                  <option>Other</option>
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
                            <option value="heatmap">Heatmap</option>
                            <option value="scorecard">Scorecard</option>
                          </select>
                        </div>
                        <div className="mt-4">
                          {chartType === 'bar' && (
                            <Bar
                              data={{
                                labels: surveys.map((s) => s.title),
                                datasets: [
                                  {
                                    label: 'Number of Responses',
                                    data: surveys.map((s) => s.responseCount),
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                  },
                                ],
                              }}
                            />
                          )}
                          {chartType === 'pie' && (
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
                          {chartType === 'heatmap' && (
                            <Heatmap
                              data={{
                                labels: surveys.map((s) => s.title),
                                datasets: [
                                  {
                                    label: 'Number of Responses',
                                    data: surveys.map((s) => s.responseCount),
                                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                  },
                                ],
                              }}
                            />
                          )}
                          {chartType === 'scorecard' && (
                            <Scorecard
                              title="Total Responses"
                              value={surveys.reduce((acc, s) => acc + s.responseCount, 0).toString()}
                            />
                          )}
                        </div>
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
      <Annotations
        annotations={annotations}
        onAddAnnotation={(text, x, y) => {
          setAnnotations([...annotations, { id: Date.now().toString(), text, x, y }]);
        }}
      />
    </DragDropContext>
  );
};

export default ClientDashboard;
