'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function ActionsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repo = searchParams.get('repo');
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    callToActions: [] as string[],
    customCTA: '',
    userInteractions: [] as string[],
    customInteraction: '',
    successCriteria: [] as string[],
    customCriteria: '',
  });

  useEffect(() => {
    // Load previous questionnaire data
    const goalsData = localStorage.getItem('questionnaire_goals');
    if (!goalsData) {
      router.push(`/questionnaire/goals?repo=${repo}&token=${token}`);
    }
  }, [repo, token, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine both questionnaire data
    const goalsData = JSON.parse(localStorage.getItem('questionnaire_goals') || '{}');
    const allData = { ...goalsData, ...formData };
    
    // Store complete questionnaire data
    localStorage.setItem('questionnaire_complete', JSON.stringify(allData));
    
    // Navigate to improve page with all data
    router.push(`/improve?repo=${repo}&token=${token}`);
  };

  const toggleCTA = (cta: string) => {
    setFormData(prev => ({
      ...prev,
      callToActions: prev.callToActions.includes(cta)
        ? prev.callToActions.filter(c => c !== cta)
        : [...prev.callToActions, cta]
    }));
  };

  const toggleInteraction = (interaction: string) => {
    setFormData(prev => ({
      ...prev,
      userInteractions: prev.userInteractions.includes(interaction)
        ? prev.userInteractions.filter(i => i !== interaction)
        : [...prev.userInteractions, interaction]
    }));
  };

  const toggleCriteria = (criteria: string) => {
    setFormData(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.includes(criteria)
        ? prev.successCriteria.filter(c => c !== criteria)
        : [...prev.successCriteria, criteria]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Interactions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Help us understand the key user interactions and success criteria
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-medium">What are your main call-to-action buttons?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Sign Up',
                  'Get Started',
                  'Learn More',
                  'Contact Us',
                  'Download',
                  'Subscribe'
                ].map((cta) => (
                  <div key={cta} className="flex items-center space-x-2">
                    <Checkbox
                      id={cta}
                      checked={formData.callToActions.includes(cta)}
                      onCheckedChange={() => toggleCTA(cta)}
                    />
                    <Label htmlFor={cta}>{cta}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customCTA" className="text-sm text-gray-600">Other CTA (optional)</Label>
                <Textarea
                  id="customCTA"
                  placeholder="Enter your custom call-to-action..."
                  value={formData.customCTA}
                  onChange={(e) => setFormData({ ...formData, customCTA: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">What user interactions are most important?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Form submissions',
                  'Button clicks',
                  'Scroll depth',
                  'Time on page',
                  'Video views',
                  'File downloads'
                ].map((interaction) => (
                  <div key={interaction} className="flex items-center space-x-2">
                    <Checkbox
                      id={interaction}
                      checked={formData.userInteractions.includes(interaction)}
                      onCheckedChange={() => toggleInteraction(interaction)}
                    />
                    <Label htmlFor={interaction}>{interaction}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customInteraction" className="text-sm text-gray-600">Other interaction (optional)</Label>
                <Textarea
                  id="customInteraction"
                  placeholder="Enter your custom interaction..."
                  value={formData.customInteraction}
                  onChange={(e) => setFormData({ ...formData, customInteraction: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">What defines success for your A/B tests?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  '20% increase in sign-ups',
                  '15% more time on page',
                  '25% higher conversion rate',
                  '30% more form completions',
                  '40% increase in scroll depth',
                  '50% more video views'
                ].map((criteria) => (
                  <div key={criteria} className="flex items-center space-x-2">
                    <Checkbox
                      id={criteria}
                      checked={formData.successCriteria.includes(criteria)}
                      onCheckedChange={() => toggleCriteria(criteria)}
                    />
                    <Label htmlFor={criteria}>{criteria}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="customCriteria" className="text-sm text-gray-600">Other success criteria (optional)</Label>
                <Textarea
                  id="customCriteria"
                  placeholder="Enter your custom success criteria..."
                  value={formData.customCriteria}
                  onChange={(e) => setFormData({ ...formData, customCriteria: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Start Improvement Process
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ActionsQuestionnaire() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionsForm />
    </Suspense>
  );
} 