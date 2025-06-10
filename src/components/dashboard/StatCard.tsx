import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  trend = 'neutral',
  className,
}) => {
  const trendColors = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-gray-500',
  };

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-lg', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex items-center">
            {trend !== 'neutral' && change !== undefined && (
              <div className={cn('flex items-center text-sm', trendColors[trend])}>
                {trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};