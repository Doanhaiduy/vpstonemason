'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Check, Building2, Share2, Layout, Search, Loader2, CircleHelp } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { openAdminPreview } from '@/lib/admin-preview';
import { toGoogleMapsEmbedUrl } from '@/lib/google-maps';

export default function ShowroomSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('company');
  const [form, setForm] = useState({
    companyName: '', tagline: '', phone: '', secondaryPhone: '', email: '', abn: '',
    street: '', suburb: '', state: '', postcode: '',
    heroTitle: '', heroSubtitle: '', heroCta1Text: '', heroCta1Link: '', heroCta2Text: '', heroCta2Link: '',
    aboutShort: '',
    facebook: '', instagram: '', pinterest: '', youtube: '',
    googleMapsEmbed: '',
    seoMetaTitle: '', seoMetaDescription: '', seoOgImage: '', seoKeywords: '',
    footerTagline: '', copyrightText: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    adminApi.getSettings(token).then((data: any) => {
      if (data) setForm({
        companyName: data.companyName || '', tagline: data.tagline || '',
        phone: data.phone || '', secondaryPhone: data.secondaryPhone || '', email: data.email || '', abn: data.abn || '',
        street: data.address?.street || '', suburb: data.address?.suburb || '', state: data.address?.state || '', postcode: data.address?.postcode || '',
        heroTitle: data.heroTitle || '', heroSubtitle: data.heroSubtitle || '',
        heroCta1Text: data.heroCta1Text || '', heroCta1Link: data.heroCta1Link || '',
        heroCta2Text: data.heroCta2Text || '', heroCta2Link: data.heroCta2Link || '',
        aboutShort: data.aboutShort || '',
        facebook: data.socialLinks?.facebook || '', instagram: data.socialLinks?.instagram || '',
        pinterest: data.socialLinks?.pinterest || '', youtube: data.socialLinks?.youtube || '',
        googleMapsEmbed: data.googleMapsEmbed || '',
        seoMetaTitle: data.seoSettings?.metaTitle || '', seoMetaDescription: data.seoSettings?.metaDescription || '',
        seoOgImage: data.seoSettings?.ogImage || '', seoKeywords: (data.seoSettings?.keywords || []).join(', '),
        footerTagline: data.footerTagline || '', copyrightText: data.copyrightText || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'hero', label: 'Homepage', icon: Layout },
    { id: 'social', label: 'Social & Maps', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      await adminApi.updateSettings(token, {
        companyName: form.companyName, tagline: form.tagline, phone: form.phone,
        secondaryPhone: form.secondaryPhone, email: form.email, abn: form.abn,
        address: { street: form.street, suburb: form.suburb, state: form.state, postcode: form.postcode },
        heroTitle: form.heroTitle, heroSubtitle: form.heroSubtitle,
        heroCta1Text: form.heroCta1Text, heroCta1Link: form.heroCta1Link,
        heroCta2Text: form.heroCta2Text, heroCta2Link: form.heroCta2Link,
        aboutShort: form.aboutShort,
        socialLinks: { facebook: form.facebook, instagram: form.instagram, pinterest: form.pinterest, youtube: form.youtube },
        googleMapsEmbed: toGoogleMapsEmbedUrl(form.googleMapsEmbed),
        seoSettings: { metaTitle: form.seoMetaTitle, metaDescription: form.seoMetaDescription, ogImage: form.seoOgImage, keywords: form.seoKeywords.split(',').map(k => k.trim()).filter(Boolean) },
        footerTagline: form.footerTagline, copyrightText: form.copyrightText,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Error saving settings'); }
    finally { setSaving(false); }
  };

  const handleContactPreview = () => {
    openAdminPreview('/contact', 'contact', {
      phone: form.phone,
      email: form.email,
      address: {
        street: form.street,
        suburb: form.suburb,
        state: form.state,
        postcode: form.postcode,
      },
      googleMapsEmbed: toGoogleMapsEmbedUrl(form.googleMapsEmbed),
    });
  };

  const u = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100';
  const sectionCardClass = 'rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm';

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage company profile, homepage copy, social links and SEO in one place.</p>
        <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-xs text-slate-600">
          <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <span>Priority order: Database -&gt; Config file -&gt; Hardcoded defaults.</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {activeTab === 'company' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={sectionCardClass}>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label><input type="text" value={form.companyName} onChange={e => u('companyName', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline</label><input type="text" value={form.tagline} onChange={e => u('tagline', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Phone</label><input type="text" value={form.phone} onChange={e => u('phone', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => u('email', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Secondary Phone</label><input type="text" value={form.secondaryPhone} onChange={e => u('secondaryPhone', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">ABN</label><input type="text" value={form.abn} onChange={e => u('abn', e.target.value)} className={inputClass} /></div>
              </div>
            </div>
            <div className={sectionCardClass}>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Street</label><input type="text" value={form.street} onChange={e => u('street', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Suburb</label><input type="text" value={form.suburb} onChange={e => u('suburb', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">State</label><input type="text" value={form.state} onChange={e => u('state', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Postcode</label><input type="text" value={form.postcode} onChange={e => u('postcode', e.target.value)} className={inputClass} /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className={`${sectionCardClass} space-y-4 lg:col-span-3`}>
              <h2 className="text-base font-semibold text-slate-900">Hero Section</h2>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Title</label><input type="text" value={form.heroTitle} onChange={e => u('heroTitle', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Subtitle</label><textarea value={form.heroSubtitle} onChange={e => u('heroSubtitle', e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA 1 Text</label><input type="text" value={form.heroCta1Text} onChange={e => u('heroCta1Text', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA 1 Link</label><input type="text" value={form.heroCta1Link} onChange={e => u('heroCta1Link', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA 2 Text</label><input type="text" value={form.heroCta2Text} onChange={e => u('heroCta2Text', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA 2 Link</label><input type="text" value={form.heroCta2Link} onChange={e => u('heroCta2Link', e.target.value)} className={inputClass} /></div>
              </div>
            </div>
            <div className={`${sectionCardClass} lg:col-span-2`}>
              <h2 className="text-base font-semibold text-slate-900 mb-4">About (Homepage Summary)</h2>
              <textarea value={form.aboutShort} onChange={e => u('aboutShort', e.target.value)} rows={7} className={`${inputClass} resize-none`} />
              <p className="mt-2 text-xs text-slate-500">Use 1-2 concise lines that explain your showroom value.</p>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className={`${sectionCardClass} lg:col-span-3`}>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Social Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Facebook</label><input type="url" value={form.facebook} onChange={e => u('facebook', e.target.value)} placeholder="https://facebook.com/..." className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Instagram</label><input type="url" value={form.instagram} onChange={e => u('instagram', e.target.value)} placeholder="https://instagram.com/..." className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Pinterest</label><input type="url" value={form.pinterest} onChange={e => u('pinterest', e.target.value)} placeholder="https://pinterest.com/..." className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">YouTube</label><input type="url" value={form.youtube} onChange={e => u('youtube', e.target.value)} placeholder="https://youtube.com/..." className={inputClass} /></div>
              </div>
            </div>
            <div className={`${sectionCardClass} lg:col-span-2`}>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Google Maps</h2>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Maps Embed URL</label>
                <input type="url" value={form.googleMapsEmbed} onChange={e => u('googleMapsEmbed', e.target.value)} placeholder="https://maps.google.com/maps?q=..." className={inputClass} />
                <p className="text-xs text-slate-400 mt-1.5">Paste the embed URL from Google Maps → Share → Embed</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className={`${sectionCardClass} space-y-4`}>
            <h2 className="text-base font-semibold text-slate-900">SEO Settings</h2>
            <p className="text-sm text-slate-500">Override default SEO metadata. Leave blank to use defaults.</p>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
              <input type="text" value={form.seoMetaTitle} onChange={e => u('seoMetaTitle', e.target.value)} placeholder="Leave blank for default" className={inputClass} />
              <p className="text-xs text-slate-400 mt-1">{form.seoMetaTitle.length}/60 characters</p></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
              <textarea value={form.seoMetaDescription} onChange={e => u('seoMetaDescription', e.target.value)} rows={2} placeholder="Leave blank for default" className={`${inputClass} resize-none`} />
              <p className="text-xs text-slate-400 mt-1">{form.seoMetaDescription.length}/160 characters</p></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Keywords</label>
              <input type="text" value={form.seoKeywords} onChange={e => u('seoKeywords', e.target.value)} placeholder="keyword1, keyword2" className={inputClass} /></div>
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:px-6 lg:pl-[19rem] lg:pr-8">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-600 sm:text-sm">Save to publish these settings across your website.</p>
            <div className="flex items-center gap-3">
              {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><Check className="w-4 h-4" /> Saved</span>}
              <button
                type="button"
                onClick={handleContactPreview}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
              >
                <Eye className="h-4 w-4" /> Preview Contact
              </button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
