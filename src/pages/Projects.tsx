import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const triggerRefetch = () => {
    fetchProjects();
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
    });
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setApiError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setApiError("No authentication token found. Please login.");
      setIsLoading(false);
      setProjects([]);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setApiError(errorData.msg || errorData.error || `HTTP error! status: ${response.status}`);
        setProjects([]);
      } else {
        const result = await response.json();
        const fetchedProjects = (result.data || []).map((p: any) => ({
          ...p,
          id: p._id,
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setProjects(fetchedProjects);
      }
    } catch (error: any) {
      if (!apiError) setApiError(error.message || 'Failed to fetch projects from API.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleAddProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    if (!formData.title.trim()) {
      setApiError("Project title is required.");
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create project: ${response.statusText}`);
      }

      setIsAddModalOpen(false);
      resetForm();
      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the project.');
    }
  }, [formData, resetForm]);

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project and all its surveys?')) {
      return;
    }

    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to delete project: ${response.statusText}`);
      }

      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while deleting the project.');
    }
  };

  const filteredProjects = projects.filter(project =>
    (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Project
          </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
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
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Created {formatDate(project.createdAt)}
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                    {(user?.role === 'admin' || user?.role === 'agent') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Projects;
