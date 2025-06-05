'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import MagnetImage from "../../components/ui/MagnetImage";

// Client component that handles search params
function ImproveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const repo = searchParams.get('repo');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!repo || !token) {
      router.push('/');
      return;
    }

    // Start SSE connection
    const eventSource = new EventSource(`/api/improve?repo=${encodeURIComponent(repo)}&token=${token}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      } else if (data.type === 'complete') {
        eventSource.close();
        setLoading(false);
        router.push('/dashboard');
      } else if (data.type === 'error') {
        eventSource.close();
        setError(data.message);
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setError('Connection lost');
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [repo, token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="w-full border-b bg-background">
        <div className="container mx-auto flex h-28 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <MagnetImage
              src="/Adobe Express - file.png"
              alt="Logo"
              width={96}
              height={96}
              className=""
              priority
            />
            <div className="flex flex-col">
              <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-md">Survival of the Feature</span>
              <span className="text-base sm:text-lg md:text-2xl font-medium text-muted-foreground mt-1">AI-Powered Frontend Evolution</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">Improving Repository: {repo}</h1>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${loading ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-lg font-medium">
                  {loading ? 'Improvement in Progress...' : error ? 'Error Occurred' : 'Improvement Complete'}
                </span>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
                <div className="font-mono text-sm space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap text-gray-800">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {!loading && !error && (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  View Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Loading component
function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main page component
export default function ImprovePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ImproveContent />
    </Suspense>
  );
} 