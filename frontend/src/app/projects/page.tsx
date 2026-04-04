'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { ProjectCardSkeleton } from '@/components/ui/Skeletons';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then((res) => setProjects(res.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80')` }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Our Portfolio</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">Our Projects</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">Explore our completed projects across Australian homes and commercial spaces.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <motion.div key={project.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/projects/${project.slug}`} className="group block card-hover">
                    <div className="aspect-[4/3] bg-stone-200 overflow-hidden">
                      <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${project.images?.[0]?.url || ''}')` }} />
                    </div>
                    <div className="bg-white p-6">
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-accent-gold" />
                        {project.location?.suburb}, {project.location?.state}
                      </div>
                      <h3 className="font-display text-xl text-stone-900 mb-2 group-hover:text-accent-gold-dark transition-colors">{project.name}</h3>
                      {project.stoneIds?.[0] && (
                        <p className="text-sm text-stone-500">Stone: <span className="text-stone-700">{project.stoneIds[0].title || project.stoneIds[0].name}</span></p>
                      )}
                      {project.applicationType?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {project.applicationType.map((t: string) => (
                            <span key={t} className="px-2.5 py-0.5 bg-stone-50 text-stone-500 text-[11px] uppercase tracking-wider">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
