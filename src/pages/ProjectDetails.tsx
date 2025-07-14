import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError("Project ID not found in URL.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError("Authentication required. Please login.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.msg || errorData.error || `Failed to fetch project details: ${response.statusText}`);
        }

        const projectData = await response.json();
        const projectFromApi = projectData.data || projectData;

        if (!projectFromApi || !projectFromApi._id) {
            throw new Error("Fetched project data is invalid or missing ID.");
        }

        const fetchedProject = {
            ...projectFromApi,
            id: projectFromApi._id, // Map _id to id
            questions: projectFromApi.questions || [] // Ensure questions is an array, even if empty from backend
        };
        setProject(fetchedProject);

      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Ensure user context is loaded before trying to fetch
        fetchProjectDetails();
    } else if (!localStorage.getItem('authToken')) {
        setError("Please login to take the project.");
        setIsLoading(false);
    }
    // If token exists but user is null, AuthContext is loading, page will show its own loader.
  }, [projectId, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-error-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Project not found or could not be loaded.</p>
         <Button onClick={() => navigate('/')} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          {project.description && <CardDescription>{project.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Project ID: {project.id}</p>
          <p className="text-sm text-gray-500 mb-6">Status: {project.status}</p>

          <h3 className="text-lg font-semibold mb-4 border-t pt-4">Questions</h3>
          {project.questions && project.questions.length > 0 ? (
            project.questions.map((q, index) => (
              <div key={q.id || `q-${index}`} className="mb-6">
                <label htmlFor={q.id || `q-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {index + 1}. {q.text}
                </label>
                <p className="text-sm text-gray-500">Type: {q.type}</p>
                {q.options && q.options.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {q.options.map((option, optIndex) => (
                      <p key={optIndex} className="text-sm text-gray-500 pl-4">{option}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No questions found for this project.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
