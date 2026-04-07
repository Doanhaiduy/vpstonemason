'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Save, Check, Loader2, RotateCcw } from 'lucide-react';
import { adminApi } from '@/lib/api';

const defaultSystemPrompt = `You are an expert stone & design consultant for PVStone, a premium Australian kitchen stone showroom based in Melbourne.

Your role:
- Help customers choose the right stone for their project (kitchens, bathrooms, splashbacks)
- Provide expert advice on Marble, Granite, Quartz, Porcelain, CSF Stone, and Quartzite
- Explain differences between stone types, finishes, and care requirements
- Provide general pricing guidance (budget ranges, not exact quotes)
- Recommend visiting the showroom for the best experience

Rules:
- Be concise, professional, and friendly
- Only discuss topics related to stones, renovations, and the showroom
- If you don't know something specific, say: "I'd recommend contacting us directly at 0450 938 079 for detailed information."
- NEVER make up stone names, prices, or technical specifications
- For unrelated questions, politely redirect: "I'm specialised in stone & renovation advice. For that question, I'd suggest..."
- Always mention that a showroom visit is the best way to see and feel the stones`;

export default function AISettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    adminApi.getSettings(token).then((data: any) => {
      if (data?.aiSystemPrompt) setSystemPrompt(data.aiSystemPrompt);
      if (data?.aiEnabled !== undefined) setAiEnabled(data.aiEnabled);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.updateSettings(token, { aiSystemPrompt: systemPrompt, aiEnabled });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Configuration</h1>
            <p className="text-sm text-slate-600">Configure assistant behavior, boundaries and tone for customer conversations.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">AI Chat Widget</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-slate-600">{aiEnabled ? 'Enabled' : 'Disabled'}</span>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setAiEnabled(!aiEnabled)}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${aiEnabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} style={{ transform: aiEnabled ? 'translateX(22px)' : 'translateX(0)' }} />
              </div>
            </label>
          </div>
          <p className="text-sm text-slate-500">When enabled, a floating chat widget appears on all client pages. Requires <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> in environment.</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">System Prompt</h2>
            <button type="button" onClick={() => setSystemPrompt(defaultSystemPrompt)} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-4">This instruction is sent to the AI before every conversation. It controls the AI&apos;s personality, knowledge boundaries, and anti-hallucination rules.</p>
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={16}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono leading-relaxed outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          <p className="text-xs text-slate-400 mt-2">{systemPrompt.length} characters</p>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6">
          <h3 className="mb-2 font-semibold text-amber-900">Prompt Writing Tips</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Be specific about what the AI should and should NOT talk about</li>
            <li>• Include your phone number and address so the AI can refer customers</li>
            <li>• Add anti-hallucination rules: &quot;Never make up stone names or prices&quot;</li>
            <li>• Specify the tone: professional, friendly, casual, etc.</li>
            <li>• Mention your unique selling points for the AI to highlight</li>
          </ul>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:px-6 lg:pl-[19rem] lg:pr-8">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-600 sm:text-sm">Save these settings to update AI behavior across the website.</p>
            <div className="flex items-center gap-3">
              {saved && <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"><Check className="w-4 h-4" /> Saved</span>}
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save AI Config'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
