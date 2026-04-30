'use client';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, string> = {
  lead: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  discovery: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const { data, error, mutate } = useSWR(id ? `/api/projects/${id}` : null, fetcher);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  // Redirect unauthenticated users inside useEffect (not during render)
  useEffect(() => {
    if (sessionStatus !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, sessionStatus, router]);

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load project</p>
          <Link href="/dashboard" className="text-purple-400 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading project...</div>
      </div>
    );
  }

  const { project, messages } = data;
  const prd = project?.ai_generated_prd;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    try {
      await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.trim() }),
      });
      setMessage('');
      mutate();
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="bg-white/[0.02] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project?.title || 'Project'}</h1>
              <p className="text-sm text-slate-500">{project?.vertical} • {project?.timeline}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[project?.status] || statusColors.lead}`}>
            {project?.status}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] rounded-2xl p-6 border border-white/5"
            >
              <h2 className="text-lg font-semibold mb-3">Project Summary</h2>
              <p className="text-slate-400 leading-relaxed">{project?.idea_summary}</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/[0.02] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Budget</p>
                  <p className="text-sm font-medium">{project?.budget_range}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Timeline</p>
                  <p className="text-sm font-medium">{project?.timeline}</p>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Vertical</p>
                  <p className="text-sm font-medium">{project?.vertical}</p>
                </div>
              </div>
            </motion.div>

            {/* AI-Generated PRD */}
            {prd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.02] rounded-2xl p-6 border border-white/5"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <h2 className="text-lg font-semibold">AI-Generated PRD</h2>
                </div>

                <div className="space-y-6">
                  {prd.problem_statement && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">Problem Statement</h3>
                      <p className="text-white">{prd.problem_statement}</p>
                    </div>
                  )}

                  {prd.target_user && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">Target User</h3>
                      <p className="text-white">{prd.target_user}</p>
                    </div>
                  )}

                  {prd.core_features && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Core Features</h3>
                      <ul className="space-y-2">
                        {prd.core_features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-white">
                            <span className="text-purple-400 mt-0.5">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {prd.recommended_stack && (
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Recommended Stack</p>
                        <p className="text-sm font-medium">{prd.recommended_stack}</p>
                      </div>
                    )}
                    {prd.complexity_score && (
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Complexity Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${(prd.complexity_score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{prd.complexity_score}/10</span>
                        </div>
                      </div>
                    )}
                    {prd.timeline_estimate && (
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Estimated Timeline</p>
                        <p className="text-sm font-medium">{prd.timeline_estimate}</p>
                      </div>
                    )}
                    {(prd.quote_range_low || prd.quote_range_high) && (
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">AI Quote Range</p>
                        <p className="text-sm font-medium text-green-400">
                          ${prd.quote_range_low?.toLocaleString()} - ${prd.quote_range_high?.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {prd.ai_features_suggested && prd.ai_features_suggested.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">AI Features Suggested</h3>
                      <div className="flex flex-wrap gap-2">
                        {prd.ai_features_suggested.map((feature: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-sm border border-purple-500/20">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prd.risks_and_considerations && prd.risks_and_considerations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Risks & Considerations</h3>
                      <ul className="space-y-1">
                        {prd.risks_and_considerations.map((risk: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-amber-400 mt-0.5">⚠️</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar — Chat & Quote */}
          <div className="space-y-6">
            {/* Official Quote (if set by admin) */}
            {project?.quote_amount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl p-6 border border-green-500/10"
              >
                <h3 className="text-sm font-medium text-slate-400 mb-2">Official Quote</h3>
                <p className="text-3xl font-bold text-green-400">
                  ${(project.quote_amount / 100).toLocaleString()}
                </p>
                {project.quote_notes && (
                  <p className="text-sm text-slate-400 mt-3">{project.quote_notes}</p>
                )}
              </motion.div>
            )}

            {/* Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col"
              style={{ maxHeight: '500px' }}
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="font-semibold">Messages</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                {messages && messages.length > 0 ? (
                  messages.map((msg: Record<string, unknown>) => (
                    <div
                      key={msg.id as string}
                      className={`${
                        msg.sender_id === session.user?.id
                          ? 'ml-8'
                          : 'mr-8'
                      }`}
                    >
                      <div
                        className={`rounded-xl p-3 text-sm ${
                          msg.sender_id === session.user?.id
                            ? 'bg-purple-500/10 border border-purple-500/20'
                            : 'bg-white/5 border border-white/5'
                        } ${msg.is_internal ? 'border-amber-500/20 bg-amber-500/5' : ''}`}
                      >
                        {!!msg.is_internal && (
                          <span className="text-xs text-amber-400 font-medium block mb-1">Internal Note</span>
                        )}
                        <p className="text-slate-300">{msg.content as string}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(msg.created_at as string).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-600 text-sm py-8">No messages yet</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-50"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
