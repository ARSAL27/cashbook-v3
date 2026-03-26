import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Tag, Hash, Box, Filter, Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStockModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addStockItem, checkLimit } = useShop();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantity || !category) {
      toast.error('Please complete all fields');
      return;
    }

    const limit = checkLimit('stock');
    if (!limit.allowed) {
      toast.error(limit.message || 'Inventory limit reached');
      onClose();
      return;
    }

    try {
      await addStockItem({
        name,
        price: Number(price),
        buyingPrice: 0,
        quantity: Number(quantity),
        unit: 'units',
        category: category.toUpperCase(),
        minThreshold: 5,
        sku: `SKU-${Date.now().toString().slice(-6)}`
      });
      toast.success('Product Added to Master Inventory');
      setName(''); setPrice(''); setQuantity(''); setCategory('');
      onClose();
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#0A3D24]/40 backdrop-blur-md z-[200]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 inset-x-0 bg-white rounded-t-[3rem] p-8 z-[210] shadow-2xl pb-12 border-t border-gray-100 max-w-md mx-auto">
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E2FFED] rounded-xl flex items-center justify-center text-[#0A3D24]">
                    <Box size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-[18px] font-black text-[#0A3D24] tracking-tight">New Inventory Entry</h3>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 rounded-full text-gray-400 flex items-center justify-center active:scale-95 transition-transform">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Identity</label>
                <div className="relative">
                  <Package size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Product Name (e.g. Rice 10kg)" className="w-full bg-[#F4F4F5] border-transparent focus:bg-white focus:border-[#0A3D24]/10 rounded-2xl py-4.5 pl-14 pr-6 outline-none font-bold text-[14px] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Selling Price</label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-[#F4F4F5] border-transparent focus:bg-white focus:border-[#0A3D24]/10 rounded-2xl py-4.5 pl-14 pr-6 outline-none font-bold text-[14px] transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Init Quantity</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-full bg-[#F4F4F5] border-transparent focus:bg-white focus:border-[#0A3D24]/10 rounded-2xl py-4.5 pl-14 pr-6 outline-none font-bold text-[14px] transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Classification</label>
                <div className="relative">
                    <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
                    <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g. GROCERY)" className="w-full bg-[#F4F4F5] border-transparent focus:bg-white focus:border-[#0A3D24]/10 rounded-2xl py-4.5 pl-14 pr-6 outline-none font-bold text-[14px] transition-all uppercase" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-[#0A3D24] text-[#4BFF94] rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-[#0A3D24]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Plus size={20} strokeWidth={4} />
                Register to Inventory
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
