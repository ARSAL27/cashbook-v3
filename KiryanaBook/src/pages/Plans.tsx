import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, Check, Zap, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useShop();
  const currentPlan = (profile?.plan || 'free').toLowerCase();

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₨ 0',
      period: '/month',
      color: 'bg-card border-border',
      accent: 'text-text-muted',
      icon: Star,
      features: ['Unlimited Sales', 'Unlimited Customers', 'Unlimited Stock', 'Digital Assistant Chat', 'Cloud Sync', 'Contains Ads'],
    },
    {
      id: 'business',
      name: 'Business',
      price: '₨ 2999',
      period: '/month',
      color: 'bg-primary/5 border-primary/20',
      accent: 'text-primary',
      icon: Zap,
      badge: 'POPULAR',
      features: ['Unlimited Sales', 'Unlimited Customers', 'Full Staff Management', 'Digital Assistant Chat', 'Voice Entry Support', 'No Ads'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₨ 5499',
      period: '/month',
      color: 'bg-secondary/5 border-secondary/20',
      accent: 'text-secondary',
      icon: Crown,
      badge: 'ENTERPRISE',
      features: ['Multi-Shop Support', 'Inventory Mastery', 'Daily PDF Exports', 'Priority 24/7 Support', 'Custom Branding', 'Voice Entry Support'],
    },
  ];

  const handleUpgrade = (planName: string) => {
    triggerHaptic(ImpactStyle.Heavy);
    const msg = encodeURIComponent(`Assalam o Alaikum! I want to upgrade my shop *${profile?.name || 'KiryanaBook'}* to the *${planName} Plan*. Please guide me about the payment process.`);
    window.open(`https://wa.me/923000000000?text=${msg}`, '_blank');
  };

  return (
    <PageTransition>
      <div className="w-full bg-background pb-8 font-outfit">
        {/* HEADER */}
        <header className="shrink-0 sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
             <button onClick={() => { triggerHaptic(); navigate(-1); }} className="p-2 text-text-muted hover:text-text-primary transition-colors">
               <ArrowLeft size={20} />
             </button>
             <h1 className="text-lg font-black text-text-primary tracking-tight">App Plans</h1>
          </div>
        </header>

        <div className="p-6 max-w-xl mx-auto space-y-8 mt-4">
          <div className="text-center">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">Upgrade Your Shop</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">Scale your business with ease</p>
          </div>

          <div className="space-y-6">
            {plans.map((plan, i) => {
              const isActive = currentPlan === plan.id;
              const Icon = plan.icon;
              const isBusiness = plan.id === 'business';
              const isPro = plan.id === 'pro';

              return (
                <motion.div 
                  key={plan.name} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-[2.5rem] border shadow-2xl transition-all ${
                    isActive ? 'ring-4 ring-primary/30 border-primary' : 'border-border/5'
                  } ${
                    isBusiness ? 'bg-gradient-to-br from-primary/10 via-card to-card' :
                    isPro ? 'bg-gradient-to-br from-secondary/10 via-card to-card' :
                    'bg-card'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${
                        isBusiness ? 'bg-primary text-white shadow-primary/20' : 'bg-secondary text-white shadow-secondary/20'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center space-x-5 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 ${
                        isBusiness ? 'bg-primary text-white' :
                        isPro ? 'bg-secondary text-white' :
                        'bg-card-secondary text-text-muted'
                    }`}>
                      <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 opacity-50">{plan.name} Plan</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-text-primary tracking-tight">{plan.price}</span>
                        <span className="text-[10px] font-bold text-text-muted opacity-40 uppercase tracking-widest leading-none">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 pl-1">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start space-x-3">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isBusiness ? 'bg-primary/10 text-primary' :
                            isPro ? 'bg-secondary/10 text-secondary' :
                            'bg-text-muted/10 text-text-muted'
                        }`}>
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[13px] font-bold text-text-primary opacity-80 leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { triggerHaptic(); !isActive && handleUpgrade(plan.name); }}
                    disabled={isActive}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl active:scale-[0.98] ${
                      isActive 
                        ? 'bg-text-muted/10 text-text-muted cursor-default' 
                        : isBusiness ? 'bg-primary text-white shadow-primary/30 hover:brightness-110' :
                          isPro ? 'bg-secondary text-white shadow-secondary/30 hover:brightness-110' :
                          'bg-text-primary text-background'
                    }`}
                  >
                    {isActive ? 'Active Plan' : isBusiness ? 'Switch to Business' : `Select ${plan.name}`}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
