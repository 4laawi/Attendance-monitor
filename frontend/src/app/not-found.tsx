"use client";

import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="bg-mesh fixed inset-0 opacity-20" />
      <div className="bg-noise fixed inset-0 opacity-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-8 text-center relative z-10"
      >
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          <FileQuestion className="text-blue-500" size={32} />
        </div>
        
        <h2 className="text-3xl font-bold mb-2 text-white">404</h2>
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Page Not Found</h3>
        <p className="text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved to a new URL.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link href="/" className="btn-primary w-full flex items-center justify-center gap-2">
            <Home size={18} />
            Back to Home
          </Link>
          
          <button
            onClick={() => router.back()}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
