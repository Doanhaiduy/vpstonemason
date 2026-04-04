'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';
import { api } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getAdminPreviewDraft } from '@/lib/admin-preview';

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

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const config = useSiteConfig();
  const isPreview = searchParams.get('preview') === '1';

  const viewConfig = useMemo(() => {
    if (!isPreview) {
      return config;
    }

    const previewDraft = getAdminPreviewDraft<any>('contact');
    if (!previewDraft) {
      return config;
    }

    return {
      ...config,
      phone: previewDraft.phone || config.phone,
      email: previewDraft.email || config.email,
      address: {
        ...config.address,
        ...(previewDraft.address || {}),
      },
      googleMapsEmbed: previewDraft.googleMapsEmbed || config.googleMapsEmbed,
    };
  }, [config, isPreview]);

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

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Get In Touch</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">Contact Us</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Have a question or ready to start your project? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl text-stone-900 mb-8">Let&apos;s Talk</h2>
              <div className="space-y-6 mb-10">
                <a href={`tel:${viewConfig.phone.replace(/\s+/g, '')}`} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 mb-0.5">Call Us</h4>
                    <p className="text-stone-500">{viewConfig.phone}</p>
                  </div>
                </a>
                <a href={`mailto:${viewConfig.email}`} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 mb-0.5">Email Us</h4>
                    <p className="text-stone-500">{viewConfig.email}</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 mb-0.5">Visit Our Showroom</h4>
                    <p className="text-stone-500">{viewConfig.address.street}<br />{viewConfig.address.suburb} {viewConfig.address.state} {viewConfig.address.postcode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 mb-0.5">Opening Hours</h4>
                    {viewConfig.openingHours.map(h => (
                      <p key={h.day} className="text-stone-500 text-sm">{h.day}: {h.closed ? 'Closed' : `${h.open} – ${h.close}`}</p>
                    ))}
                  </div>
                </div>
              </div>
              <a href={`tel:${viewConfig.phone.replace(/\s+/g, '')}`} className="btn-gold w-full lg:hidden mb-8">
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-stone-50 p-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h3 className="font-display text-3xl text-stone-900 mb-3">Thank You!</h3>
                  <p className="text-stone-500 text-lg">We&apos;ve received your message and will be in touch within 24 hours.</p>
                </motion.div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="h-[400px] bg-stone-200">
        <iframe src={viewConfig.googleMapsEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
      </section>
    </>
  );
}
