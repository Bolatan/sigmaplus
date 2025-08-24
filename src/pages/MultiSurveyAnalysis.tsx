import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import SurveyGroupManager from '../components/surveys/SurveyGroupManager';

interface SurveyGroup {
  _id: string;
  name: string;
}

interface AggregatedData {
  [questionId: string]: {
    text: string;
    type: string;
    responses: {
      [answer: string]: number;
    };
  };
}

const MultiSurveyAnalysis: React.FC = () => {
  const [surveyGroups, setSurveyGroups] = useState<SurveyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const api = useApi();

  useEffect(() => {
    const fetchSurveyGroups = async () => {
      try {
        const data = await api('/survey-groups');
        setSurveyGroups(data);
      } catch (error) {
        console.error('Failed to fetch survey groups:', error);
      }
    };
    fetchSurveyGroups();
  }, [api]);

  const handleFetchAnalysis = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const data = await api(`/multi-survey-analysis?survey_group_id=${selectedGroup}`);
      setAnalysisData(data.data);
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Multi-Survey Analysis</h1>
        <div className="flex items-center mb-4">
          <select
            value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select a Survey Group</option>
          {surveyGroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleFetchAnalysis}
          disabled={!selectedGroup || loading}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      {analysisData && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
          <div className="space-y-4">
            {Object.entries(analysisData).map(([questionId, data]) => (
              <div key={questionId} className="p-4 border rounded">
                <h3 className="font-bold">{data.text}</h3>
                <p className="text-sm text-gray-500">Type: {data.type}</p>
                <table className="w-full mt-2 text-left">
                  <thead>
                    <tr>
                      <th className="p-2 border-b">Answer</th>
                      <th className="p-2 border-b">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.responses).map(([answer, count]) => (
                      <tr key={answer}>
                        <td className="p-2 border-b">{answer}</td>
                        <td className="p-2 border-b">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
      <hr />
      <SurveyGroupManager />
    </div>
  );
};

export default MultiSurveyAnalysis;
