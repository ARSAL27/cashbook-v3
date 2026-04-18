import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { ArrowLeft, Share2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { formatReceipt, shareOnWhatsApp } from '../services/whatsappService';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { invoices, profile, deleteInvoice, updateInvoice } = useShop();

  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<'paid' | 'unpaid'>('paid');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const invoice = useMemo(() => invoices.find(inv => inv.id === id), [invoices, id]);

  React.useEffect(() => {
    if (invoice) {
        setEditName(invoice.customerName);
        setEditStatus(invoice.status as 'paid' | 'unpaid');
    }
  }, [invoice]);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    Haptics.impact({ style }).catch(() => {});
  };

  const handleDelete = async () => {
    if (!invoice) return;
    triggerHaptic(ImpactStyle.Heavy);
    setIsProcessing(true);
    try {
        await deleteInvoice(invoice.id);
        toast.success('Invoice delete hogya');
        navigate('/');
    } catch (e) {
        toast.error('Ghalti hogayi delete karne me');
    } finally {
        setIsProcessing(false);
        setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!invoice || !editName.trim()) return;
    triggerHaptic(ImpactStyle.Medium);
    setIsProcessing(true);
    try {
      await updateInvoice(invoice.id, {
        customerName: editName.trim(),
        status: editStatus,
      });
      toast.success('Invoice update ho gaya!');
      setIsEditing(false);
    } catch (e) {
      toast.error('Update karne mein masla hua');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsApp = () => {
    if (!invoice) return;
    const msg = formatReceipt(invoice, profile?.name || 'Our Shop');
    shareOnWhatsApp(invoice.customerPhone, msg);
    toast.success('Opening WhatsApp...');
  };

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center font-outfit" style={{ backgroundColor: isDarkMode ? '#0A0A0A' : '#F5F5F5' }}>
        <div className="text-center">
          <p className="text-gray-400 font-bold">Invoice nahi mila</p>
          <button onClick={() => navigate(-1)} className="mt-4 bg-[#0A3D24] text-white px-6 py-2.5 rounded-2xl text-sm font-bold">Wapas Jao</button>
        </div>
      </div>
    );
  }

  const bg = isDarkMode ? '#0A0A0A' : '#FAFAFA';
  const card = isDarkMode ? '#141414' : '#FFFFFF';
  const border = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const text = isDarkMode ? '#FFFFFF' : '#0A0A0A';
  const sub = isDarkMode ? '#B0B0B0' : '#666666';

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });

  /*
  const handleWhatsApp = () => {
    const phone = invoice.customerPhone?.replace(/[^0-9]/g, '');
    if (!phone) return toast.error('Customer phone number nahi hai');
    const msg = encodeURIComponent(
      `*Invoice ${invoice.invoiceNumber}*\n\n` +
      `Salamualaikum ${invoice.customerName}!\n\n` +
      `*${profile?.name || 'Our Shop'}* ki taraf se invoice:\n\n` +
      invoice.items.map(i => `• ${i.name} × ${i.qty} = Rs. ${i.total.toLocaleString()}`).join('\n') +
      `\n\n*Subtotal:* Rs. ${invoice.subtotal.toLocaleString()}` +
      (invoice.discount > 0 ? `\n*Discount:* Rs. ${invoice.discount.toLocaleString()}` : '') +
      `\n*Total:* Rs. ${invoice.total.toLocaleString()}` +
      `\n*Status:* ${invoice.status.toUpperCase()}` +
      `\n\nShukriya! 🙏`
    );
    window.open(`https://wa.me/92${phone.replace(/^0/, '')}?text=${msg}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };
  */

  return (
    <PageTransition> <div className="w-full font-outfit max-w-md mx-auto " style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="pt-12 pb-3 sticky top-0 z-40 flex items-center justify-between px-5 " style={{ backgroundColor: isDarkMode ? '#141414' : '#FFFFFF', borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform" style={{ color: text }}>
                <ArrowLeft size={22} />
            </button>
            <p className="font-black text-[15px]" style={{ color: text }}>Invoice Preview</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
                <>
                    <button 
                        onClick={() => { triggerHaptic(); setIsEditing(true); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center" 
                        style={{ backgroundColor: isDarkMode ? '#252525' : '#F5F5F5' }}
                    >
                        <Pencil size={14} style={{ color: sub }} />
                    </button>
                    <button 
                        onClick={() => { triggerHaptic(ImpactStyle.Medium); setIsDeleting(true); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10" 
                    >
                        <Trash2 size={14} className="text-red-500" />
                    </button>
                </>
            )}
            <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#252525' : '#F5F5F5' }} onClick={handleWhatsApp}>
                <Share2 size={16} style={{ color: sub }} />
            </button>
          </div>
        </div>

        {/* INVOICE CARD */}
        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border overflow-hidden"
            style={{ backgroundColor: card, borderColor: border }}
          >
            {/* Shop Header */}
            <div className="bg-[#0A3D24] px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-[#185536] rounded-2xl flex items-center justify-center text-[#4BFF94] font-black text-[20px] border border-[#4BFF94]/20">
                {(profile?.name || 'S')[0]}
              </div>
              <div>
                <h2 className="text-white font-black text-[17px]">{profile?.name || 'Your Shop'}</h2>
                {profile?.city && <p className="text-white/50 text-[11px]">{profile.city}</p>}
                {profile?.phone && <p className="text-white/50 text-[11px]">{profile.phone}</p>}
              </div>
              <div className="ml-auto text-right">
                <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${invoice.status === 'paid' ? 'bg-[#00C853] text-white' : 'bg-[#FF5252] text-white'}`}>
                  {invoice.status}
                </span>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Invoice meta */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: border }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#0A3D24' }}>{invoice.invoiceNumber}</p>
                  <p className="text-[12px] font-medium" style={{ color: sub }}>{formatDate(invoice.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: sub }}>Payment</p>
                  <p className="text-[12px] font-black" style={{ color: text }}>
                    {invoice.paymentMethod === 'cash' ? '💵 Cash' : invoice.paymentMethod === 'online' ? '📱 Online Transfer' : '📋 Udhaar'}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-4 pb-4 border-b" style={{ borderColor: border }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: sub }}>Bill To</p>
                {isEditing ? (
                    <div className="space-y-3">
                        <input 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            placeholder="Enter Name..."
                            className="w-full text-[20px] font-black bg-transparent outline-none border-b-2 border-primary/20 focus:border-primary px-1"
                            style={{ color: text }}
                        />
                        <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border">
                            <button onClick={() => { setEditStatus('paid'); triggerHaptic(); }} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all ${editStatus === 'paid' ? 'bg-[#00C853] text-white shadow-lg' : 'text-gray-400'}`}>PAID</button>
                            <button onClick={() => { setEditStatus('unpaid'); triggerHaptic(); }} className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase transition-all ${editStatus === 'unpaid' ? 'bg-[#FF5252] text-white shadow-lg' : 'text-gray-400'}`}>UNPAID</button>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsEditing(false)} 
                                className="flex-1 py-2.5 rounded-xl bg-card border border-border font-black text-[11px] uppercase"
                                style={{ color: sub }}
                            >
                                Cancel
                            </button>
                        <button 
                                onClick={handleSaveEdit} 
                                disabled={isProcessing || !editName.trim()}
                                className="flex-[2] py-2.5 rounded-xl bg-primary text-black font-black text-[11px] uppercase disabled:opacity-50"
                            > 
                                {isProcessing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-[16px] font-black" style={{ color: text }}>{invoice.customerName}</p>
                        {invoice.customerPhone && <p className="text-[12px] font-medium" style={{ color: sub }}>+92 {invoice.customerPhone.replace(/^(\+92|0)/, '')}</p>}
                    </>
                )}
              </div>

              {/* TOTAL BIG */}
              <div className="mb-4 pb-4 border-b text-center" style={{ borderColor: border }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: sub }}>TOTAL AMOUNT</p>
                <p className="text-[40px] font-black" style={{ color: text }}>Rs. {invoice.total.toLocaleString()}</p>
              </div>

              {/* ITEMS TABLE */}
              <div className="mb-4">
                <div className="grid grid-cols-5 mb-2 px-1">
                  <p className="col-span-2 text-[9px] font-black uppercase tracking-wider" style={{ color: sub }}>Item</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-center" style={{ color: sub }}>Qty</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-center" style={{ color: sub }}>Price</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-right" style={{ color: sub }}>Total</p>
                </div>
                {invoice.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 py-2.5 border-b last:border-0 px-1"
                    style={{ borderColor: border }}
                  >
                    <p className="col-span-2 text-[13px] font-bold" style={{ color: text }}>{item.name}</p>
                    <p className="text-[13px] font-medium text-center" style={{ color: sub }}>{item.qty}</p>
                    <p className="text-[13px] font-medium text-center" style={{ color: sub }}>{item.price.toLocaleString()}</p>
                    <p className="text-[13px] font-black text-right" style={{ color: text }}>{item.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* SUBTOTAL / DISCOUNT / TOTAL */}
              <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB' }}>
                <div className="flex justify-between">
                  <span className="text-[12px] font-medium" style={{ color: sub }}>Subtotal</span>
                  <span className="text-[13px] font-bold" style={{ color: text }}>Rs. {invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium" style={{ color: sub }}>Discount</span>
                  <span className={`text-[13px] font-bold ${invoice.discount > 0 ? 'text-[#FF5252]' : ''}`} style={{ color: invoice.discount > 0 ? '#FF5252' : text }}>
                    {invoice.discount > 0 ? `- Rs. ${invoice.discount.toLocaleString()}` : `Rs. 0`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between" style={{ borderColor: isDarkMode ? '#2A2A2A' : '#E5E7EB' }}>
                  <span className="text-[14px] font-black" style={{ color: text }}>Final Total</span>
                  <span className="text-[18px] font-black" style={{ color: '#0A3D24' }}>Rs. {invoice.total.toLocaleString()}</span>
                </div>
              </div>

              {/* THANK YOU NOTE */}
              <div className="mt-4 text-center px-4">
                <p className="text-[11px] font-medium italic" style={{ color: sub }}>
                  "Thank you for your business. We value your trust in {profile?.name || 'our store'}!"
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* NEW ACTION BUTTON - BACK TO HOME */}
        <div className="fixed bottom-6 inset-x-0 max-w-md mx-auto px-6 z-[85]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="w-full bg-[#4BFF94] text-[#0A3D24] py-5 rounded-[2.5rem] font-black text-[15px] flex items-center justify-center gap-3 shadow-[0_15px_45px_rgba(75,255,148,0.25)] border-4 border-white dark:border-[#0A0A0A] uppercase tracking-widest"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            Wapas Jao
          </motion.button>
        </div>

        <div className="h-40" />

        {/* DELETE CONFIRMATION OVERLAY */}
        {isDeleting && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center px-5 pb-10 bg-black/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-[20px] font-black uppercase tracking-tight text-text-primary mb-3">Delete Invoice?</h3>
                        <p className="text-[14px] font-medium text-text-muted mb-8 leading-relaxed">
                            Ye invoice hmesha ke liye khtam hojaye ga or <span className="text-red-500 font-black">Sale</span> record se bhi nikal jaye ga. Kiya ap sure hain?
                        </p>
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => setIsDeleting(false)}
                                className="flex-1 py-5 rounded-[1.8rem] bg-background border border-border text-text-primary font-black text-[15px] active:scale-95 transition-all"
                            >
                                NAHI
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isProcessing}
                                className="flex-[1.5] py-5 rounded-[1.8rem] bg-red-500 text-white font-black text-[15px] shadow-2xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Working...' : 'HAAN DELETE KRDO'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </div>
    </PageTransition>
  );
};
