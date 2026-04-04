'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, Layers, Gem, MessageSquare, ArrowUpRight, Plus, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

const statusColors: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ categories: 0, ranges: 0, products: 0, enquiries: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    Promise.all([
      adminApi.getCatalogItems(token, { type: 'category', limit: '1' }).catch(() => ({ pagination: { total: 0 } })),
      adminApi.getCatalogItems(token, { type: 'range', limit: '1' }).catch(() => ({ pagination: { total: 0 } })),
      adminApi.getCatalogItems(token, { type: 'product', limit: '1' }).catch(() => ({ pagination: { total: 0 } })),
      adminApi.getEnquiries(token, { limit: '5', sort: '-createdAt' }).catch(() => ({ data: [], pagination: { total: 0 } })),
    ]).then(([categories, ranges, products, enquiries]) => {
      setStats({
        categories: (categories as any).pagination?.total || 0,
        ranges: (ranges as any).pagination?.total || 0,
        products: (products as any).pagination?.total || 0,
        enquiries: (enquiries as any).pagination?.total || 0,
      });
      setRecentEnquiries((enquiries as any).data || []);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-100', link: '/admin/categories' },
    { label: 'Ranges', value: stats.ranges, icon: Layers, color: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-100', link: '/admin/ranges' },
    { label: 'Products', value: stats.products, icon: Gem, color: 'from-amber-500 to-amber-600', ring: 'ring-amber-100', link: '/admin/stones' },
    { label: 'Enquiries', value: stats.enquiries, icon: MessageSquare, color: 'from-violet-500 to-violet-600', ring: 'ring-violet-100', link: '/admin/enquiries' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Welcome back. Here is a snapshot of your showroom activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link href={stat.link} className="group block rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-sm ring-4 ${stat.ring}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No enquiries yet</td></tr>
                ) : recentEnquiries.map((eq: any) => (
                  <tr key={eq._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{eq.name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{eq.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusColors[eq.status] || statusColors.new}`}>
                        {(eq.status || 'new').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400">{new Date(eq.createdAt).toLocaleDateString('en-AU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          {[
            { href: '/admin/categories', icon: FolderOpen, label: 'Manage Categories', desc: 'Top level of catalog' },
            { href: '/admin/ranges', icon: Layers, label: 'Manage Ranges', desc: 'Middle level of catalog' },
            { href: '/admin/stones/create', icon: Gem, label: 'Add New Product', desc: 'Create a product under a range' },
          ].map(action => (
            <Link key={action.href} href={action.href} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{action.label}</h3>
                <p className="text-xs text-slate-400">{action.desc}</p>
              </div>
              <Plus className="w-4 h-4 text-slate-300 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
