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

  // Real-shopkeeper FAQs — covering the actual day-to-day problems we see
  // (negative stock, customer payments, multi-device sync, data loss fears,
  // restock confusion, profit-margin questions). Reordered: most-asked first.
  const faqs = [
    {
      q: 'Stock minus (-) ho gaya hai. Kya karoon?',
      a: 'Iska matlab aapne sale tab record ki jab stock pehle hi 0 tha. Stock page par jaayein, woh item kholein, "Adjust Stock" karein aur sahi quantity daalein. Naya update se yeh check automatic ho gaya hai.'
    },
    {
      q: 'Sale ki jagah ghalti se Udhaar likh diya. Theek kaise karoon?',
      a: 'Customer Detail page par jaayein, us transaction ko long-press karein, "Edit" select karein. Agar amount sahi hai sirf type ghalat hai, customer ke account mein opposite entry add karein.'
    },
    {
      q: 'Aaj ka sahi profit kaise pata chalega?',
      a: 'Reports page par "Profit & Loss" section dekhein. Yeh aapki Total Sale - Cost of Goods Sold (purchase price × qty) - Expenses ka sahi calculation karta hai. Dashboard sirf sale dikhata hai, profit nahi.'
    },
    {
      q: 'Customer ne paisa diya. Khaate mein kaise add karoon?',
      a: 'Khata page → customer kholein → "+ Payment Received" button. Amount aur note add karein. Total udhaar khud-ba-khud kam ho jayega. Receipt WhatsApp par bhej sakte hain.'
    },
    {
      q: 'Naye supplier se maal aaya. Stock kaise badhaayen?',
      a: '"Stock Receive" page se add karein — yeh existing item ki quantity mein **safely add** karta hai (overwrite nahi). Nayi item ho to "Add Item" use karein.'
    },
    {
      q: 'Internet nahi hai. Data save hoga?',
      a: 'Haan. App offline kaam karta hai — saari entries phone mein cache hoti hain aur internet aate hi automatically cloud par sync ho jaati hain. Sync status header mein dikhta hai.'
    },
    {
      q: 'Multiple phones par same shop data chahiye',
      a: 'Same Google account se login karein dono phones par. Cloud sync automatic hai. Lekin ek waqt mein sirf ek device se sale enter karein — concurrent edits par zyaada-recent jeetegi.'
    },
    {
      q: 'Phone kho gaya. Mera data safe hai?',
      a: 'Bilkul safe. Saara data Firebase cloud par hai, sirf app uninstall ya phone reset se kuch nahi hota. Naye phone par Google login karein, saara data wapis aa jayega.'
    },
    {
      q: 'PDF report download karne par font tooti dikh rahi hai',
      a: 'Reports → "Download Report" use karein (yeh proper formatted PDF hai). Settings ka "Full Audit PDF" sirf raw data dump hai — zyaada presentable nahi.'
    },
    {
      q: 'Naya category add nahi kar pa raha',
      a: 'Stock page par categories bar ke right side mein "+" icon dabaayein. Naam likhein. Agar yeh "category already exists" bole to woh pehle se hai, aur active items ke liye automatically dikhega.'
    },
    {
      q: 'Customer ko WhatsApp reminder kaise bhejein?',
      a: 'Khata → customer kholein → top par WhatsApp icon. Phone number contact mein save hona chahiye. Reminder message automatic bani hui hoti hai, sirf send dabaayein.'
    },
    {
      q: 'Discount lagaya lekin total mein zyaada ho gaya',
      a: 'Sale screen par discount input mein sirf number daalein (Rs. nahi). Agar discount subtotal se zyaada ho jaaye to system block kar dega. Percent discount ke liye khud calculate karna hoga abhi.'
    },
  ];

  return (
    <PageTransition> <div className="w-full bg-background font-outfit ">
        {/* HEADER */}
        <header className="pt-page pb-3 shrink-0 flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-sticky border-b border-border/10">
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
                  window.location.href = 'mailto:supportkiryanabook@gmail.com';
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
                  {/* Bumped from text-[10px] uppercase (unreadable) → text-[13px] sentence-case */}
                  <summary className="p-4 font-bold text-[13px] text-text-primary flex items-center justify-between list-none leading-snug">
                    <span className="max-w-[88%]">{faq.q}</span>
                    <ChevronRight size={16} className="text-text-muted opacity-40 group-open:rotate-90 transition-transform shrink-0" strokeWidth={2.5} />
                  </summary>
                  <div className="px-4 pb-4 text-text-muted text-[12px] leading-relaxed border-t border-border/5 pt-3 font-medium opacity-90">
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
