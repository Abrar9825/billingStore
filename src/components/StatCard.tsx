import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    text: 'text-green-600'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    text: 'text-orange-600'
  }
};

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="hover-lift glass border-white/20 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {/* Removed green + numbers for a cleaner look */}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${colors.gradient}`} />
      </CardContent>
    </Card>
  );
}