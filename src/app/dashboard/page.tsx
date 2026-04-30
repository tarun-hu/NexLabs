'use client';

import useSWR from 'swr';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: projects, error, mutate } = useSWR('/api/projects', fetcher);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (projectId: string) => {
    if (!confirm('Are you sure you want to withdraw this project? This action cannot be undone.')) {
      return;
    }

    setWithdrawingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (res.ok) {
        mutate();
        alert('Project withdrawn successfully');
      } else {
        alert(result.error || 'Failed to withdraw project');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to withdraw project');
    } finally {
      setWithdrawingId(null);
    }
  };

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
          </div>
          <div className="flex items-center gap-4">
            {session.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <span className="text-sm text-slate-500">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-slate-500 mt-1">Track the progress of your submissions</p>
          </div>
          <Link
            href="/#scoping-form"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm"
          >
            New Project
          </Link>
        </motion.div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            Failed to load projects. Please try again.
          </div>
        ) : !projects || projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-500 mb-4">You haven&apos;t submitted any projects yet.</p>
            <Link
              href="/#scoping-form"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Submit Your Idea
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project: Record<string, unknown>, index: number) => (
              <motion.div
                key={project.id as string}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/dashboard/${project.id}`}
                  className="block bg-white/[0.02] rounded-2xl border border-white/5 p-6 hover:bg-white/[0.04] hover:border-purple-500/10 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold group-hover:text-purple-400 transition-colors">
                        {project.title as string}
                      </h3>
                      <p className="text-slate-500 mt-1 text-sm line-clamp-2">{project.idea_summary as string}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ml-4 ${statusColors[project.status as string] || statusColors.lead}`}>
                      {project.status as string}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {project.vertical as string}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {project.budget_range as string}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {project.timeline as string}
                    </span>
                  </div>

                  {!!project.ai_generated_prd && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-purple-400">
                        <span>🤖</span> PRD Generated
                      </span>
                      {!!(project.ai_generated_prd as Record<string, unknown>).complexity_score && (
                        <span className="text-slate-500">
                          Complexity: {(project.ai_generated_prd as Record<string, unknown>).complexity_score as number}/10
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleWithdraw(project.id as string);
                      }}
                      disabled={withdrawingId === project.id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawingId === project.id ? 'Withdrawing...' : 'Withdraw Project'}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
