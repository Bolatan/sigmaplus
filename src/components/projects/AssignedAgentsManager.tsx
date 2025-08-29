import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

interface AssignedAgentsManagerProps {
  project: any;
  onProjectUpdate: (updatedProject: any) => void;
}

const AssignedAgentsManager: React.FC<AssignedAgentsManagerProps> = ({ project, onProjectUpdate }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const apiFetch = useApi();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await apiFetch('/users?role=agent');
        setAgents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    fetchAgents();
  }, [apiFetch]);

  useEffect(() => {
    if (project && project.assignedAgents) {
      setSelectedAgents(project.assignedAgents.map((agent: any) => agent._id || agent));
    }
  }, [project]);

  const handleAgentSelectionChange = (agentId: string) => {
    const newSelectedAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    setSelectedAgents(newSelectedAgents);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedProject = { ...project, assignedAgents: selectedAgents };
      await onProjectUpdate(updatedProject);
      alert('Assigned agents updated successfully!');
    } catch (error) {
      console.error('Failed to update assigned agents:', error);
      alert('Failed to update assigned agents.');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-900">Manage Assigned Agents</h2>
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent._id} className="flex items-center">
              <input
                type="checkbox"
                id={`agent-${agent._id}`}
                checked={selectedAgents.includes(agent._id)}
                onChange={() => handleAgentSelectionChange(agent._id)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor={`agent-${agent._id}`} className="ml-2 block text-sm text-gray-900">
                {agent.name} ({agent.email})
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AssignedAgentsManager;
