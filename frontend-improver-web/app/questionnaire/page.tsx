'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function QuestionnaireForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    goals: [] as string[],
    customGoal: '',
    importantPages: [] as string[],
    customPage: '',
    targetMetrics: [] as string[],
    customMetric: '',
    callToActions: [] as string[],
    customCTA: '',
    userInteractions: [] as string[],
    customInteraction: '',
    successCriteria: [] as string[],
    customCriteria: '',
  });

  const [submissionMethod, setSubmissionMethod] = useState<'email' | 'typeform' | 'googleforms' | 'direct'>('email');

  const sendToEmail = async (data: any) => {
    try {
      const response = await fetch('/api/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit questionnaire');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const redirectToTypeform = () => {
    // Try the correct Typeform URL format
    const typeformUrl = 'https://qYbBE8nK.typeform.com/to/qYbBE8nK';
    
    // Open in new tab
    const newWindow = window.open(typeformUrl, '_blank');
    
    // If the window doesn't open or there's an issue, show a fallback
    if (!newWindow) {
      alert('Please allow popups for this site to open the Typeform. Alternatively, you can copy and paste this URL: ' + typeformUrl);
    }
  };

  const redirectToGoogleForms = () => {
    // Replace with your Google Forms URL
    const googleFormsUrl = 'https://forms.google.com/your-form-id';
    window.open(googleFormsUrl, '_blank');
  };

  const sendDirectEmail = () => {
    const emailBody = `
New Questionnaire Submission Request

Please send me the questionnaire form.

Best regards,
[Your Name]
    `;
    
    const mailtoLink = `mailto:your-email@example.com?subject=Questionnaire Request&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      alert('Please enter your email address');
      return;
    }
    
    try {
      if (submissionMethod === 'email') {
        await sendToEmail(formData);
        alert('Thank you! Your questionnaire has been submitted. An email will be sent to you shortly.');
      } else if (submissionMethod === 'typeform') {
        redirectToTypeform();
        return; // Don't redirect to home page
      } else if (submissionMethod === 'googleforms') {
        redirectToGoogleForms();
        return; // Don't redirect to home page
      } else if (submissionMethod === 'direct') {
        sendDirectEmail();
        return; // Don't redirect to home page
      }
      router.push('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your questionnaire. Please try again.');
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Questionnaire</h1>
          <p className="mt-2 text-sm text-gray-600">
            Help us understand your project's objectives and requirements
          </p>
        </div>

        {/* Submission Method Selection */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">How would you like to submit your questionnaire?</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="email"
                  name="submissionMethod"
                  value="email"
                  checked={submissionMethod === 'email'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'email')}
                />
                <Label htmlFor="email">Submit via Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="typeform"
                  name="submissionMethod"
                  value="typeform"
                  checked={submissionMethod === 'typeform'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'typeform')}
                />
                <Label htmlFor="typeform">Use Typeform (External)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="googleforms"
                  name="submissionMethod"
                  value="googleforms"
                  checked={submissionMethod === 'googleforms'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'googleforms')}
                />
                <Label htmlFor="googleforms">Use Google Forms (External)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="direct"
                  name="submissionMethod"
                  value="direct"
                  checked={submissionMethod === 'direct'}
                  onChange={(e) => setSubmissionMethod(e.target.value as 'direct')}
                />
                <Label htmlFor="direct">Send Direct Email</Label>
              </div>
            </div>
          </div>
        </Card>

        {submissionMethod === 'typeform' ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Redirect to Typeform</h2>
              <p className="text-gray-600">
                You'll be redirected to our Typeform questionnaire. Please complete it there.
              </p>
              <Button
                onClick={redirectToTypeform}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Go to Typeform Questionnaire
              </Button>
            </div>
          </Card>
        ) : submissionMethod === 'googleforms' ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Redirect to Google Forms</h2>
              <p className="text-gray-600">
                You'll be redirected to our Google Forms questionnaire. Please complete it there.
              </p>
              <Button
                onClick={redirectToGoogleForms}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Go to Google Forms Questionnaire
              </Button>
            </div>
          </Card>
        ) : submissionMethod === 'direct' ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Send Direct Email</h2>
              <p className="text-gray-600">
                We'll send you the questionnaire form via email.
              </p>
              <Button
                onClick={sendDirectEmail}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Send Questionnaire Form
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              {/* Goals Section */}
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

              {/* Important Pages Section */}
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

              {/* Metrics Section */}
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

              {/* Call to Actions Section */}
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

              {/* User Interactions Section */}
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

              {/* Success Criteria Section */}
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
                Submit Questionnaire
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Questionnaire() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuestionnaireForm />
    </Suspense>
  );
} 