'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DeveloperControlOverlay() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    to: '+919876543210',
    from: 'ICICI-BANK',
    body: 'Your secure banking OTP is 894321. Do not share this with anyone.',
    type: 'SMS'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('http://localhost:3001/api/v1/dev/simulate-carrier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to inject payload');
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-zinc-900 border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#00e680] hover:border-[#00e680]/50 transition-all duration-300 hover:scale-110 hover:rotate-[15deg] hover:shadow-[0_0_15px_rgba(0,230,128,0.2)] shadow-xl focus:outline-none focus:ring-2 focus:ring-[#00e680]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[400px] bg-[#181311] border-l border-zinc-700/50 shadow-2xl z-50 p-6 flex flex-col focus:outline-none"
              >
                <Dialog.Title className="font-display text-xl font-bold text-on-surface mb-2">
                  Dev Sandbox: Carrier Inject
                </Dialog.Title>
                <Dialog.Description className="text-sm text-on-surface-variant mb-6 font-mono">
                  Bypass Twilio ingress and inject mock payloads directly into the local Redis/Socket pipeline.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Type</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                      className="bg-zinc-900 border border-zinc-700/50 rounded-md p-2 text-sm focus:border-[#00e680] focus:ring-1 focus:ring-[#00e680] outline-none text-on-surface"
                    >
                      <option value="SMS">SMS</option>
                      <option value="EMAIL">EMAIL</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Recipient (+91)</label>
                    <input 
                      type="text"
                      value={formData.to}
                      onChange={e => setFormData(f => ({ ...f, to: e.target.value }))}
                      className="bg-zinc-900 border border-zinc-700/50 rounded-md p-2 text-sm focus:border-[#00e680] focus:ring-1 focus:ring-[#00e680] outline-none font-mono text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Sender ID</label>
                    <input 
                      type="text"
                      value={formData.from}
                      onChange={e => setFormData(f => ({ ...f, from: e.target.value }))}
                      className="bg-zinc-900 border border-zinc-700/50 rounded-md p-2 text-sm focus:border-[#00e680] focus:ring-1 focus:ring-[#00e680] outline-none font-mono text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Payload Body</label>
                    <textarea 
                      value={formData.body}
                      onChange={e => setFormData(f => ({ ...f, body: e.target.value }))}
                      className="bg-zinc-900 border border-zinc-700/50 rounded-md p-2 text-sm focus:border-[#00e680] focus:ring-1 focus:ring-[#00e680] outline-none font-mono flex-1 resize-none text-on-surface"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className={`mt-4 w-full py-3 rounded-md font-mono text-xs uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#00e680] ${
                      status === 'success' ? 'bg-[#00e680] text-[#002b18]' :
                      status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                      'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {status === 'loading' ? 'Injecting...' : status === 'success' ? 'Payload Sent' : status === 'error' ? 'Failed' : 'Fire Webhook'}
                  </button>
                </form>

                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00e680]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
