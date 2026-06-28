'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OtpQuickReadMatrixProps {
  otpValue: string;
}

export function OtpQuickReadMatrix({ otpValue }: OtpQuickReadMatrixProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otpValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full mb-4 rounded-xl border border-[#00e680]/30 bg-[#002b18]/40 p-5 relative overflow-hidden group"
      >
        {/* Background glow sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00e680]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e680] shadow-[0_0_8px_#00e680] animate-pulse" />
            <span className="font-mono text-[10px] text-[#00e680] uppercase tracking-widest">
              Verified OTP Target
            </span>
          </div>

          <div className="font-mono text-5xl md:text-6xl font-bold tracking-[0.2em] text-[#00e680] drop-shadow-[0_0_15px_rgba(0,230,128,0.5)]">
            {otpValue}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className={`mt-2 px-6 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e680] ${
              copied
                ? 'bg-[#00e680] text-[#002b18] border border-[#00e680]'
                : 'bg-[#00e680]/10 text-[#00e680] border border-[#00e680]/50 hover:bg-[#00e680]/20'
            }`}
          >
            {copied ? 'Extracted' : 'Copy OTP Only'}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
