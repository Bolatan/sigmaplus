import React from 'react';
import { BarChart3, PieChart, LineChart, Flame, Settings, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

type DashboardCardVariant = 'bar' | 'line' | 'pie' | 'radar' | 'heatmap' | 'scorecard';

interface DashboardCardProps {
  title: string;
  variant: DashboardCardVariant;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  variant,
  className,
  children,
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'bar':
        return <BarChart3 className="h-5 w-5 text-primary-500" />;
      case 'pie':
        return <PieChart className="h-5 w-5 text-secondary-500" />;
      case 'line':
        return <LineChart className="h-5 w-5 text-accent-500" />;
      case 'heatmap':
        return <Flame className="h-5 w-5 text-error-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-primary-500" />;
    }
  };

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-lg', className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center">
          {getIcon()}
          <CardTitle className="ml-2 text-base">{title}</CardTitle>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn('p-0', isLoading ? 'min-h-[200px] flex items-center justify-center' : '')}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm">Loading data...</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
      <CardFooter className="py-2 px-4 border-t border-gray-100 text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};