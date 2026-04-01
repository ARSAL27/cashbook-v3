import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, MessageCircle, Mail, Book, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';

export const HelpSupport: React.FC = () => {
  const navigate = useNavigate();

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const faqs = [
    { q: 'How do I add a sale?', a: 'Go to the "Sale" button on Dashboard, pick items, adjust quantity, and select Hishab (Udhaar) or Cash.' },
    { q: 'How do I track Udhaar?', a: 'All Credit/Udhaar is in the "Manager" section. You can see total dues and send WhatsApp reminders to customers.' },
    { q: 'Can I use this on multiple phones?', a: 'Yes! Login with the same Google account on any phone to sync all your shop data instantly.' },
    { q: 'How to manage custom categories?', a: 'Go to "Stock", use the "+" pill in categories bar to add, or click an active category to delete it.' },
    { q: 'How can I get PDF reports?', a: 'Daily, Monthly and Yearly PDF reports are available in the "Manager" section for PRO members.' },
  ];

  return (
    <PageTransition>
      <div className="w-full bg-background pb-8 font-outfit">
        {/* HEADER */}
        <header className="shrink-0 flex items-center justify-between px-4 h-12 sticky top-0 bg-background/80 backdrop-blur-md z-40 border-b border-border/10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { triggerHaptic(); navigate(-1); }} 
              className="w-8 h-8 flex items-center justify-center text-text-muted bg-card-secondary border border-border rounded-lg active:scale-90 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-text-primary tracking-tight leading-none uppercase">Help & Support</h1>
              <p className="text-[6px] font-black text-primary uppercase tracking-[0.2em] mt-1 italic opacity-60">Customer Care</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </header>

        <div className="px-4 max-w-2xl mx-auto space-y-8 pt-6">
          {/* CONTACT OPTIONS */}
          <div className="grid grid-cols-2 gap-3">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { 
                  triggerHaptic(); 
                  window.open('https://wa.me/923343014737', '_blank');
                }} 
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10">
                   <MessageCircle size={18} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[7px] uppercase tracking-[0.2em] text-text-primary">Contact Us</span>
                <span className="text-[5px] font-black text-primary uppercase tracking-widest mt-1 opacity-40">WhatsApp</span>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { 
                  triggerHaptic(); 
                  window.location.href = 'mailto:support@kiryanabook.io';
                }} 
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-3 border border-primary/10">
                   <Mail size={18} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[7px] uppercase tracking-[0.2em] text-text-primary">Email Support</span>
                <span className="text-[5px] font-black text-primary uppercase tracking-widest mt-1 opacity-40">Direct Mail</span>
              </motion.button>
          </div>

          {/* FAQ SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                    <Book size={12} className="text-primary opacity-40" strokeWidth={3} />
                    <h2 className="text-[9px] font-black text-text-primary uppercase tracking-[0.3em]">Common Questions</h2>
                </div>
                <div className="w-6 h-[1px] bg-border/20" />
            </div>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <details 
                  key={i} 
                  className="group bg-card/40 border border-border rounded-2xl cursor-pointer hover:border-primary/20 transition-all shadow-sm overflow-hidden"
                >
                  <summary className="p-4 font-black text-[10px] text-text-primary flex items-center justify-between list-none tracking-tight uppercase">
                    <span className="max-w-[90%]">{faq.q}</span>
                    <ChevronRight size={14} className="text-text-muted opacity-20 group-open:rotate-90 transition-transform" strokeWidth={3} />
                  </summary>
                  <div className="px-4 pb-4 text-text-muted text-[9px] leading-relaxed border-t border-border/5 pt-3 font-medium uppercase tracking-tight opacity-70">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* SYSTEM INFO */}
          <div className="p-6 bg-card-secondary/30 border border-border/50 rounded-2xl text-center backdrop-blur-sm">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-text-muted opacity-40 mb-1.5 italic">Software v3.2.0 Stable</p>
            <div className="flex items-center justify-center space-x-1.5">
                <div className="w-1 h-1 rounded-full bg-primary/20" />
                <p className="text-[6px] font-bold text-text-muted uppercase tracking-[0.3em] opacity-20">© 2026 KiryanaBook Platform</p>
                <div className="w-1 h-1 rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
