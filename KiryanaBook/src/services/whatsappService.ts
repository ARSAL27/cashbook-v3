import type { Invoice } from '../context/ShopContext';

/**
 * 📱 WhatsApp Receipt Service for KiryanaBook
 * Formats and shares professional billing receipts via WhatsApp
 */

export const formatReceipt = (invoice: Invoice, shopName: string = 'Our Shop'): string => {
  const itemsText = invoice.items
    .map(i => `• ${i.name.padEnd(15)} × ${i.qty} = Rs. ${i.total.toLocaleString()}`)
    .join('\n');

  return `*${shopName.toUpperCase()} - BILL RECEIPT*\n` +
    `--------------------------------\n` +
    `*Invoice:* ${invoice.invoiceNumber}\n` +
    `*Date:* ${new Date(invoice.date).toLocaleDateString('en-PK')}\n` +
    `*Customer:* ${invoice.customerName}\n` +
    `--------------------------------\n` +
    `${itemsText}\n` +
    `--------------------------------\n` +
    `*Subtotal:* Rs. ${invoice.subtotal.toLocaleString()}\n` +
    (invoice.discount > 0 ? `*Discount:* Rs. ${invoice.discount.toLocaleString()}\n` : '') +
    `*Total Bill: Rs. ${invoice.total.toLocaleString()}*\n` +
    `--------------------------------\n` +
    `*Payment:* ${invoice.status.toUpperCase()} (${invoice.paymentMethod.toUpperCase()})\n\n` +
    `Thank you for shopping with us! 🙏`;
};

export const shareOnWhatsApp = (phone: string | undefined, text: string) => {
  const encodedText = encodeURIComponent(text);
  if (phone) {
    // Basic number cleaning for Pakistan (92)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '92' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('92')) {
      formattedPhone = '92' + cleanPhone;
    }
    window.open(`https://wa.me/${formattedPhone}?text=${encodedText}`, '_blank');
  } else {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  }
};
