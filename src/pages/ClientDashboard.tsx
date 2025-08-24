import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';
import { BarChart3, PieChart, Save } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import Heatmap from '../components/client-dashboard/Heatmap';
import Scorecard from '../components/client-dashboard/Scorecard';
import Annotations from '../components/client-dashboard/Annotations';
import useApi from '../hooks/useApi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ItemTypes = {
  CARD: 'card',
}

const DraggableItem = ({ id, index, moveItem, children }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: { id: string, index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const [annotations, setAnnotations] = useState([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState('bar');
  const [region, setRegion] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [demographics, setDemographics] = useState('all');
  const [outletType, setOutletType] = useState('all');
  const [isEditingHeaders, setIsEditingHeaders] = useState(false);
  const [headers, setHeaders] = useState({
    title: 'Title',
    status: 'Status',
    responses: 'Responses',
  });
  const [dashboardItems, setDashboardItems] = useState(['stats', 'surveys', 'chart']);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const apiFetch = useApi();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Construct query parameters for filtering
        const params = new URLSearchParams();
        if (region !== 'all') params.append('region', region);
        if (timePeriod !== 'all') params.append('timePeriod', timePeriod);
        if (demographics !== 'all') params.append('demographics', demographics);
        if (outletType !== 'all') params.append('outletType', outletType);
        const queryString = params.toString();

        const [surveysResponse, prefsResponse] = await Promise.all([
          apiFetch(`/surveys?${queryString}`),
          apiFetch('/dashboard/preferences')
        ]);

        setSurveys(surveysResponse.data || []);

        if (prefsResponse.data) {
          setDashboardItems(prefsResponse.data.layoutOrder || ['stats', 'surveys', 'chart']);
          setHeaders(prefsResponse.data.customHeaders || { title: 'Title', status: 'Status', responses: 'Responses' });
          setAnnotations(prefsResponse.data.annotations || []);
        }

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, apiFetch, region, timePeriod, demographics, outletType]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeaders((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const preferencesToSave = {
        layoutOrder: dashboardItems,
        customHeaders: headers,
        annotations: annotations,
      };
      await apiFetch('/dashboard/preferences', {
        method: 'POST',
        body: JSON.stringify(preferencesToSave),
      });
      alert('Layout saved successfully!');
    } catch (error) {
      alert('Failed to save layout.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setDashboardItems((prevItems) => {
      const newItems = [...prevItems];
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, removed);
      return newItems;
    });
  }, []);

  const brandStyles = {
    primaryColor: user?.branding?.primaryColor || '#000000',
    secondaryColor: user?.branding?.secondaryColor || '#FFFFFF',
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6" style={{ backgroundColor: brandStyles.secondaryColor, color: brandStyles.primaryColor }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{user?.branding?.logoUrl ? <img src={user.branding.logoUrl} alt="Client Logo" className="h-10" /> : 'Client Dashboard'}</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
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
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="region" className="block text-sm font-medium">Region</label>
            <select id="region" name="region" value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="all">All</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="timePeriod" className="block text-sm font-medium">Time Period</label>
            <select id="timePeriod" name="timePeriod" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="all">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Last Year">Last Year</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="demographics" className="block text-sm font-medium">Demographics</label>
            <select id="demographics" name="demographics" value={demographics} onChange={(e) => setDemographics(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="all">All</option>
              <option value="age">Age</option>
              <option value="gender">Gender</option>
              <option value="occupation">Occupation</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="outletType" className="block text-sm font-medium">Outlet Type</label>
            <select id="outletType" name="outletType" value={outletType} onChange={(e) => setOutletType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
              <option value="all">All</option>
              <option value="Retail">Retail</option>
              <option value="Food Service">Food Service</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        {dashboardItems.map((item, index) => (
          <DraggableItem key={item} id={item} index={index} moveItem={moveItem}>
            {/* The content of draggable items remains the same */}
            {item === 'surveys' && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Surveys</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
            {item === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Surveys" value={surveys.length.toString()} icon={<BarChart3 className="h-6 w-6 text-primary-500" />} />
                <StatCard title="Total Responses" value={surveys.reduce((acc, s) => acc + s.responseCount, 0).toString()} icon={<PieChart className="h-6 w-6 text-secondary-500" />} />
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
          </DraggableItem>
        ))}
      </div>
      <Annotations
        annotations={annotations}
        onAddAnnotation={(text, x, y) => {
          setAnnotations([...annotations, { id: Date.now().toString(), text, x, y }]);
        }}
      />
    </DndProvider>
  );
};

export default ClientDashboard;
