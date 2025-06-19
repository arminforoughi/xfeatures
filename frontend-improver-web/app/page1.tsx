'use client';

import { useState, useEffect, FC } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import MagnetImage from "../components/ui/MagnetImage";

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    router.push(`/improve?repo=${encodeURIComponent(selectedRepo)}&token=${session?.accessToken}`);
  };

  return (
    <>
      <Analytics />
      <div className="flex min-h-screen flex-col">
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

              </div>
            </div>
            <Button
              variant="outline"
              className="text-lg px-6 py-2 border-2 border-primary font-semibold transition-colors hover:bg-primary/10"
              onClick={() => window.open('https://calendly.com/laurie-sartain/30min', '_blank')}
            >
              Contact Us
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <section className="w-full py-16 md:py-32 lg:py-40 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid gap-10 lg:grid-cols-[1fr_500px] lg:gap-20 xl:grid-cols-[1fr_600px] items-center">
                <div className="flex flex-col justify-center space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-primary drop-shadow-xl">
                      AI Agents For Your Frontend
                    </h1>
                    <p className="max-w-[600px] text-xl sm:text-2xl text-muted-foreground font-medium">
                      AI analyzes and improves your landing page—so you can focus on building and launching safely.
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
                        {loading ? 'Improving...' : 'Enhance Repository'}
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
                  <MagnetImage
                    src="/logoss.png"
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
                    <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                      <MagnetImage
                        src="/agenticf.png"
                        width={400}
                        height={300}
                        alt="Agentic Flow Diagram"
                        className="object-contain rounded-2xl"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Our AI agent works like your personal frontend expert, following a proven process:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 rounded-xl p-6">
                        <li>Smart Analysis: Understands your code like a senior developer would</li>
                        <li>Pattern Detection: Identifies opportunities for improvement and optimization</li>
                        <li>Safe Improvements: Makes targeted enhancements while preserving functionality</li>
                        <li>Quality Checks: Validates changes to ensure everything works perfectly</li>
                        <li>Seamless Integration: Deploys improvements without disrupting your workflow</li>
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
                      <ul className="list-disc list-inside space-y-2 text-gray-700 rounded-xl p-6">
                        <li>User Engagement: Click-through rates and interaction patterns</li>
                        <li>Performance Metrics: Load times and resource utilization</li>
                        <li>A/B Testing: Variant performance comparison</li>
                        <li>Error Tracking: Real-time monitoring of issues</li>
                        <li>Conversion Analytics: Impact on business metrics</li>
                      </ul>
                    </div>
                    <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                      <MagnetImage
                        src="/WhatsApp Image 2025-06-04 at 21.19.43.jpeg"
                        width={400}
                        height={300}
                        alt="Analytics Dashboard Preview"
                        className="object-contain rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-background p-8">
                  <h3 className="text-2xl font-bold mb-4"></h3>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="relative h-[300px] bg-muted rounded-lg flex items-center justify-center">
                      <MagnetImage
                        src="/WhatsApp Image 2025-06-04 at 22.31.33.jpeg"
                        width={400}
                        height={300}
                        alt="Developer Insights Dashboard"
                        className="object-contain rounded-2xl"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Make data-driven decisions with our developer tools:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 rounded-xl p-6">
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

          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto px-4 md:px-6 relative">
              <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <div className="inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-800 mb-2">
                  Evolution Tracking
                </div>
                <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Variant Evolution
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                  Watch how user engagement improves as our AI evolves your frontend
                </p>
              </div>

              <div className="mx-auto max-w-5xl pt-12">
                <div className="rounded-2xl border bg-background p-8 shadow-xl backdrop-blur-sm bg-white/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50"></div>
                  <div className="relative">
                    <div className="h-[400px]">
                      <Line
                        data={{
                          labels: ['Variant A', 'Variant B', 'Variant C', 'Variant D', 'Variant E'],
                          datasets: [
                            {
                              label: 'User Engagement Score',
                              data: [65, 68, 75, 82, 89, 85, 92],
                              borderColor: 'rgb(168, 85, 247)',
                              backgroundColor: 'rgba(168, 85, 247, 0.1)',
                              fill: true,
                              tension: 0.4,
                              pointRadius: 6,
                              pointHoverRadius: 8,
                              borderWidth: 3,
                            },
                            {
                              label: 'Conversion Rate',
                              data: [45, 48, 52, 58, 63, 68, 72],
                              borderColor: 'rgb(236, 72, 153)',
                              backgroundColor: 'rgba(236, 72, 153, 0.1)',
                              fill: true,
                              tension: 0.4,
                              pointRadius: 6,
                              pointHoverRadius: 8,
                              borderWidth: 3,
                            }
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                font: {
                                  size: 14,
                                  weight: 'bold',
                                  family: "'Inter', sans-serif"
                                },
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle'
                              }
                            },
                            tooltip: {
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              titleColor: '#1f2937',
                              bodyColor: '#4b5563',
                              borderColor: '#e5e7eb',
                              borderWidth: 1,
                              padding: 12,
                              boxPadding: 6,
                              usePointStyle: true,
                              titleFont: {
                                size: 14,
                                weight: 'bold',
                                family: "'Inter', sans-serif"
                              },
                              bodyFont: {
                                size: 13,
                                family: "'Inter', sans-serif"
                              },
                              cornerRadius: 8,
                              displayColors: true,
                              boxWidth: 8,
                              boxHeight: 8,
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                              },
                              border: {
                                display: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  family: "'Inter', sans-serif"
                                },
                                padding: 10,
                                color: '#6b7280'
                              },
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                  family: "'Inter', sans-serif"
                                },
                                padding: 10,
                                color: '#6b7280'
                              },
                              border: {
                                display: false
                              }
                            }
                          },
                          animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                          },
                          interaction: {
                            intersect: false,
                            mode: 'index'
                          }
                        }}
                      />
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-lg text-purple-900">Continuous Improvement</h4>
                        </div>
                        <p className="text-sm text-purple-700">Each variant builds upon the success of previous versions</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-pink-100">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-lg text-pink-900">Data-Driven Evolution</h4>
                        </div>
                        <p className="text-sm text-pink-700">AI analyzes user behavior to optimize each iteration</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-lg text-purple-900">Measurable Results</h4>
                        </div>
                        <p className="text-sm text-purple-700">Track engagement and conversion improvements in real-time</p>
                      </div>
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
                    className="gap-2 mt-4 bg-black hover:bg-gray-800 text-white px-6 py-2"
                    size="lg"
                    onClick={() => window.open('https://calendly.com/laurie-sartain/30min', '_blank')}
                  >
                    Contact Us
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
    </>
  );
} 