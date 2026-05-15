"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="bg-mesh fixed inset-0 opacity-20" />
      <div className="bg-noise fixed inset-0 opacity-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 text-center relative z-10"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong</h2>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. We've been notified and are looking into it.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            Try again
          </button>
          
          <Link href="/" className="btn-secondary w-full flex items-center justify-center gap-2">
            <Home size={18} />
            Back to Home
          </Link>
        </div>
        
        {error.digest && (
          <p className="mt-6 text-xs text-gray-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
