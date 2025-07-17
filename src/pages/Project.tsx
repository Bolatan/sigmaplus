import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { Project as ProjectType } from '../types';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const api = useApi();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api('/projects');
        setProjects(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [api]);

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user?.role !== 'client' && (
          <Link to="/projects/new">
            <Button variant="primary">Create Project</Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project._id} className="p-4">
            <h2 className="text-xl font-bold">{project.name}</h2>
            <p className="text-gray-600">{project.description}</p>
            <div className="mt-4">
              <Link to={`/projects/${project._id}`}>
                <Button variant="secondary">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
