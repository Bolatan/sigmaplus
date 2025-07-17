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

        if ((pathnames[i] === 'projects' && params.projectId) || pathnames[i] === 'reports') {
          // Hide breadcrumbs for project details page and reports page
          return;
        }

        newBreadcrumbs.push({ label, path });
      }
      setBreadcrumbs(newBreadcrumbs);
    };

    generateBreadcrumbs();
  }, [location, params]);

  return breadcrumbs;
};
