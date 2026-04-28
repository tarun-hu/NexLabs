'use client';

import useSWR from 'swr';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, string> = {
  lead: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  discovery: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const allStatuses = ['lead', 'discovery', 'quoted', 'active', 'completed', 'archived', 'rejected'];

interface QuoteModalProps {
  project: Record<string, unknown>;
  onClose: () => void;
  onSave: () => void;
}

function QuoteModal({ project, onClose, onSave }: QuoteModalProps) {
  const [amount, setAmount] = useState(project.quote_amount ? String((project.quote_amount as number) / 100) : '');
  const [notes, setNotes] = useState((project.quote_notes as string) || '');
  const [status, setStatus] = useState((project.status as string) || 'lead');
  const [saving, setSaving] = useState(false);

  const handleSave = async (overrideStatus?: string) => {
    setSaving(true);
    const finalStatus = overrideStatus || status;
    if (overrideStatus) setStatus(overrideStatus);

    try {
      const res = await fetch('/api/admin/update-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          quote_amount: amount ? Math.round(parseFloat(amount) * 100) : undefined,
          quote_notes: notes || undefined,
          status: finalStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update');
        return;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-6">Update Project</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Quote Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Quote Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Explain the quote..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave('rejected')}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex-[2] px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: projects, error, mutate } = useSWR('/api/admin/projects', fetcher);
  const [selectedProject, setSelectedProject] = useState<Record<string, unknown> | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 text-xl font-semibold mb-2">Access Denied</p>
          <p className="text-slate-500 mb-4">Admin access required</p>
          <Link href="/dashboard" className="text-purple-400 hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const filteredProjects = projects && Array.isArray(projects)
    ? filterStatus === 'all'
      ? projects
      : projects.filter((p: Record<string, unknown>) => p.status === filterStatus)
    : [];

  const statusCounts = projects && Array.isArray(projects)
    ? allStatuses.reduce((acc, s) => {
        acc[s] = projects.filter((p: Record<string, unknown>) => p.status === s).length;
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="bg-white/[0.02] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold">
                Nex<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Labs</span>
              </span>
            </Link>
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-md border border-purple-500/20">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-slate-500">Manage all projects, update quotes, and track pipeline</p>
        </motion.div>

        {/* Status summary cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterStatus === 'all'
                ? 'bg-white/5 border-white/20'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
            }`}
          >
            <p className="text-2xl font-bold">{projects?.length || 0}</p>
            <p className="text-xs text-slate-500">All</p>
          </button>
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`p-3 rounded-xl border text-center transition-all ${
                filterStatus === s
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <p className="text-2xl font-bold">{statusCounts[s] || 0}</p>
              <p className="text-xs text-slate-500 capitalize">{s}</p>
            </button>
          ))}
        </div>

        {/* Projects Table */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {typeof error === 'object' && error.message ? error.message : 'Failed to load projects.'}
          </div>
        ) : !projects ? (
          <div className="text-center py-12 text-slate-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No projects {filterStatus !== 'all' ? `with status "${filterStatus}"` : 'found'}.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project: Record<string, unknown>, index: number) => (
              <motion.div
                key={project.id as string}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white/[0.02] rounded-xl border border-white/5 p-5 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/dashboard/${project.id}`}
                        className="text-lg font-semibold hover:text-purple-400 transition-colors truncate"
                      >
                        {project.title as string}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${statusColors[project.status as string] || statusColors.lead}`}>
                        {project.status as string}
                      </span>
                      {!!project.ai_generated_prd && (
                        <span className="text-xs text-purple-400">🤖 PRD</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{project.idea_summary as string}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                      <span>{project.vertical as string}</span>
                      <span>•</span>
                      <span>{project.budget_range as string}</span>
                      <span>•</span>
                      <span>{project.timeline as string}</span>
                      <span>•</span>
                      <span>{new Date(project.created_at as string).toLocaleDateString()}</span>
                      {!!(project as Record<string, unknown>).users && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400">
                            {((project as Record<string, unknown>).users as Record<string, unknown>)?.email as string || 'Unlinked'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {project.quote_amount ? (
                      <span className="text-green-400 font-semibold text-sm">
                        ${((project.quote_amount as number) / 100).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-sm">No quote</span>
                    )}
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/dashboard/${project.id}`}
                      className="px-4 py-2 bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      <AnimatePresence>
        {selectedProject && (
          <QuoteModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onSave={() => mutate()}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
