'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { ProjectCardSkeleton } from '@/components/ui/Skeletons';

export function FeaturedProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeaturedProjects(4)
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Our Work</span>
            <h2 className="section-title mt-4">Featured Projects</h2>
            <p className="section-subtitle mt-3">See how our premium stones transform Australian homes.</p>
          </motion.div>
          <Link href="/projects" className="text-stone-900 text-sm font-medium tracking-wider uppercase flex items-center gap-2 hover:text-accent-gold transition-colors">
            View All Projects <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
          ) : (
            projects.map((project, i) => (
              <motion.div
                key={project.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15 }} className={i === 0 ? 'md:row-span-2' : ''}
              >
                <Link href={`/projects/${project.slug}`} className="group relative block overflow-hidden bg-stone-200 h-full">
                  <div className={`w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${i === 0 ? 'h-full min-h-[500px]' : 'aspect-video'}`}
                    style={{ backgroundImage: `url('${project.images?.[0]?.url || ''}')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-2 text-accent-gold text-xs font-medium tracking-wider uppercase mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location?.suburb}, {project.location?.state}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl text-white mb-1">{project.name}</h3>
                    {project.applicationType?.[0] && (
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs tracking-wider uppercase mt-2">
                        {project.applicationType[0]}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
