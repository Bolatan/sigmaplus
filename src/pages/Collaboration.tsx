import React from 'react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const CollaborationPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Collaboration & Team Features</h1>
        <p className="mt-4 text-lg text-gray-600">
          Empower your team to work together seamlessly. Share surveys, gather feedback, and manage permissions all in one place.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Set the tone for collaboration with a personal message that explains why you're sharing your survey and how others can best contribute.
              </p>
              <Button className="mt-4" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>@Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Simplify collaboration by using "@" to tag teammates so you can get targeted feedback on your survey, annotate results dashboards, and share insights.
              </p>
              <Button className="mt-4" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Manage access levels for different team members.
              </p>
              <Button className="mt-4" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Centralized management for enterprise accounts.
              </p>
              <Button className="mt-4" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CollaborationPage;
