'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  id: string;
  type: string;
  data: {
    depth?: number;
    seconds?: number;
    element?: string;
    text?: string;
    id?: string;
    class?: string;
    formId?: string;
    formAction?: string;
  };
  timestamp: string;
  userId: string;
  variant?: 'original' | 'improved';
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, all

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const getScrollDepthData = () => {
    const original = analytics.filter(a => a.variant === 'original' && a.type === 'scroll');
    const improved = analytics.filter(a => a.variant === 'improved' && a.type === 'scroll');

    return {
      labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
      datasets: [
        {
          label: 'Original',
          data: [
            original.filter(a => a.data.depth && a.data.depth <= 25).length,
            original.filter(a => a.data.depth && a.data.depth > 25 && a.data.depth <= 50).length,
            original.filter(a => a.data.depth && a.data.depth > 50 && a.data.depth <= 75).length,
            original.filter(a => a.data.depth && a.data.depth > 75).length,
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Improved',
          data: [
            improved.filter(a => a.data.depth && a.data.depth <= 25).length,
            improved.filter(a => a.data.depth && a.data.depth > 25 && a.data.depth <= 50).length,
            improved.filter(a => a.data.depth && a.data.depth > 50 && a.data.depth <= 75).length,
            improved.filter(a => a.data.depth && a.data.depth > 75).length,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  const getTimeSpentData = () => {
    const original = analytics.filter(a => a.variant === 'original' && a.type === 'time_spent');
    const improved = analytics.filter(a => a.variant === 'improved' && a.type === 'time_spent');

    return {
      labels: ['0-30s', '30-60s', '1-2m', '2-5m', '5m+'],
      datasets: [
        {
          label: 'Original',
          data: [
            original.filter(a => a.data.seconds && a.data.seconds <= 30).length,
            original.filter(a => a.data.seconds && a.data.seconds > 30 && a.data.seconds <= 60).length,
            original.filter(a => a.data.seconds && a.data.seconds > 60 && a.data.seconds <= 120).length,
            original.filter(a => a.data.seconds && a.data.seconds > 120 && a.data.seconds <= 300).length,
            original.filter(a => a.data.seconds && a.data.seconds > 300).length,
          ],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Improved',
          data: [
            improved.filter(a => a.data.seconds && a.data.seconds <= 30).length,
            improved.filter(a => a.data.seconds && a.data.seconds > 30 && a.data.seconds <= 60).length,
            improved.filter(a => a.data.seconds && a.data.seconds > 60 && a.data.seconds <= 120).length,
            improved.filter(a => a.data.seconds && a.data.seconds > 120 && a.data.seconds <= 300).length,
            improved.filter(a => a.data.seconds && a.data.seconds > 300).length,
          ],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  const getInteractionData = () => {
    const original = analytics.filter(a => a.variant === 'original');
    const improved = analytics.filter(a => a.variant === 'improved');

    const interactionTypes = ['click', 'scroll', 'form_submit', 'media_play'];
    
    return {
      labels: interactionTypes,
      datasets: [
        {
          label: 'Original',
          data: interactionTypes.map(type => 
            original.filter(a => a.type === type).length
          ),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Improved',
          data: interactionTypes.map(type => 
            improved.filter(a => a.type === type).length
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in to view the dashboard</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Engagement Analytics Dashboard</h1>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Scroll Depth Comparison */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Scroll Depth Comparison</h2>
              <Bar data={getScrollDepthData()} />
            </div>

            {/* Time Spent Comparison */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Time Spent Comparison</h2>
              <Line data={getTimeSpentData()} />
            </div>

            {/* Interaction Types Comparison */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Interaction Types</h2>
              <Doughnut data={getInteractionData()} />
            </div>

            {/* Summary Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Visitors</span>
                  <span className="font-medium">{analytics.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Time Spent</span>
                  <span className="font-medium">
                    {Math.round(
                      analytics
                        .filter(a => a.type === 'time_spent' && a.data.seconds)
                        .reduce((acc, curr) => acc + (curr.data.seconds || 0), 0) /
                        analytics.filter(a => a.type === 'time_spent').length || 0
                    )}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Common Interaction</span>
                  <span className="font-medium">
                    {Object.entries(
                      analytics.reduce((acc, curr) => {
                        acc[curr.type] = (acc[curr.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 