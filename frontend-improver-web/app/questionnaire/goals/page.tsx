'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function GoalsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    goals: [] as string[],
    customGoal: '',
    importantPages: [] as string[],
    customPage: '',
    targetMetrics: [] as string[],
    customMetric: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store the data in localStorage for the next page
    localStorage.setItem('questionnaire_goals', JSON.stringify(formData));
    router.push(`/questionnaire/actions?repo=${repo}&token=${token}`);
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const togglePage = (page: string) => {
    setFormData(prev => ({
      ...prev,
      importantPages: prev.importantPages.includes(page)
        ? prev.importantPages.filter(p => p !== page)
        : [...prev.importantPages, page]
    }));
  };

  const toggleMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      targetMetrics: prev.targetMetrics.includes(metric)
        ? prev.targetMetrics.filter(m => m !== metric)
        : [...prev.targetMetrics, metric]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Goals</h1>
          <p className="mt-2 text-sm text-gray-600">
            Help us understand your project's objectives and key pages
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-medium">What are your main goals for A/B testing?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Increase user engagement',
                  'Improve conversion rates',
                  'Reduce bounce rates',
                  'Enhance user experience',
                  'Optimize call-to-action buttons',
                  'Improve form completion rates'
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.goals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <Label htmlFor={goal}>{goal}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customGoal" className="text-sm text-gray-600">Other goal (optional)</Label>
                <Textarea
                  id="customGoal"
                  placeholder="Enter your custom goal..."
                  value={formData.customGoal}
                  onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Which pages are most important for your goals?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Homepage',
                  'Product page',
                  'Pricing page',
                  'Checkout page',
                  'Blog/Content pages',
                  'Contact page'
                ].map((page) => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={page}
                      checked={formData.importantPages.includes(page)}
                      onCheckedChange={() => togglePage(page)}
                    />
                    <Label htmlFor={page}>{page}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customPage" className="text-sm text-gray-600">Other page (optional)</Label>
                <Textarea
                  id="customPage"
                  placeholder="Enter your custom page..."
                  value={formData.customPage}
                  onChange={(e) => setFormData({ ...formData, customPage: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">What metrics are you trying to improve?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Click-through rates',
                  'Time on page',
                  'Conversion rates',
                  'Form completion rates',
                  'Scroll depth',
                  'Bounce rate'
                ].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric}
                      checked={formData.targetMetrics.includes(metric)}
                      onCheckedChange={() => toggleMetric(metric)}
                    />
                    <Label htmlFor={metric}>{metric}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customMetric" className="text-sm text-gray-600">Other metric (optional)</Label>
                <Textarea
                  id="customMetric"
                  placeholder="Enter your custom metric..."
                  value={formData.customMetric}
                  onChange={(e) => setFormData({ ...formData, customMetric: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Continue to Actions
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function GoalsQuestionnaire() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoalsForm />
    </Suspense>
  );
} 