import React, { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { ArrowLeft, Store, Phone, MapPin, Save, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useShop } from '../context/ShopContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const ShopDetails: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useShop();
  
  const [shopName, setShopName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setShopName(profile.name);
      setPhone(profile.phone);
      setCity(profile.city);
      setLogoUrl(profile.logoUrl || '');
    }
  }, [profile]);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB)');
      return;
    }

    try {
      setIsUploading(true);
      triggerHaptic(ImpactStyle.Medium);
      const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setLogoUrl(url);
      toast.success('Logo uploaded');
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!shopName || !city) {
      toast.error('Please fill name and city');
      return;
    }
    try {
      triggerHaptic(ImpactStyle.Medium);
      await updateProfile({
        ...profile,
        name: shopName,
        phone,
        city,
        logoUrl
      });
      toast.success('Settings saved');
      navigate(-1);
    } catch (error) {
      triggerHaptic(ImpactStyle.Heavy);
      toast.error('Failed to update');
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-background pb-8 font-outfit">
        {/* HEADER */}
        <header className="px-4 pt-5 pb-4 border-b border-border/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic(); navigate(-1); }} 
              className="p-2 bg-card-secondary border border-border rounded-xl text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-sm font-bold text-text-primary tracking-tight uppercase">Shop Settings</h1>
          </div>
          <button 
            onClick={() => { triggerHaptic(); navigate(-1); }}
            className="text-[9px] font-black text-text-muted hover:text-primary uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all font-outfit"
          >
            Skip
          </button>
        </header>

        <div className="px-6 max-w-xl mx-auto space-y-10 mt-10">
          {/* LOGO UPLOAD */}
          <div className="flex flex-col items-center">
            <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] bg-card border border-border flex items-center justify-center text-primary shadow-sm overflow-hidden relative">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                    <Store size={32} />
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl border-4 border-background flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-90 shadow-lg">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                </label>
            </div>
            <p className="mt-4 text-[8px] font-bold text-text-muted uppercase tracking-widest text-center opacity-40">Shop Logo</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-40">Business Name</label>
              <div className="relative group">
                <Store size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-bold" />
                <input 
                  value={shopName} 
                  onChange={e => setShopName(e.target.value)} 
                  placeholder="e.g. Kiryana Store"
                  className="w-full bg-card border border-border focus:border-primary/50 text-text-primary rounded-2xl py-4 pl-14 pr-6 outline-none transition-all shadow-sm font-bold text-[11px] uppercase" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-40">Phone Number</label>
              <div className="relative group">
                <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-bold" />
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="0300 xxxxxxx"
                  className="w-full bg-card border border-border focus:border-primary/50 text-text-primary rounded-2xl py-4 pl-14 pr-6 outline-none transition-all shadow-sm font-bold text-[11px]" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-40">City</label>
              <div className="relative group">
                <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all font-bold" />
                <input 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder="e.g. Lahore"
                  className="w-full bg-card border border-border focus:border-primary/50 text-text-primary rounded-2xl py-4 pl-14 pr-6 outline-none transition-all shadow-sm font-bold text-[11px] uppercase" 
                />
              </div>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSave} 
            className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center space-x-3 uppercase tracking-widest text-[10px] hover:brightness-105 transition-all"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};
