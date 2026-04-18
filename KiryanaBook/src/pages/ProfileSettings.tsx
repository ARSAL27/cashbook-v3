import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, User, Phone, MapPin, Store, Camera, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useShop();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    owner: profile?.owner || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    currency: profile?.currency || 'PKR',
    logoUrl: profile?.logoUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        owner: profile.owner,
        phone: profile.phone,
        city: profile.city,
        currency: profile.currency,
        logoUrl: profile.logoUrl || ''
      });
    }
  }, [profile]);

  // Debounced Auto-Save
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Don't save if nothing changed or if initial load
      if (JSON.stringify(formData) === JSON.stringify({
        name: profile?.name,
        owner: profile?.owner,
        phone: profile?.phone,
        city: profile?.city,
        currency: profile?.currency,
        logoUrl: profile?.logoUrl || ''
      })) return;

      // Only save if name at least exists, others can be empty/updated later
      if (!formData.name.trim()) return;

      setIsSaving(true);
      try {
        await updateProfile({
          ...profile,
          ...formData
        } as any);
        setLastSaved(Date.now());
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setIsSaving(false);
      }
    }, 1000); 

    return () => clearTimeout(timer);
  }, [formData, profile, updateProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };



  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+92')) {
        val = '+92' + val.replace(/\D/g, '');
    } else {
        let suffix = val.slice(3).replace(/\D/g, '');
        if (suffix.startsWith('0')) {
            suffix = suffix.slice(1);
        }
        val = '+92' + suffix;
    }
    if (val.length <= 13) {
      setFormData(prev => ({ ...prev, phone: val }));
    }
  };

  return (
    <PageTransition> <div className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] font-outfit max-w-md mx-auto overflow-x-hidden min-h-screen ">
        {/* HEADER */}
        <header className="pt-12 pb-3 px-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-50 border-b border-border/10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => { triggerHaptic(); navigate(-1); }} 
              className="w-10 h-10 flex items-center justify-center text-text-primary bg-card border border-border shadow-sm rounded-2xl active:scale-95 transition-all"
            >
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <h1 className="text-20 font-black text-text-primary tracking-tight">Profile</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isSaving ? (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Saving</span>
               </div>
            ) : lastSaved ? (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Synced</span>
               </div>
            ) : null}
          </div>
        </header>

        <div className="p-6 space-y-8">
          {/* PROFILE IMAGE HERO */}
          <div className="relative flex flex-col items-center">
            <div className="relative group">
               <div className="w-32 h-32 rounded-[3.5rem] border-4 border-card shadow-2xl overflow-hidden bg-card-secondary relative transition-all duration-500 group-hover:scale-[1.02]">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Store size={40} className="text-primary/20" strokeWidth={2.5} />
                    </div>
                  )}
               </div>
               <label className="absolute -bottom-2 -right-2 w-11 h-11 bg-primary text-black rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer active:scale-90 transition-transform border-4 border-card z-10">
                  <Camera size={20} strokeWidth={3} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
            </div>
            <div className="mt-4 text-center">
                <h2 className="text-[18px] font-black text-text-primary uppercase tracking-tight">{formData.name || 'Store Name'}</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1 opacity-40">Shop Identity</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* SHOP DETAILS SECTION */}
            <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 shadow-sm space-y-5">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 mb-2">Business Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Store size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-20" strokeWidth={3} />
                    <input 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Store Name"
                      className="w-full bg-background/50 border border-border/60 focus:border-primary/50 text-text-primary text-[14px] rounded-2xl py-5 pl-14 pr-6 outline-none font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-20" strokeWidth={3} />
                    <input 
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="City"
                      className="w-full bg-background/50 border border-border/60 focus:border-primary/50 text-text-primary text-[14px] rounded-2xl py-5 pl-14 pr-6 outline-none font-bold transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PERSONAL DETAILS SECTION */}
            <div className="bg-card border border-border/60 rounded-[2.5rem] p-6 shadow-sm space-y-5">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 mb-2">Owner Contact</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-20" strokeWidth={3} />
                    <input 
                      value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                      placeholder="Owner Name"
                      className="w-full bg-background/50 border border-border/60 focus:border-primary/50 text-text-primary text-[14px] rounded-2xl py-5 pl-14 pr-6 outline-none font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-20" strokeWidth={3} />
                    <input 
                      value={formData.phone} type="tel"
                      onChange={handlePhoneChange}
                      placeholder="+92 3XX XXXXXXX"
                      className="w-full bg-background/50 border border-border/60 focus:border-primary/50 text-text-primary text-[14px] rounded-2xl py-5 pl-14 pr-6 outline-none font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-20" strokeWidth={3} />
                    <div className="w-full bg-gray-50 dark:bg-white/5 border border-border/60 text-text-muted text-[14px] rounded-2xl py-5 pl-14 pr-6 font-bold truncate opacity-60">
                      {user?.email || 'No email linked'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 opacity-30">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em]">Hardware Encryption Active</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
