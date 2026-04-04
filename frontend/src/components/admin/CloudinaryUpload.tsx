'use client';

import { useState } from 'react';
import { Link2, Plus, Upload, X, Loader2 } from 'lucide-react';

interface CloudinaryUploadProps {
  images: { url: string; alt: string }[];
  onChange: (images: { url: string; alt: string }[]) => void;
  max?: number;
  label?: string;
  folder?: string;
}

export function CloudinaryUpload({
  images,
  onChange,
  max = 10,
  label = 'Images',
  folder = 'vpstonemason',
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [manualUrl, setManualUrl] = useState('');

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const availableSlots = max - images.length;
    if (availableSlots <= 0) return;

    const files = Array.from(fileList).slice(0, availableSlots);
    setUploading(true);

    try {
      const nextImages = [...images];

      for (const file of files) {
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder }),
        });

        if (!signRes.ok) {
          throw new Error('Cloudinary signing failed');
        }

        const {
          cloudName,
          apiKey,
          timestamp,
          signature,
          folder: signedFolder,
        } = await signRes.json();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', signedFolder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Cloudinary upload failed');
        }

        const uploaded = await uploadRes.json();
        nextImages.push({
          url: uploaded.secure_url,
          alt: file.name.replace(/\.[^.]+$/, ''),
        });
      }

      onChange(nextImages);
    } catch {
      // Keep silent here; admins can still switch to URL mode and add links manually.
    } finally {
      setUploading(false);
    }
  };

  const addManualUrl = () => {
    const cleaned = manualUrl.trim();
    if (!cleaned) return;
    if (images.length >= max) return;

    onChange([
      ...images,
      {
        url: cleaned,
        alt: cleaned.split('/').pop()?.replace(/\.[^.]+$/, '') || '',
      },
    ]);
    setManualUrl('');
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const updateAlt = (index: number, alt: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], alt };
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url('${img.url}')` }} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={img.alt}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text..."
                className="w-full px-2 py-1.5 text-xs border-t border-slate-200 outline-none focus:bg-indigo-50"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Image Controls */}
      {images.length < max && mode === 'upload' && (
        <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all w-full justify-center cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/*"
            multiple={max > 1}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.currentTarget.value = '';
            }}
          />
        </label>
      )}

      {images.length < max && mode === 'url' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            onClick={addManualUrl}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-1">
        Choose Upload to send files to Cloudinary, or URL to paste links directly.
      </p>
    </div>
  );
}
