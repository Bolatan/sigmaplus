import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

interface Survey {
  _id: string;
  title: string;
}

interface SurveyGroup {
  _id: string;
  name: string;
}

const SurveyGroupManager: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyGroups, setSurveyGroups] = useState<SurveyGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysData, groupsData] = await Promise.all([
          api('/surveys'),
          api('/survey-groups')
        ]);
        setSurveys(surveysData.data);
        setSurveyGroups(groupsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [api]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      const newGroup = await api('/survey-groups', {
        method: 'POST',
        body: JSON.stringify({ name: newGroupName, surveyIds: [] }),
      });
      setSurveyGroups([...surveyGroups, newGroup]);
      setNewGroupName('');
    } catch (error) {
      console.error('Failed to create survey group:', error);
    }
  };

  const handleAddSurveyToGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey || !selectedGroup) return;
    try {
      // This is not ideal, we should have a dedicated endpoint for this
      // For now, we fetch the group, add the survey, and then PUT it back
      const group = surveyGroups.find(g => g._id === selectedGroup);
      if (group) {
        // @ts-ignore
        const surveyIds = group.surveyIds || [];
        // @ts-ignore
        if (!surveyIds.includes(selectedSurvey)) {
          // @ts-ignore
          surveyIds.push(selectedSurvey);
        }
        await api(`/survey-groups/${selectedGroup}`, {
          method: 'PUT',
          body: JSON.stringify({ name: group.name, surveyIds }),
        });
        alert('Survey added to group!');
      }
    } catch (error) {
      console.error('Failed to add survey to group:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Survey Group</h2>
        <form onSubmit={handleCreateGroup}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="p-2 border rounded"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            Create Group
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Add Survey to Group</h2>
        <form onSubmit={handleAddSurveyToGroup}>
          <select
            value={selectedSurvey}
            onChange={(e) => setSelectedSurvey(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select a Survey</option>
            {surveys.map((survey) => (
              <option key={survey._id} value={survey._id}>
                {survey.title}
              </option>
            ))}
          </select>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            <option value="">Select a Group</option>
            {surveyGroups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            Add to Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyGroupManager;
