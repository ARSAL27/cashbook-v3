import React, { useMemo } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useShop } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { invoices, profile } = useShop();

  const invoice = useMemo(() => invoices.find(inv => inv.id === id), [invoices, id]);

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

  return (
    <PageTransition>
      <div className="w-full pb-8 font-outfit max-w-md mx-auto" style={{ backgroundColor: bg }}>

        {/* HEADER */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-4" style={{ backgroundColor: isDarkMode ? '#141414' : '#FFFFFF', borderBottom: `1px solid ${border}` }}>
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform" style={{ color: text }}>
            <ArrowLeft size={22} />
          </button>
          <p className="font-black text-[15px]" style={{ color: text }}>Invoice Preview</p>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#252525' : '#F5F5F5' }}>
            <Share2 size={16} style={{ color: sub }} />
          </button>
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
                <p className="text-[16px] font-black" style={{ color: text }}>{invoice.customerName}</p>
                {invoice.customerPhone && <p className="text-[12px] font-medium" style={{ color: sub }}>+92 {invoice.customerPhone.replace(/^(\+92|0)/, '')}</p>}
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

        {/* ACTION BUTTONS */}
        <div className="fixed bottom-[90px] inset-x-0 max-w-md mx-auto px-4 z-50 space-y-2" style={{ backgroundColor: bg }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <MessageSquare size={18} />
            WhatsApp pe Bhejo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            className="w-full bg-[#FF5252] text-white py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Download size={18} />
            PDF Download Karo
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};
