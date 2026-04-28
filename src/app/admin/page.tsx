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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07070a]/80 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f0f13] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
        
        <h2 className="text-2xl font-bold tracking-tight mb-6 relative z-10">Update Project</h2>

        <div className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Status</label>
            <div className="relative">
               <select
                 value={status}
                 onChange={(e) => setStatus(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer transition-all hover:border-white/20 shadow-inner"
               >
                 {allStatuses.map((s) => (
                   <option key={s} value={s} className="bg-slate-900">{s}</option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Quote Amount (USD)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all hover:border-white/20 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Quote Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Explain the quote, outline next steps..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none transition-all hover:border-white/20 shadow-inner leading-relaxed"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave('rejected')}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex-[2] px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
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
    <main className="min-h-screen bg-[#07070a] text-white flex flex-col font-sans selection:bg-purple-500/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-[#07070a]/80 backdrop-blur-xl border-b border-white/[0.05] shadow-lg shadow-black/50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-[1px] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[11px] flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  <span className="text-white font-bold text-lg relative z-10">N</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">
                  Nex<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Labs</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-0.5">Admin Workspace</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              Client View
              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-purple-500 transition-all group-hover:w-full" />
            </Link>
            <div className="h-6 w-[1px] bg-white/10" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-28 space-y-8">
            <div>
              <h2 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-bold mb-4 px-2">Overview</h2>
              <button
                onClick={() => setFilterStatus('all')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                    : 'bg-transparent border border-transparent text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <span className="font-medium">All Projects</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${filterStatus === 'all' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5'}`}>
                  {projects?.length || 0}
                </span>
              </button>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.15em] text-slate-500 font-bold mb-4 px-2">Pipelines</h2>
              <div className="space-y-1">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      filterStatus === s
                        ? `bg-white/[0.05] border border-white/10 text-white`
                        : 'bg-transparent border border-transparent text-slate-400 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusColors[s]?.split(' ')[0] || 'bg-slate-500'}`} />
                      <span className="font-medium capitalize">{s}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${filterStatus === s ? 'bg-white/10 text-white' : 'bg-white/5'}`}>
                      {statusCounts[s] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
              <p className="text-slate-400">Manage your active pipeline and client quotes.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-1 backdrop-blur-sm hidden md:flex">
               <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium shadow-sm">Table View</button>
               <button className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors">Kanban</button>
            </div>
          </div>

          <div className="bg-[#0f0f13] border border-white/[0.05] rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            {error ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Failed to load projects</h3>
                <p className="text-slate-400">{typeof error === 'object' && error.message ? error.message : 'Please try refreshing the page.'}</p>
              </div>
            ) : !projects ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Loading workspace...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                <p className="text-slate-400 max-w-sm mx-auto">There are no projects matching the current filter. Select &quot;All Projects&quot; to view the entire pipeline.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                      <th className="py-5 px-6 font-semibold text-xs uppercase tracking-wider text-slate-400 w-1/3">Project</th>
                      <th className="py-5 px-6 font-semibold text-xs uppercase tracking-wider text-slate-400">Client / Submitted</th>
                      <th className="py-5 px-6 font-semibold text-xs uppercase tracking-wider text-slate-400 text-right">Value</th>
                      <th className="py-5 px-6 font-semibold text-xs uppercase tracking-wider text-slate-400 text-center">Status</th>
                      <th className="py-5 px-6 font-semibold text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredProjects.map((project: Record<string, unknown>, i: number) => (
                      <motion.tr
                        key={project.id as string}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-5 px-6">
                          <Link href={`/dashboard/${project.id}`} className="block">
                            <div className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1 truncate flex items-center gap-2">
                              {project.title as string}
                              {!!project.ai_generated_prd && (
                                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20" title="AI PRD Generated">AI</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500 truncate max-w-[280px]">
                              {project.vertical as string} • {project.timeline as string}
                            </div>
                          </Link>
                        </td>
                        <td className="py-5 px-6">
                           <div className="text-sm text-slate-300 font-medium mb-1 truncate max-w-[200px]" title={((project as Record<string, unknown>).users as Record<string, unknown>)?.email as string || project.client_email as string}>
                             {((project as Record<string, unknown>).users as Record<string, unknown>)?.email as string || project.client_email as string || 'Unknown'}
                           </div>
                           <div className="text-xs text-slate-500">
                             {new Date(project.created_at as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="font-mono text-sm">
                            {project.quote_amount ? (
                               <span className="text-emerald-400 font-medium">${((project.quote_amount as number) / 100).toLocaleString()}</span>
                            ) : (
                               <span className="text-slate-500">—</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">{project.budget_range as string}</div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status as string] || statusColors.lead}`}>
                            {project.status as string}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 setSelectedProject(project);
                               }}
                               className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                               title="Edit Status & Quote"
                             >
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                               </svg>
                             </button>
                             <Link
                               href={`/dashboard/${project.id}`}
                               className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                               title="View Project Details"
                             >
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                               </svg>
                             </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
