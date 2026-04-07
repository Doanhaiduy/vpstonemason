'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ChevronLeft } from 'lucide-react';
import { shouldUnoptimizeImage } from '@/lib/image';

export function ProjectDetailClient({ project }: { project: any }) {
  if (!project) return null;

  return (
    <>
      <section className="pt-24 pb-4 bg-white border-b border-stone-100">
        <div className="container-custom">
          <Link href="/projects" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-accent-gold text-sm tracking-wider uppercase mb-4">
                <MapPin className="w-4 h-4" />
                {project.location?.suburb}, {project.location?.state}
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-stone-900 mb-6">{project.name}</h1>
              {project.applicationType?.length > 0 && (
                <div className="flex gap-2 mb-8">
                  {project.applicationType.map((t: string) => (
                    <span key={t} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Gallery Grid */}
            {project.images?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {project.images.map((img: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`overflow-hidden bg-stone-200 ${i === 0 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'}`}>
                    <div className="relative w-full h-full hover:scale-105 transition-transform duration-700">
                      <Image
                        src={img.url}
                        alt={`${project.name} image ${i + 1}`}
                        fill
                        sizes={i === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 50vw, 100vw'}
                        className="object-cover"
                        unoptimized={shouldUnoptimizeImage(img.url)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {project.description && (
              <div className="prose max-w-none mb-12">
                <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">{project.description}</p>
              </div>
            )}

            {project.stoneIds?.length > 0 && (
              <div className="mb-12 p-8 bg-stone-50">
                <h3 className="font-display text-2xl text-stone-900 mb-4">Products Used</h3>
                <div className="flex flex-wrap gap-3">
                  {project.stoneIds.map((s: any) => (
                    <Link key={s.slug || s._id} href="/catalog" className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:border-accent-gold hover:text-accent-gold transition-colors">
                      {s.title || s.name} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {project.testimonial?.text && (
              <div className="bg-stone-900 text-white p-10 md:p-14">
                <div className="flex gap-1 mb-4">
                  {[...Array(project.testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent-gold fill-accent-gold" />
                  ))}
                </div>
                <blockquote className="font-display text-xl md:text-2xl leading-relaxed mb-6 text-white/90">
                  &ldquo;{project.testimonial.text}&rdquo;
                </blockquote>
                <cite className="text-stone-400 not-italic">— {project.testimonial.clientName}</cite>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
