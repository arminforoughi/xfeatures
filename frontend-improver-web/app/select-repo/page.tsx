'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Repo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
}

export default function SelectRepo() {
  const { data: session } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/signup');
      return;
    }

    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [session, router]);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepoSelect = (repo: Repo) => {
    setSelectedRepo(repo);
  };

  if (selectedRepo) {
    router.push(`/improve?repo=${selectedRepo.full_name}&token=${session?.accessToken}`);
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Select a Repository</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose a repository to improve its frontend
          </p>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        {loading ? (
          <div className="text-center">Loading repositories...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRepos.map((repo) => (
              <Card
                key={repo.full_name}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleRepoSelect(repo)}
              >
                <h3 className="font-semibold text-lg">{repo.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {repo.description || 'No description available'}
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRepoSelect(repo)}
                  >
                    Select Repository
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 