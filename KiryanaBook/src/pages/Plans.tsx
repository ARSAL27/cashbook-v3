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
      features: ['Unlimited Sales', 'Unlimited Customers', 'Unlimited Stock', 'Limited Staff (1 User)', 'Cloud Sync', 'Contains Ads'],
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
      features: ['Unlimited Sales', 'Unlimited Customers', 'Full Staff Management', 'Advanced Analytics', 'Cloud Sync', 'No Ads'],
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

  const handleUpgrade = (_planName: string) => {
    triggerHaptic(ImpactStyle.Heavy);
    navigate('/help');
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
              return (
                <motion.div 
                  key={plan.name} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-3xl border shadow-sm transition-all ${plan.color} ${isActive ? 'ring-2 ring-primary' : 'border-border'}`}
                >
                  {plan.badge && (
                    <div className="absolute top-4 right-6 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.accent} bg-card shadow-inner border border-border/50`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-text-primary uppercase tracking-tight leading-none mb-1">{plan.name}</h3>
                      <div className="flex items-baseline">
                        <span className={`text-xl font-black ${plan.accent}`}>{plan.price}</span>
                        <span className="text-text-muted text-[8px] ml-1 uppercase font-bold opacity-60">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center space-x-3">
                        <Check size={14} className={plan.accent} />
                        <span className="text-sm font-bold text-text-primary opacity-70">{f}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { triggerHaptic(); !isActive && handleUpgrade(plan.name); }}
                    disabled={isActive}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm ${
                      isActive 
                        ? 'bg-slate-100 text-text-muted cursor-default' 
                        : 'bg-primary text-white hover:brightness-105 active:scale-95'
                    }`}
                  >
                    {isActive ? 'Current Plan' : `Upgrade to ${plan.name}`}
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
