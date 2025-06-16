'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  page: string;
}

interface AnalyticsStats {
  type: string;
  _count: number;
}

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<AnalyticsStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const startDate = new Date();
        switch (dateRange) {
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          default:
            startDate.setDate(startDate.getDate() - 7);
        }

        const response = await fetch(
          `/api/analytics?startDate=${startDate.toISOString()}`
        );
        const data = await response.json();
        setEvents(data.events);
        setStats(data.stats);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Process data for charts
  const processChartData = () => {
    const chartData: Record<string, any> = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!chartData[date]) {
        chartData[date] = {
          date,
          clicks: 0,
          scrolls: 0,
          forms: 0,
        };
      }
      
      switch (event.type) {
        case 'click':
          chartData[date].clicks++;
          break;
        case 'scroll':
          chartData[date].scrolls++;
          break;
        case 'form_submit':
          chartData[date].forms++;
          break;
      }
    });

    return Object.values(chartData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        <div className="mb-8 flex gap-4">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            onClick={() => setDateRange('7d')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            onClick={() => setDateRange('30d')}
          >
            Last 30 Days
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.type}
              className="bg-white p-6 rounded-lg shadow"
            >
              <h3 className="text-lg font-semibold mb-2">
                {stat.type.charAt(0).toUpperCase() + stat.type.slice(1)}
              </h3>
              <p className="text-3xl font-bold">{stat._count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">User Interactions Over Time</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#8884d8"
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="scrolls"
                  stroke="#82ca9d"
                  name="Scrolls"
                />
                <Line
                  type="monotone"
                  dataKey="forms"
                  stroke="#ffc658"
                  name="Form Submissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.slice(0, 10).map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.page}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 