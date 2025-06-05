'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import MagnetImage from "../../components/ui/MagnetImage";

function ImprovePageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const repo = searchParams.get('repo');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!repo || !token) {
      router.push('/');
      return;
    }

    const eventSource = new EventSource(`/api/improve?repo=${repo}&token=${token}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      } else if (data.type === 'complete') {
        setCompleted(true);
        eventSource.close();
        setLoading(false);
      } else if (data.type === 'error') {
        setError(data.message);
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost. Please try again.');
      eventSource.close();
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [repo, token, router]);

  const handleContinue = () => {
    router.push(`/branches?repo=${repo}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="text-3xl font-bold tracking-tight text-primary">Improvement Process</span>
              <span className="text-base text-muted-foreground mt-1">Enhancing your frontend code</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Improvement Status</h2>
              {loading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">Processing...</span>
                </div>
              )}
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap mb-2">
                      {log}
                    </div>
                  ))}
                </div>

                {completed && (
                  <div className="mt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h3 className="text-green-800 font-medium mb-2">Improvement Complete!</h3>
                      <p className="text-green-700">
                        Your frontend code has been enhanced. Now you can track user engagement metrics
                        across different branches to measure the impact of these improvements.
                      </p>
                    </div>
                    <Button
                      onClick={handleContinue}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      Continue to Branch Management
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ImprovePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ImprovePageContent />
    </Suspense>
  );
} 