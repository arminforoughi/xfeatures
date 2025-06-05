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
  const [showRepoForm, setShowRepoForm] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

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
    setLogs([]);
    setShowLogs(true);

    try {
      // Start SSE connection
      const eventSource = new EventSource(`/api/improve?repo=${encodeURIComponent(selectedRepo)}&token=${session?.accessToken}`);

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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-28 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Image
              src="/jellyfish.png"
              alt="Logo"
              width={96}
              height={96}
              className=""
              priority
            />
            <div className="flex flex-col">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-primary drop-shadow-md">Survival of the Feature</span>
              <span className="text-lg sm:text-2xl font-medium text-muted-foreground mt-1">AI-Powered Frontend Evolution</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-16 md:py-32 lg:py-40 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_500px] lg:gap-20 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-primary drop-shadow-xl">
                    Supercharge Your Frontend
                  </h1>
                  <p className="max-w-[600px] text-xl sm:text-2xl text-muted-foreground font-medium">
                    AI analyzes, improves, and tracks your landing pages—so you can focus on building, not debugging.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button
                    className="bg-black hover:bg-gray-800 text-white px-10 py-4 text-xl font-bold shadow-xl transition-transform hover:scale-105"
                    size="lg"
                    onClick={() => {
                      if (session) {
                        setShowRepoForm(true);
                      } else {
                        signIn('github');
                      }
                    }}
                  >
                    <Github className="h-7 w-7 mr-3" />
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    className="text-lg px-8 py-4 border-2 border-primary font-semibold transition-colors hover:bg-primary/10"
                    size="lg"
                    onClick={() => {
                      window.scrollTo({
                        top: document.body.scrollHeight / 3,
                        behavior: 'smooth',
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </div>
                {showRepoForm && session && (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-md mt-8">
                    <div>
                      <label htmlFor="repo" className="block text-sm font-medium text-muted-foreground mb-2">
                        Select Repository
                      </label>
                      <select
                        id="repo"
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    {showLogs && (
                      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg text-black font-mono text-sm overflow-auto max-h-60">
                        {logs.map((log, index) => (
                          <div key={index} className="whitespace-pre-wrap">{log}</div>
                        ))}
                      </div>
                    )}
                  </form>
                )}
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/hero.svg"
                  width={900}
                  height={900}
                  alt="Survival of the Features"
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full shadow-2xl"
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
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Technology Deep Dive</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Understanding how our AI-powered system works to improve your frontend code
              </p>
            </div>

            <div className="mx-auto grid gap-8 pt-12 max-w-5xl">
              <div className="rounded-lg border bg-background p-8">
                <h3 className="text-2xl font-bold mb-4">Agentic Flow</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Our system employs an intelligent agent that follows a sophisticated workflow:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Code Analysis: Deep semantic understanding of your frontend codebase</li>
                      <li>Pattern Recognition: Identification of improvement opportunities</li>
                      <li>Optimization Generation: Creation of optimized code variants</li>
                      <li>Performance Testing: Validation of improvements</li>
                      <li>Deployment: Seamless integration of changes</li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src="/agentic-flow.svg"
                      width={400}
                      height={300}
                      alt="Agentic Flow Diagram"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-background p-8">
                <h3 className="text-2xl font-bold mb-4">Analysis Process</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src="/analysis-process.svg"
                      width={400}
                      height={300}
                      alt="Analysis Process Diagram"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Our analysis engine examines multiple aspects of your frontend:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Code Structure: Component organization and architecture</li>
                      <li>Performance Metrics: Load times and resource usage</li>
                      <li>Accessibility: WCAG compliance and user experience</li>
                      <li>Best Practices: Modern frontend development standards</li>
                      <li>Dependencies: Package optimization and updates</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-background p-8">
                <h3 className="text-2xl font-bold mb-4">Tracking & Analytics</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Comprehensive tracking system for measuring improvements:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>User Engagement: Click-through rates and interaction patterns</li>
                      <li>Performance Metrics: Load times and resource utilization</li>
                      <li>A/B Testing: Variant performance comparison</li>
                      <li>Error Tracking: Real-time monitoring of issues</li>
                      <li>Conversion Analytics: Impact on business metrics</li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src="/analytics-dashboard.svg"
                      width={400}
                      height={300}
                      alt="Analytics Dashboard Preview"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-background p-8">
                <h3 className="text-2xl font-bold mb-4">Developer Insights</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src="/developer-insights.svg"
                      width={400}
                      height={300}
                      alt="Developer Insights Dashboard"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Make data-driven decisions with our developer tools:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Performance Reports: Detailed analysis of improvements</li>
                      <li>Variant Comparison: Side-by-side metrics of different versions</li>
                      <li>User Feedback: Direct insights from end-users</li>
                      <li>Optimization Suggestions: AI-powered recommendations</li>
                      <li>Integration APIs: Custom analytics and tracking</li>
                    </ul>
                  </div>
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