'use client';

import React, { useState, useEffect, Suspense, useCallback, memo, FC } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SimpleImage from "@/components/ui/SimpleImage";
import Link from "next/link";
import Head from 'next/head';

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

interface BranchItemProps {
  branch: Branch;
  onSelect: (name: string) => void;
}

const BranchItem: FC<BranchItemProps> = memo(({ branch, onSelect }) => (
  <div
    key={branch.name}
    className="bg-white rounded-lg shadow p-6 flex items-center justify-between hover:shadow-md transition-shadow"
    onClick={() => onSelect(branch.name)}
    role="button"
    tabIndex={0}
  >
    <div>
      <h3 className="text-lg font-medium text-gray-900">{branch.name}</h3>
      <p className="text-sm text-gray-500">
        Commit: {branch.commit.sha.substring(0, 7)}
      </p>
    </div>
  </div>
));

BranchItem.displayName = 'BranchItem';

const Analytics: FC = () => {
  useEffect(() => {
    const analytics = {
      startTime: Date.now(),
      scrollDepth: 0,
      interactions: [] as AnalyticsEvent[],
      
      init() {
        const handleScroll = () => {
          const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
          if (scrollPercent > this.scrollDepth) {
            this.scrollDepth = scrollPercent;
            this.logInteraction('scroll', { depth: scrollPercent });
          }
        };

        const handleClick = (e: MouseEvent) => {
          const element = e.target as HTMLElement;
          if (element.matches('button, a, [role="button"]')) {
            this.logInteraction('click', {
              element: element.tagName,
              text: element.textContent?.trim(),
              id: element.id,
              class: element.className
            });
          }
        };

        const handleSubmit = (e: Event) => {
          const form = e.target as HTMLFormElement;
          if (form.tagName === 'FORM') {
            this.logInteraction('form_submit', {
              formId: form.id,
              formAction: form.action
            });
          }
        };

        const handleMediaPlay = (e: Event) => {
          const media = e.target as HTMLMediaElement;
          if (media.matches('video, audio')) {
            this.logInteraction('media_play', {
              type: media.tagName,
              id: media.id
            });
          }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);
        document.addEventListener('play', handleMediaPlay, true);

        const timeInterval = setInterval(() => {
          const timeSpent = (Date.now() - this.startTime) / 1000;
          this.logInteraction('time_spent', { seconds: timeSpent });
        }, 30000);

        return () => {
          window.removeEventListener('scroll', handleScroll);
          document.removeEventListener('click', handleClick);
          document.removeEventListener('submit', handleSubmit);
          document.removeEventListener('play', handleMediaPlay, true);
          clearInterval(timeInterval);
        };
      },

      logInteraction(type: string, data: Record<string, any>) {
        this.interactions.push({
          type,
          data,
          timestamp: new Date().toISOString()
        });
        
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      }
    };

    return analytics.init();
  }, []);

  return null;
};

const BranchesContent: FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const repo = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('repo') : null;

  const fetchBranches = useCallback(async () => {
    if (!session?.accessToken || !repo) return;

    try {
      const cacheKey = `branches-${repo}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        setBranches(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const response = await fetch(`https://api.github.com/repos/${repo}/branches`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      const data = await response.json();
      setBranches(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, repo]);

  useEffect(() => {
    if (session?.accessToken && repo) {
      fetchBranches();
    }
  }, [session, repo, fetchBranches]);

  const handleBranchSelect = (branchName: string) => {
    router.push(`/improve?repo=${repo}&branch=${branchName}&token=${session?.accessToken}`);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in to view branches</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Branches Page</title>
        <meta name="description" content="Select a branch for A/B testing on the Branches Page." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="w-full border-b bg-background">
        <div className="container mx-auto flex h-28 items-center justify-between px-4">
          <SimpleImage
            src="/Adobe Express - file.png"
            alt="Logo"
            width={96}
            height={96}
            className=""
            priority
          />
          <div className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-primary">Branch Management</span>
            <span className="text-base text-muted-foreground mt-1">Select a branch for A/B testing</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Select a Branch</h1>
          <div className="space-y-4">
            {branches.map((branch) => (
              <BranchItem
                key={branch.name}
                branch={branch}
                onSelect={handleBranchSelect}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="text-gray-600"
          >
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

const BranchesPage: FC = () => {
  return (
    <>
      <Analytics />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      }>
        <BranchesContent />
      </Suspense>
    </>
  );
};

export default BranchesPage; 