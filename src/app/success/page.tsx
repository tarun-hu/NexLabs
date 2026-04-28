'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20"
        >
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Submission Received!
        </h1>

        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          Our AI is analyzing your project requirements. You&apos;ll receive a detailed PRD and quote within 24 hours.
        </p>

        {submissionId && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/10">
            <p className="text-xs text-slate-500 mb-1">Submission ID</p>
            <p className="text-white font-mono text-sm">{submissionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/login"
            className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Create Account to Track Progress
          </Link>

          <Link
            href="/"
            className="block text-slate-500 hover:text-white transition-colors py-2"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
