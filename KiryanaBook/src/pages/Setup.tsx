import React, { useState } from 'react';
import { Store, User, ArrowLeft, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useShop();
    const { user, hasPasswordLinked, isPasswordRecorded } = useAuth();
  
    const [shopName, setShopName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
      Haptics.impact({ style }).catch(() => {});
    };
  
    const isFormValid = shopName.trim().length > 0 && ownerName.trim().length > 0;
  
    const handleSubmit = async () => {
      if (!isFormValid) return;
  
      if (!user?.email) {
        toast.error('Email address zaroori hai! Please dobara login karein.');
        return navigate('/login', { replace: true });
      }

      const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
      if (isGoogleUser && (!hasPasswordLinked || !isPasswordRecorded)) {
        toast.error('Pehle apna backup password set karein!');
        return navigate('/login', { replace: true });
      }
    setIsLoading(true);
    triggerHaptic(ImpactStyle.Medium);

    try {
      await updateProfile({
        name: shopName,
        owner: ownerName,
        phone: '00000000000', // Default placeholder
        city: 'Digital',
        currency: 'PKR'
      });

      localStorage.setItem('onboarding_complete', 'true');
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      toast.success('Ledger created successfully!');
      // Give Firestore a small window to sync the new record into memory
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (error) {
      toast.error('Failed to create ledger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col font-outfit max-w-md mx-auto pb-8">
        
        {/* ── HEADER ── */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-center relative">
          <button className="absolute left-6 active:scale-95 transition-transform">
            <ArrowLeft className="text-[#0A3D24]" size={22} strokeWidth={2.5} />
          </button>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Indus Ledger v3.0</p>
        </div>

        {/* ── STEP HEADER ── */}
        <div className="px-6 mt-6 flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold text-[#0A3D24]">Shop Details</h2>
            <span className="text-[12px] font-bold text-gray-400">Step 2 of 3</span>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="px-6 flex items-center justify-between mb-8">
            <div className="flex-[2] h-[3px] bg-[#0A3D24] rounded-full mr-2" />
            <div className="flex-1 h-[3px] bg-gray-200 rounded-full mx-2" />
            <div className="flex-1 h-[3px] bg-gray-200 rounded-full ml-2" />
        </div>

        <div className="px-6 flex-1 flex flex-col">
          {/* ── TITLE ── */}
          <h2 className="text-[32px] font-black text-gray-900 leading-tight mb-2 tracking-tight">
            Let's set up your<br />
            <span className="text-[#0A3D24]">Digital Ledger</span>
          </h2>
          <p className="text-[14px] font-medium text-gray-500 mb-10 leading-relaxed max-w-[280px]">
            This helps us personalize your accounting experience.
          </p>

          {/* ── INPUTS ── */}
          <div className="space-y-4">
              <div className="relative flex items-center">
                  <Store className="absolute left-5 text-gray-400" size={20} strokeWidth={2.5} />
                  <input
                    type="text" placeholder="Shop Name" value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full bg-[#F4F4F5] text-gray-900 placeholder:text-gray-400 rounded-2xl py-5 pl-14 pr-6 outline-none font-bold text-[15px] transition-all focus:ring-2 focus:ring-[#0A3D24]/20"
                  />
              </div>

              <div className="relative flex items-center">
                  <User className="absolute left-5 text-gray-400" size={20} strokeWidth={2.5} />
                  <input
                    type="text" placeholder="Owner Name" value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-[#F4F4F5] text-gray-900 placeholder:text-gray-400 rounded-2xl py-5 pl-14 pr-6 outline-none font-bold text-[15px] transition-all focus:ring-2 focus:ring-[#0A3D24]/20"
                  />
              </div>
          </div>

          {/* ── SECURED VAULT CARD ── */}
          <div className="mt-8 bg-[#F0F5F2] border border-[#0A3D24]/10 rounded-3xl p-5 flex gap-4 items-start shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#033A1F] flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Shield size={18} className="text-[#22C55E]" strokeWidth={2.5} />
              </div>
              <div>
                  <h3 className="text-[13px] font-bold text-[#0A3D24] mb-1">Secured Vault</h3>
                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                      Your shop data is encrypted with enterprise-grade standards and only accessible to you.
                  </p>
              </div>
          </div>

          <div className="flex-1" />

          {/* ── NEXT BUTTON ── */}
          <button
            onClick={handleSubmit} disabled={isLoading || !isFormValid}
            className={`w-full py-4 mt-8 rounded-xl font-bold text-[15px] flex items-center justify-center space-x-2 transition-transform ${
                isFormValid ? 'bg-[#033A1F] text-white active:scale-95 shadow-md' : 'bg-gray-200 text-gray-400 pointer-events-none'
            }`}
          >
            <span>{isLoading ? 'Saving...' : 'Next'}</span>
            {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>
        </div>

        <div className="py-6 flex justify-center">
           <div className="w-12 h-1 bg-gray-200 rounded-full" />
        </div>

      </div>
    </PageTransition>
  );
};
