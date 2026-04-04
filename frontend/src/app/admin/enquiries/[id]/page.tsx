'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mail, Phone, MapPin, Clock, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/api';

const statusOptions = ['new', 'in_progress', 'completed', 'archived'];
const statusColors: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700', in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600', archived: 'bg-slate-50 text-slate-400',
};

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    adminApi.getEnquiry(token, id as string)
      .then(data => { setEnquiry(data); setStatus(data.status || 'new'); setNotes(data.internalNotes || ''); })
      .catch(() => router.push('/admin/enquiries'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.updateEnquiry(token, id as string, { status, internalNotes: notes });
      alert('Updated successfully');
    } catch { alert('Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  if (!enquiry) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/enquiries" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiry from {enquiry.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{new Date(enquiry.createdAt).toLocaleString('en-AU')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" /><div><p className="text-xs text-slate-400">Email</p><a href={`mailto:${enquiry.email}`} className="text-sm text-indigo-600 hover:underline">{enquiry.email}</a></div></div>
            {enquiry.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" /><div><p className="text-xs text-slate-400">Phone</p><a href={`tel:${enquiry.phone}`} className="text-sm text-slate-900">{enquiry.phone}</a></div></div>}
            {enquiry.suburb && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" /><div><p className="text-xs text-slate-400">Suburb</p><p className="text-sm text-slate-900">{enquiry.suburb}</p></div></div>}
            {enquiry.projectType && <div><p className="text-xs text-slate-400">Project Type</p><p className="text-sm text-slate-900">{enquiry.projectType}</p></div>}
            {enquiry.budgetRange && <div><p className="text-xs text-slate-400">Budget</p><p className="text-sm text-slate-900">{enquiry.budgetRange}</p></div>}
            {(enquiry.stoneName || enquiry.stoneId?.title || enquiry.stoneId?.name) && (
              <div>
                <p className="text-xs text-slate-400">Stone of Interest</p>
                <p className="text-sm text-slate-900 font-medium">{enquiry.stoneName || enquiry.stoneId?.title || enquiry.stoneId?.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Message</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Manage</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all capitalize ${status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add private notes about this enquiry..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
