'use client';

import { useCallback, useState } from 'react';
import { Image as ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react';

interface AdminImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
}

export function AdminImageField({
  label,
  value,
  onChange,
  placeholder = 'https://.../image.jpg',
  folder = 'vpstonemason',
}: AdminImageFieldProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);

  const getCloudinarySignature = useCallback(
    async (targetFolder: string) => {
      const payload = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: targetFolder }),
      };

      // Prefer backend /api route, then fallback to frontend route when /api is proxied away.
      const primary = await fetch('/api/cloudinary/sign', payload);
      const response = primary.ok
        ? primary
        : await fetch('/cloudinary/sign', payload);

      if (!response.ok) {
        throw new Error('Cloudinary signing failed');
      }

      return response.json();
    },
    [],
  );

  const uploadFile = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setUploading(true);
      try {
        const { cloudName, apiKey, timestamp, signature, folder: signedFolder } =
          await getCloudinarySignature(folder);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', signedFolder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          throw new Error('Cloudinary upload failed');
        }

        const uploaded = await uploadRes.json();
        onChange(uploaded.secure_url || '');
      } catch {
        // If upload fails, users can switch to URL mode and paste links directly.
      } finally {
        setUploading(false);
      }
    },
    [folder, getCloudinarySignature, onChange],
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'url'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === 'upload' && (
        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void uploadFile(e.target.files?.[0] || null);
              e.currentTarget.value = '';
            }}
          />
        </label>
      )}

      <div className="relative">
        <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={`Clear ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${value}')` }}
          />
        </div>
      ) : (
        <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
          No image selected
        </div>
      )}
    </div>
  );
}
