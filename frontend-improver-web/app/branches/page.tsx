'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import MagnetImage from "../../components/ui/MagnetImage";

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

function BranchesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const repo = searchParams.get('repo');

  useEffect(() => {
    if (session?.accessToken && repo) {
      fetchBranches();
    }
  }, [session, repo]);

  const fetchBranches = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/branches`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      const data = await response.json();
      setBranches(data);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branchName: string) => {
    router.push(`/dashboard?repo=${repo}&branch=${branchName}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              <span className="text-3xl font-bold tracking-tight text-primary">Branch Management</span>
              <span className="text-base text-muted-foreground mt-1">Select a branch for A/B testing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">A/B Testing Setup</h2>
            <p className="text-gray-600 mb-4">
              Select a branch to start tracking user engagement metrics. This will help you compare the performance
              between different versions of your frontend.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-blue-800 font-medium mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li>Select a branch to track user engagement</li>
                <li>Monitor metrics in the analytics dashboard</li>
                <li>Compare performance between branches</li>
                <li>Make data-driven decisions about your frontend</li>
              </ol>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : (
            <div className="grid gap-4">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="bg-white rounded-lg shadow p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-500">
                      Commit: {branch.commit.sha.substring(0, 7)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleBranchSelect(branch.name)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Track Branch
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="text-gray-600"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BranchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <BranchesContent />
    </Suspense>
  );
} 