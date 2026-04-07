'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const PROJECT_TYPE_OPTIONS = [
  { value: 'Kitchen Benchtop', label: 'Kitchen Benchtop' },
  { value: 'Bathroom Vanity', label: 'Bathroom Vanity' },
  { value: 'Splashback', label: 'Splashback' },
  { value: 'Laundry', label: 'Laundry' },
  { value: 'Outdoor Kitchen', label: 'Outdoor Kitchen' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: 'Under $3,000', label: 'Under $3,000' },
  { value: '$3,000 – $5,000', label: '$3,000 – $5,000' },
  { value: '$5,000 – $10,000', label: '$5,000 – $10,000' },
  { value: '$10,000 – $20,000', label: '$10,000 – $20,000' },
  { value: '$20,000+', label: '$20,000+' },
];

export function ContactFormClient() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isPreview = searchParams.get('preview') === '1';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', suburb: '',
    projectType: '', budgetRange: '', message: '',
  });

  const u = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitEnquiry({
        ...form,
        source: 'contact',
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-20 bg-stone-50 p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h3 className="font-display text-3xl text-stone-900 mb-3">Thank You!</h3>
        <p className="text-stone-500 text-lg">We&apos;ve received your message and will be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
          <input type="text" required value={form.name} onChange={e => u('name', e.target.value)} placeholder="Your full name" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={e => u('email', e.target.value)} placeholder="your@email.com" className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={e => u('phone', e.target.value)} placeholder="04xx xxx xxx" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Suburb</label>
          <input type="text" value={form.suburb} onChange={e => u('suburb', e.target.value)} placeholder="Your suburb" className="input-field" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Project Type</label>
          <Select
            value={form.projectType}
            onValueChange={(value) => u('projectType', value)}
            options={PROJECT_TYPE_OPTIONS}
            variant="client"
            placeholder="Select type"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Budget Range</label>
          <Select
            value={form.budgetRange}
            onValueChange={(value) => u('budgetRange', value)}
            options={BUDGET_OPTIONS}
            variant="client"
            placeholder="Select budget"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Message *</label>
        <textarea required value={form.message} onChange={e => u('message', e.target.value)} rows={5} placeholder="Tell us about your project..." className="input-field resize-none" />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto" variant="clientGold" size="lg">
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
