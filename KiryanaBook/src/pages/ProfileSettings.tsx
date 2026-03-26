import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, User, Phone, MapPin, Save, Store, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useShop();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    owner: profile?.owner || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    currency: profile?.currency || 'PKR',
    logoUrl: profile?.logoUrl || ''
  });

  const [isLoading, setIsLoading] = useState(false);

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

  const validatePhone = (phone: string) => {
    // Basic check for 10 digits after +92
    const digitsOnly = phone.replace('+92', '').replace(/\s/g, '');
    return digitsOnly.length === 10 && /^\d+$/.test(digitsOnly);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Ensure it starts with +92
    if (!val.startsWith('+92')) {
        val = '+92' + val.replace(/\D/g, '');
    } else {
        // Keep +92 and only allow digits after that
        const suffix = val.slice(3).replace(/\D/g, '');
        val = '+92' + suffix;
    }

    // Limit to +92 + 10 digits
    if (val.length <= 13) {
      setFormData(prev => ({ ...prev, phone: val }));
    }
  };

  const handleSave = async () => {
    const { name, owner, city, phone } = formData;
    
    if (!name.trim()) return toast.error('Store Name is mandatory');
    if (!city.trim()) return toast.error('City is mandatory');
    if (!owner.trim()) return toast.error('Owner Name is mandatory');
    if (!phone || phone === '+92') return toast.error('Phone Number is mandatory');
    
    if (!validatePhone(phone)) {
        return toast.error('Please enter a valid 10-digit mobile number (+92 XXX XXXXXXX)');
    }

    setIsLoading(true);
    triggerHaptic(ImpactStyle.Medium);
    
    try {
      await updateProfile({
        ...profile,
        ...formData
      } as any);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      toast.success('Profile updated successfully');
      setTimeout(() => navigate(-1), 500);
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-background pb-8 font-outfit max-w-md mx-auto overflow-x-hidden">
        {/* HEADER */}
        <header className="px-4 h-12 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { triggerHaptic(); navigate(-1); }} 
              className="w-10 h-10 flex items-center justify-center text-text-muted bg-card border border-border rounded-xl active:scale-90 transition-all font-black"
            >
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <h1 className="text-16 font-black text-text-primary tracking-tight uppercase">Profile</h1>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.96] transition-all"
          >
            {isLoading ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                <Save size={14} strokeWidth={3} />
            )}
            <span>Save</span>
          </button>
        </header>

        <div className="p-4 space-y-6">
          {/* SHOP DETAILS */}
          <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-6 text-center">
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2.5rem] border border-dashed border-border flex items-center justify-center bg-card-secondary/30 overflow-hidden group-hover:border-primary/40 transition-all shadow-inner relative">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store size={32} className="text-text-muted opacity-10" strokeWidth={3} />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform border-4 border-card z-10">
                  <Camera size={20} strokeWidth={3} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-4 opacity-40">Shop Logo</p>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-40">Store Name</label>
                <div className="relative">
                  <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/20" strokeWidth={3} />
                  <input 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="ENTER STORE NAME"
                    className="w-full bg-card border border-border focus:border-primary/50 text-text-primary text-[12px] rounded-2xl py-4.5 pl-12 pr-5 outline-none font-black uppercase transition-all tracking-tight" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-40">City</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/20" strokeWidth={3} />
                  <input 
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                    placeholder="ENTER CITY"
                    className="w-full bg-card border border-border focus:border-primary/50 text-text-primary text-[12px] rounded-2xl py-4.5 pl-12 pr-5 outline-none font-black uppercase transition-all tracking-tight" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 border-b border-border/10 pb-2">Personal Info</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-40">Owner Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/20" strokeWidth={3} />
                  <input 
                    value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                    placeholder="ENTER FULL NAME"
                    className="w-full bg-card border border-border focus:border-primary/50 text-text-primary text-[12px] rounded-2xl py-4.5 pl-12 pr-5 outline-none font-black uppercase transition-all tracking-tight" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-40">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/20" strokeWidth={3} />
                  <input 
                    value={formData.phone} type="tel"
                    onChange={handlePhoneChange}
                    placeholder="+92 3XX XXXXXXX"
                    className="w-full bg-card border border-border focus:border-primary/50 text-text-primary text-[12px] rounded-2xl py-4.5 pl-12 pr-5 outline-none font-black uppercase transition-all tracking-tight" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center opacity-20 pt-8 pb-12">
            <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Protection Active</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
