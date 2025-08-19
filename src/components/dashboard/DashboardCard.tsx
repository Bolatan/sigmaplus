import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2 } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'pie' | 'bar' | 'line';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, isLoading, children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
