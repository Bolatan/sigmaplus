import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  path: string;
}

export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const pathnames = location.pathname.split('/').filter((x) => x);
      const newBreadcrumbs: Breadcrumb[] = [{ label: 'Home', path: '/' }];

      for (let i = 0; i < pathnames.length; i++) {
        const path = `/${pathnames.slice(0, i + 1).join('/')}`;
        let label = pathnames[i].charAt(0).toUpperCase() + pathnames[i].slice(1);

        if (pathnames[i] === 'projects' && params.projectId) {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/projects/${params.projectId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const project = await response.json();
              label = project.data.title;
            }
          } catch (error) {
            console.error('Failed to fetch project details:', error);
          }
        }

        newBreadcrumbs.push({ label, path });
      }
      setBreadcrumbs(newBreadcrumbs);
    };

    generateBreadcrumbs();
  }, [location, params]);

  return breadcrumbs;
};
