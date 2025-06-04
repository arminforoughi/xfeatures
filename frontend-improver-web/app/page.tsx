'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Repository {
  full_name: string;
  name: string;
  owner: {
    login: string;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepos = async () => {
      if (session?.accessToken) {
        try {
          const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          const data = await response.json();
          setRepos(data);
        } catch (err) {
          console.error('Failed to fetch repositories:', err);
        }
      }
    };

    fetchRepos();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: selectedRepo,
          accessToken: session?.accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve repository');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <span className="text-3xl font-bold">Survival of the Features</span>
          </div>
          {session ? (
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
          ) : (
            <Button
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 inline-flex items-center"
              onClick={() => signIn('github')}
            >
              <Github className="h-5 w-5 mr-2" />
              Sign in with GitHub
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    AI-Powered Frontend Enhancement
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Let AI improve your frontend code. Our system automatically analyzes and enhances your landing pages while tracking user engagement.
                  </p>
                </div>
                {!session ? (
                  <div className="flex justify-start">
                    <Button
                      className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg inline-flex items-center h-12"
                      size="lg"
                      onClick={() => signIn('github')}
                    >
                      <Github className="h-7 w-7 mr-3" />
                      Sign in with GitHub
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="repo" className="block text-sm font-medium text-muted-foreground mb-2">
                        Select Repository
                      </label>
                      <select
                        id="repo"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">Select a repository</option>
                        {repos.map((repo) => (
                          <option key={repo.full_name} value={repo.full_name}>
                            {repo.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading || !selectedRepo}
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      {loading ? 'Improving...' : 'Improve Repository'}
                    </Button>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </form>
                )}
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/hero.svg"
                  width={700}
                  height={700}
                  alt="Survival of the Features"
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our platform uses AI to analyze and enhance your frontend code while tracking user engagement metrics.
              </p>
            </div>

            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 pt-8 md:pt-12 max-w-5xl">
              <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-bold">Connect</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your GitHub repository with a simple OAuth integration.
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-bold">Improve</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes and enhances your frontend code with modern best practices.
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-bold">Track</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor user engagement metrics and compare performance between versions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to improve your frontend?
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Let AI enhance your frontend code while tracking user engagement metrics.
              </p>
              {!session ? (
                <Button
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 inline-flex items-center"
                  size="lg"
                  onClick={() => signIn('github')}
                >
                  <Github className="h-5 w-5 mr-2" />
                  Sign in with GitHub
                </Button>
              ) : (
                <Button
                  className="gap-2 mt-4"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                >
                  View Dashboard
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Survival of the Features. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 