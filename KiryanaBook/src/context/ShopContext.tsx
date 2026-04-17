import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import {
  collection, addDoc, onSnapshot, doc, updateDoc, setDoc,
  serverTimestamp, query, orderBy, writeBatch, getDocs, where, arrayUnion, runTransaction, increment
} from 'firebase/firestore';
import { sendNativeNotification } from '../utils/notifications';
import { sanitizeString } from '../utils/crypto';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface StockHistory {
  id: string;
  type: 'restock' | 'sale' | 'adjustment' | 'reversal';
  quantity: number;
  date: string;
  note?: string;
}

export interface Stock {
  id: string;
  name: string;
  company?: string;
  price: number;
  buyingPrice: number;
  quantity: number;
  unit: 'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen' | 'bori';
  category: string;
  minThreshold: number;
  sku: string;
  history: StockHistory[];
  soldCount: number;
  imageUrl?: string;
  packSize?: string;
  status: 'active' | 'inactive';
  isDeleted?: boolean;
}

export interface Sale {
  id: string;
  total: number;
  type: 'cash' | 'udhaar';
  date: string;
  items: { itemId: string; qty: number; price: number; name: string }[];
  isDeleted?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  isDeleted?: boolean;
}

export interface Udhaar {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  isPayment?: boolean;
  note?: string;
  isUrgent?: boolean;
  isDeleted?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  type: 'customer' | 'supplier';
  initialBalance: number;
  createdAt: string;
  isImportant?: boolean;
  isDeleted?: boolean;
}

export interface ShopProfile {
  name: string;
  owner: string;
  phone: string;
  city: string;
  currency: string;
  plan?: string;
  lastSync?: string;
  logoUrl?: string;
  securityPin?: string;
  securitySettings?: {
    lockStock: boolean;
    lockKhata: boolean;
    lockReports: boolean;
    lockStaff: boolean;
  };
  rolePermissions?: Record<string, any>;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'online' | 'udhaar';
  status: 'paid' | 'unpaid';
  date: string;
  notes?: string;
  isDeleted?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: 'Manager' | 'Cashier' | 'Clerk';
  status: 'active' | 'inactive';
  joinedAt: string;
  dailyActions?: number;
  isDeleted?: boolean;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  details: string;
  type: 'sale' | 'expense' | 'customer' | 'report';
  date: string;
  isDeleted?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'payment' | 'system' | 'customer' | 'supplier';
  date: string;
  read: boolean;
  relatedId?: string;
  adminBroadcast?: boolean;
}

export interface Transaction {
  id: string;
  itemId: string; // ID from unified 'items' or specific collections
  shopId: string;
  type: 'credit' | 'debit';
  amount: number;
  note?: string;
  date: string;
  category: 'sale' | 'purchase' | 'expense' | 'payment';
  metadata?: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted';
  collection: string;
  docId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  details: string;
}

export interface DailyBalance {
  id: string; // Format: YYYY-MM-DD
  totalCredit: number;
  totalDebit: number;
  transactionsCount: number;
}

interface ShopContextType {
  stock: Stock[];
  sales: Sale[];
  expenses: Expense[];
  udhaars: Udhaar[];
  contacts: Contact[];
  contactsMap: Map<string, Contact>;
  invoices: Invoice[];
  staff: Staff[];
  activities: StaffActivity[];
  notifications: Notification[];
  categories: string[];
  profile: ShopProfile | null;
  loading: boolean;
  addSale: (items: any[], type: 'cash' | 'udhaar', discount?: number) => Promise<string | undefined>;
  addExpense: (amount: number, description: string, category?: string) => Promise<void>;
  addUdhaar: (customerName: string, amount: number, note?: string) => Promise<void>;
  updateStock: (id: string, newQuantity: number, type?: 'restock' | 'adjustment', note?: string) => Promise<void>;
  updateStockItem: (id: string, data: Partial<Stock>) => Promise<void>;
  toggleStockItemStatus: (id: string) => Promise<void>;
  addStockItem: (item: Omit<Stock, 'id' | 'history' | 'soldCount' | 'status'>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  addUdhaarPayment: (customerName: string, amount: number, note?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  updateProfile: (profile: ShopProfile) => Promise<void>;
  updateRolePermissions: (role: string, permissions: any) => Promise<void>;
  updateSecuritySettings: (settings: Partial<ShopProfile['securitySettings']>) => Promise<void>;
  deleteUdhaar: (id: string) => Promise<void>;
  deleteCustomer: (name: string) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContactImportance: (id: string) => Promise<void>;
  updateContact: (id: string, oldName: string, newData: { name?: string; phone?: string }) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => Promise<string>;
  updateInvoice: (id: string, data: { customerName?: string; status?: 'paid' | 'unpaid'; notes?: string }) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id' | 'joinedAt'>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  currentShopId: string | null;
  setCurrentShopId: (id: string) => void;
  logAudit: (action: AuditLog['action'], targetCollection: string, docId: string, details: string, oldValue?: any, newValue?: any) => Promise<void>;
  updateDailyBalance: (dateStr: string, amount: number, type: 'credit' | 'debit') => Promise<void>;
  logActivity: (activity: Omit<StaffActivity, 'id' | 'date'>) => Promise<void>;
  toggleUdhaarUrgency: (id: string) => Promise<void>;
  checkLimit: (type: 'sales' | 'stock' | 'customers' | 'staff') => { allowed: boolean; message?: string };
  clearOldData: (days: number) => Promise<void>;
  clearAllData: () => Promise<void>;
  updateLastSync: () => Promise<void>;
  addCategory: (cat: string) => Promise<void>;
  deleteCategory: (cat: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stock, setStock] = useState<Stock[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [udhaars, setUdhaars] = useState<Udhaar[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activities, setActivities] = useState<StaffActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);

  const contactsMap = React.useMemo(() => {
    const map = new Map<string, Contact>();
    contacts.forEach(c => {
      if (c.name) map.set(c.name.toLowerCase().trim(), c);
    });
    return map;
  }, [contacts]);

  // Initialize Shop ID
  useEffect(() => {
    if (user) {
      // Currently defaulting to user.uid for 1-to-1, but prepared for multi-tenant
      setCurrentShopId(user.uid);
    } else {
      setCurrentShopId(null);
    }
  }, [user]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setStock([]); setSales([]); setExpenses([]); setUdhaars([]); setContacts([]); 
      setInvoices([]); setStaff([]); setActivities([]); setNotifications([]); setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const shopId = currentShopId || user.uid;
    const shopRef = doc(db, 'shops', shopId);
    const timer = setTimeout(() => setLoading(false), 5000);
    
    // Track when this app session started to avoid "old" notifications
    const appStartTime = new Date();
    let isFirstLoad = true;

    const unsubNotifications = onSnapshot(collection(shopRef, 'notifications'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted);
      setNotifications(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      // 🔥 Trigger native notification ONLY for Admin Broadcasts
      // AND only if they were created AFTER the app started
      if (!isFirstLoad) {
        snap.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const notifDate = new Date(data.date);
            
            // Only trigger if it has the flag AND is not from the past
            if (data.adminBroadcast && notifDate > appStartTime) {
              sendNativeNotification(data.title, data.message, '/notifications');
            }
          }
        });
      }
      isFirstLoad = false;
    });

    const unsubs = [
      onSnapshot(shopRef, snap => {
        clearTimeout(timer);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name, owner: data.owner, phone: data.phone,
            city: data.city, currency: data.currency, plan: data.plan,
            logoUrl: data.logoUrl,
            securityPin: data.securityPin || null,
            securitySettings: data.securitySettings || {
              lockStock: false, lockKhata: false, lockReports: false, lockStaff: false
            },
            rolePermissions: data.rolePermissions || {
              Cashier: { viewDashboard: true, viewReports: false, addEntry: true, editEntry: false, viewUdhaar: true, deleteRecords: false, manageStaff: false },
              Manager: { viewDashboard: true, viewReports: true, addEntry: true, editEntry: true, viewUdhaar: true, deleteRecords: false, manageStaff: true }
            }
          });
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          } else {
            // New shop: Initialize with default kiryana categories
            const defaultCats = [
              'Grains & Flour', 'Spices & Masala', 'Cooking Oil & Ghee', 'Tea & Beverages', 
              'Milk & Dairy', 'Personal Care', 'Household Cleaning', 'Biscuits & Snacks', 
              'Sauces, Pickles & Chutneys', 'Desserts & Sweets', 'Frozen Foods', 
              'Candies & Chocolates', 'Medical / Basic Health', 'OTHER'
            ];
            updateDoc(shopRef, { categories: defaultCats }).catch(console.error);
            setCategories(defaultCats);
          }
        }
        setLoading(false);
      }, () => setLoading(false)),

      onSnapshot(query(collection(shopRef, 'stock'), orderBy('name')), snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted);
        setStock(data);
        // Only run fix if we have data and it's the first major load
        if (data.length > 0) {
            autoFixStockCategories(data).catch(() => {});
        }
      }),
      onSnapshot(query(collection(shopRef, 'sales'), orderBy('date', 'desc')), snap => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'expenses'), orderBy('date', 'desc')), snap => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'udhaar'), orderBy('date', 'desc')), snap => {
        setUdhaars(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'contacts'), orderBy('name')), snap => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'invoices'), orderBy('date', 'desc')), snap => {
        setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'staff'), orderBy('name')), snap => {
        setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      onSnapshot(query(collection(shopRef, 'activities'), orderBy('date', 'desc')), snap => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }),
      unsubNotifications
    ];

    return () => {
      clearTimeout(timer);
      unsubs.forEach(u => u());
    };
  }, [user]);

  const updateProfile = async (newProfile: ShopProfile) => {
    if (!user) return;
    const cleanProfile = Object.fromEntries(Object.entries(newProfile).filter(([_, v]) => v !== undefined));
    await setDoc(doc(db, 'shops', user.uid), { ...cleanProfile, ownerUid: user.uid, updatedAt: serverTimestamp() }, { merge: true });
  };

  const updateRolePermissions = async (role: string, permissions: any) => {
    if (!user || !profile) return;
    const shopRef = doc(db, 'shops', user.uid);
    await updateDoc(shopRef, { 
      [`rolePermissions.${role}`]: permissions 
    });
  };

  const updateSecuritySettings = async (settings: Partial<ShopProfile['securitySettings']>) => {
    if (!user || !profile || !currentShopId) return;
    const shopRef = doc(db, 'shops', currentShopId);
    await updateDoc(shopRef, { 
      securitySettings: { ...profile.securitySettings, ...settings }
    });
  };

  /**
   * 🛡️ PRO FEATURE: AUDIT LOGGING
   * Logs every critical action for fraud prevention and accountability.
   */
  const logAudit = async (action: AuditLog['action'], targetCollection: string, docId: string, details: string, oldValue?: any, newValue?: any) => {
    if (!user || !currentShopId) return;
    const auditRef = collection(db, 'shops', currentShopId, 'audit_logs');
    await addDoc(auditRef, {
      userId: user.uid,
      userName: user.displayName || 'Staff',
      action,
      collection: targetCollection,
      docId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      timestamp: new Date().toISOString(),
      details
    });
  };

  /**
   * 💰 DAILY BALANCE SYNC
   * Aggregates daily performance metrics for instant reporting.
   */
  const updateDailyBalance = async (dateStr: string, amount: number, type: 'credit' | 'debit') => {
    if (!currentShopId) return;
    const balanceId = dateStr.split('T')[0];
    const balanceRef = doc(db, 'shops', currentShopId, 'daily_balances', balanceId);
    
    try {
      await setDoc(balanceRef, {
        totalCredit: increment(type === 'credit' ? amount : 0),
        totalDebit: increment(type === 'debit' ? amount : 0),
        transactionsCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Daily Balance Sync Failed", e);
    }
  };

  const addSale = async (items: any[], type: 'cash' | 'udhaar', discount: number = 0): Promise<string | undefined> => {
    if (!user) return;
    
    for (const i of items) {
      const stockItem = stock.find(s => s.id === i.itemId);
      if (stockItem && stockItem.quantity < i.qty) {
        throw new Error(`"${stockItem.name}" ka stock kam hai. Sirf ${stockItem.quantity} pieces hain.`);
      }
    }

    const shopRef = doc(db, 'shops', user.uid);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = Math.max(0, subtotal - discount);
    const date = new Date().toISOString();
    
    const year = new Date().getFullYear();
    const uniqueSuffix = Date.now().toString().slice(-4);
    const num = String(invoices.length + 1).padStart(2, '0') + '-' + uniqueSuffix;
    const invoiceNumber = `INV-${year}-${num}`;

    // --- ATOMIC TRANSACTION ---
    try {
      const batch = writeBatch(db);
      const invRef = doc(collection(shopRef, 'invoices'));
      const saleRef = doc(collection(shopRef, 'sales'));

      // 1. ADD INVOICE
      batch.set(invRef, {
        invoiceNumber,
        customerName: 'Walk-in Customer',
        items: items.map(i => ({
          itemId: i.itemId,
          name: i.name,
          qty: i.qty,
          price: i.price,
          total: i.qty * i.price
        })),
        subtotal,
        discount,
        total,
        paymentMethod: type,
        status: type === 'udhaar' ? 'unpaid' : 'paid',
        date
      });

      // 2. ADD SALE RECORD
      batch.set(saleRef, { 
        total, type, items, date, invoiceId: invRef.id, subtotal, discount,
        isDeleted: false 
      });

      // 3. UPDATE STOCK LEVELS
      for (const i of items) {
        const stockItem = stock.find(s => s.id === i.itemId);
        if (stockItem) {
          const newQuantity = stockItem.quantity - i.qty;
          const newSoldCount = (stockItem.soldCount || 0) + i.qty;
          const historyEntry: StockHistory = {
            id: Math.random().toString(36).substring(7),
            type: 'sale',
            quantity: -i.qty,
            date,
            note: `Invoice ${invoiceNumber}`
          };
          
          const itemRef = doc(shopRef, 'stock', i.itemId);
          batch.update(itemRef, { 
            quantity: newQuantity, 
            soldCount: newSoldCount,
            history: arrayUnion(historyEntry)
          });
        }
      }

      // 4. ADD UDHAAR (If applicable)
      if (type === 'udhaar') {
        const udhaarRef = doc(collection(shopRef, 'udhaar'));
        batch.set(udhaarRef, {
          customerName: 'Walk-in Customer',
          amount: total,
          date,
          note: `Invoice ${invoiceNumber}`,
          isDeleted: false
        });
      }

      // 5. COMMIT ALL AT ONCE
      await batch.commit();

      // 🛡️ Audit & Reporting Sync
      await logAudit('created', 'invoices', invRef.id, `Sale processed: Rs. ${total}`, null, { invoiceNumber, total });
      await updateDailyBalance(date, total, 'credit');
      
      // Show native notification if needed
      for (const i of items) {
         const sItem = stock.find(s => s.id === i.itemId);
         if (sItem && (sItem.quantity - i.qty) <= (sItem.minThreshold || 5)) {
             toast(`${sItem.name} stock level critical!`, { icon: '⚠️' });
         }
      }

      await updateLastSync();
      return invRef.id;
    } catch (e) {
      console.error("Sale Atomic Transaction Failed", e);
      throw new Error("Sale fail ho gayi: " + (e as any).message);
    }
  };

  const addExpense = async (amount: number, description: string, category: string = 'Other') => {
    if (!user || !currentShopId) return;
    const date = new Date().toISOString();
    const docRef = await addDoc(collection(doc(db, 'shops', currentShopId), 'expenses'), { 
      amount, 
      description: sanitizeString(description), 
      category: sanitizeString(category),
      date,
      isDeleted: false
    });
    
    await logAudit('created', 'expenses', docRef.id, `Expense added: Rs. ${amount} (${description})`, null, { amount, description });
    await updateDailyBalance(date, amount, 'debit');
    await updateLastSync();
  };

  const addUdhaar = async (customerName: string, amount: number, note?: string) => {
    if (!user || !currentShopId) return;
    const date = new Date().toISOString();
    const docRef = await addDoc(collection(doc(db, 'shops', currentShopId), 'udhaar'), { 
      customerName: sanitizeString(customerName), 
      amount, 
      date, 
      note: sanitizeString(note || ''),
      isDeleted: false 
    });

    await logAudit('created', 'udhaar', docRef.id, `Udhaar added to ${customerName}: Rs. ${amount}`, null, { customerName, amount });
    await updateDailyBalance(date, amount, 'debit'); // Credit sales/debt are debits from business cashflow perspective
    await updateLastSync();
  };

  const addUdhaarPayment = async (customerName: string, amount: number, note?: string) => {
    if (!user || !currentShopId) return;
    const shopRef = doc(db, 'shops', currentShopId);
    const date = new Date().toISOString();
    
    try {
      await runTransaction(db, async (transaction) => {
        // Log the payment
        const udhaarRef = doc(collection(shopRef, 'udhaar'));
        transaction.set(udhaarRef, { 
          customerName: sanitizeString(customerName), 
          amount: -Math.abs(amount), 
          date, 
          isPayment: true, 
          note: sanitizeString(note || 'Payment Received'),
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        // Audit Trail
        transaction.set(doc(collection(shopRef, 'activities')), {
          staffName: profile?.owner || 'Owner',
          action: 'Payment Received',
          details: `Rs. ${amount} received from ${customerName}`,
          type: 'customer',
          date
        });

        // 🛡️ PRO Audit & Reporting
        const auditLogRef = doc(collection(shopRef, 'audit_logs'));
        transaction.set(auditLogRef, {
          userId: user.uid,
          action: 'created',
          collection: 'udhaar_payments',
          details: `Payment received: Rs. ${amount} from ${customerName}`,
          timestamp: date
        });
      });

      await updateDailyBalance(date, amount, 'credit'); // Payments received are cash inflows (credit)
      await updateLastSync();
      toast.success('Wasooli recorded atomically');
    } catch (e) {
      toast.error('Payment failed');
    }
  };

  const deleteUdhaar = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'udhaar', id), { isDeleted: true, deletedAt: serverTimestamp() });
    await updateLastSync();
  };

  const toggleUdhaarUrgency = async (id: string) => {
    if (!user) return;
    const item = udhaars.find(u => u.id === id);
    if (!item) return;
    await updateDoc(doc(db, 'shops', user.uid, 'udhaar', id), {
      isUrgent: !item.isUrgent
    });
  };

  const deleteCustomer = async (name: string) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const batch = writeBatch(db);

    const udhaarQ = query(collection(shopRef, 'udhaar'), where('customerName', '==', name));
    const udhaarSnap = await getDocs(udhaarQ);
    udhaarSnap.docs.forEach(d => batch.delete(d.ref));

    const contactQ = query(collection(shopRef, 'contacts'), where('name', '==', name));
    const contactSnap = await getDocs(contactQ);
    contactSnap.docs.forEach(d => batch.delete(d.ref));

    await batch.commit();
    await updateLastSync();
    toast.success(`${name} ka saara record delete ho gaya`);
  };

  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    await addDoc(collection(shopRef, 'contacts'), { 
      ...contact, 
      createdAt: new Date().toISOString(),
      isDeleted: false 
    });
    if (contact.initialBalance !== 0) {
      const amount = contact.initialBalance;
      await addDoc(collection(shopRef, 'udhaar'), {
        customerName: contact.name,
        amount,
        date: new Date().toISOString(),
        note: 'Opening Balance',
        isPayment: contact.type === 'customer' ? amount < 0 : amount > 0,
        isDeleted: false
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'contacts', id), { isDeleted: true, deletedAt: serverTimestamp() });
  };

  const updateContact = async (id: string, oldName: string, newData: { name?: string; phone?: string }) => {
    if (!user) return;
    const batch = writeBatch(db);
    const shopRef = doc(db, 'shops', user.uid);
    
    // Update contact doc
    batch.update(doc(shopRef, 'contacts', id), { 
      ...newData, 
      updatedAt: serverTimestamp() 
    });

    // If name changed, rename in all udhaars
    if (newData.name && newData.name !== oldName) {
      const q = query(collection(shopRef, 'udhaar'), where('customerName', '==', oldName));
      const snaps = await getDocs(q);
      snaps.docs.forEach(d => {
        batch.update(d.ref, { customerName: newData.name });
      });
    }

    await batch.commit();
    await updateLastSync();
  };

  const toggleContactImportance = async (contactId: string) => {
    if (!user) return;

    if (contactId.startsWith('legacy-')) {
      const name = contactId.replace('legacy-', '');
      const shopRef = doc(db, 'shops', user.uid);
      await addDoc(collection(shopRef, 'contacts'), {
        name,
        phone: '',
        type: 'customer',
        initialBalance: 0,
        createdAt: new Date().toISOString(),
        isImportant: true
      });
      toast.success(`${name} star mein add ho gaye`);
      return;
    }

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    try {
      await updateDoc(doc(db, 'shops', user.uid, 'contacts', contactId), {
        isImportant: !contact.isImportant
      });
    } catch (e) {
      console.error(e);
      toast.error('Could not toggle importance');
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'notifications', id), { read: true });
  };

  const clearNotifications = async () => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const snapshot = await getDocs(collection(shopRef, 'notifications'));
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.update(doc.ref, { isDeleted: true, deletedAt: serverTimestamp() }));
    await batch.commit();
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>): Promise<string> => {
    if (!user) throw new Error('Not logged in');
    
    // Banking-level validation: Ensure no negative numbers
    if (invoice.total < 0 || invoice.subtotal < 0) throw new Error('Invalid calculation');
    
    const shopRef = doc(db, 'shops', user.uid);
    const limit = checkLimit('sales');
    if (!limit.allowed) throw new Error(limit.message);

    const year = new Date().getFullYear();
    const uniqueSuffix = Date.now().toString().slice(-4);
    const num = String(invoices.length + 1).padStart(2, '0') + '-' + uniqueSuffix;
    const invoiceNumber = `INV-${year}-${num}`;
    const date = new Date().toISOString();

    let newInvoiceId = '';

    // --- ATOMIC FINTECH TRANSACTION ---
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Verify Stock for all items atomically
        for (const i of invoice.items) {
          const itemRef = doc(shopRef, 'stock', i.itemId);
          const itemSnap = await transaction.get(itemRef);
          
          if (!itemSnap.exists()) throw new Error(`Product ${i.itemId} not found`);
          const currentQty = itemSnap.data().quantity;
          
          if (currentQty < i.qty) {
            throw new Error(`"${itemSnap.data().name}" ka stock kam ho gaya hai. Ab sirf ${currentQty} hi bacha hai.`);
          }

          // 2. Prepare Stock Update
          const newQuantity = currentQty - i.qty;
          const newSoldCount = (itemSnap.data().soldCount || 0) + i.qty;
          const historyEntry: StockHistory = {
            id: Math.random().toString(36).substring(7),
            type: 'sale',
            quantity: -i.qty,
            date,
            note: `Invoice ${invoiceNumber}`
          };
          
          transaction.update(itemRef, { 
            quantity: newQuantity, 
            soldCount: newSoldCount,
            history: arrayUnion(historyEntry)
          });
        }

        // 3. Create Documents
        const invRef = doc(collection(shopRef, 'invoices'));
        newInvoiceId = invRef.id;
        
        transaction.set(invRef, {
          ...invoice,
          invoiceNumber,
          date,
          createdAt: serverTimestamp()
        });

        transaction.set(doc(collection(shopRef, 'sales')), { 
          total: invoice.total, 
          type: invoice.paymentMethod, 
          items: invoice.items, 
          date,
          invoiceId: invRef.id,
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        if (invoice.paymentMethod === 'udhaar') {
          transaction.set(doc(collection(shopRef, 'udhaar')), {
            customerName: invoice.customerName,
            amount: invoice.total,
            date,
            note: `Invoice ${invoiceNumber}`,
            isDeleted: false,
            createdAt: serverTimestamp()
          });
        }

        // 4. Audit Trail Entry
        transaction.set(doc(collection(shopRef, 'activities')), {
          staffName: profile?.owner || 'Owner',
          action: 'New Invoice',
          details: `Invoice ${invoiceNumber} created for Rs. ${invoice.total}`,
          type: 'sale',
          date: new Date().toISOString()
        });
      });

      await updateLastSync();
      return newInvoiceId;
    } catch (e: any) {
      console.error("Fintech Transaction Failed:", e);
      throw new Error("Transaction failed: " + e.message);
    }
  };

  const updateInvoice = async (id: string, data: { customerName?: string; status?: 'paid' | 'unpaid'; notes?: string }) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    await updateDoc(doc(shopRef, 'invoices', id), { ...data, updatedAt: serverTimestamp() });
    await updateLastSync();
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    
    // Soft delete invoice
    await updateDoc(doc(shopRef, 'invoices', id), { isDeleted: true, deletedAt: serverTimestamp() });

    // Soft delete associated sale
    const q = query(collection(shopRef, 'sales'), where('invoiceId', '==', id));
    const snaps = await getDocs(q);
    const batch = writeBatch(db);
    snaps.docs.forEach(d => {
      batch.update(d.ref, { isDeleted: true, deletedAt: serverTimestamp() });
    });
    await batch.commit();

    await updateLastSync();
  };

  const addStaff = async (member: Omit<Staff, 'id' | 'joinedAt'> & { uid?: string }) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const staffRef = member.uid ? doc(collection(shopRef, 'staff'), member.uid) : doc(collection(shopRef, 'staff'));
    
    await setDoc(staffRef, {
      ...member,
      id: staffRef.id,
      joinedAt: new Date().toISOString(),
      dailyActions: 0,
      isDeleted: false
    });

    await logAudit('created', 'staff', staffRef.id, `Staff added: ${member.name} (${member.role})`);
    await updateLastSync();
  };

  const deleteStaff = async (id: string) => {
    if (!user) return;
    const staffRef = doc(db, 'shops', user.uid, 'staff', id);
    await updateDoc(staffRef, { isDeleted: true, deletedAt: serverTimestamp() });
    await logAudit('deleted', 'staff', id, `Staff member archived`);
    await updateLastSync();
  };

  const logActivity = async (activity: Omit<StaffActivity, 'id' | 'date'>) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'activities'), {
      ...activity,
      date: new Date().toISOString()
    });
  };

  const updateStock = async (id: string, newQuantity: number, type: 'restock' | 'adjustment' = 'adjustment', note?: string) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const itemRef = doc(shopRef, 'stock', id);

    try {
      await runTransaction(db, async (transaction) => {
        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists()) throw new Error("Item not found");
        
        const currentData = itemSnap.data();
        const diff = newQuantity - currentData.quantity;
        const historyEntry: StockHistory = {
          id: Math.random().toString(36).substring(7),
          type,
          quantity: diff,
          date: new Date().toISOString(),
          note: note || (diff > 0 ? 'Stock Refilled' : 'Manual Adjustment')
        };

        transaction.update(itemRef, { 
          quantity: newQuantity,
          history: arrayUnion(historyEntry),
          updatedAt: serverTimestamp()
        });

        transaction.set(doc(collection(shopRef, 'activities')), {
          staffName: profile?.owner || 'Owner',
          action: type === 'restock' ? 'Stock Refill' : 'Stock Adjustment',
          details: `${currentData.name}: ${currentData.quantity} -> ${newQuantity}`,
          type: 'stock',
          date: new Date().toISOString()
        });
      });
      await updateLastSync();
    } catch (e: any) {
      toast.error('Stock Update Failed');
    }
  };

  const updateStockItem = async (id: string, data: Partial<Stock>) => {
    if (!user) return;
    try {
      if (data.category) data.category = normalizeCategory(data.category);
      validateStockItem(data);
      
      const shopRef = doc(db, 'shops', user.uid);
      const itemRef = doc(shopRef, 'stock', id);
      await updateDoc(itemRef, sanitizeForFirebase({ ...data, updatedAt: serverTimestamp() }));
      await updateLastSync();
    } catch (e: any) {
      console.error("Update Stock Item Failed:", e);
      throw new Error(e.message || "Update fail ho gaya");
    }
  };

  const toggleStockItemStatus = async (id: string) => {
    if (!user) return;
    const item = stock.find(s => s.id === id);
    if (!item) return;
    const shopRef = doc(db, 'shops', user.uid);
    const itemRef = doc(collection(shopRef, 'stock'), id);
    await updateDoc(itemRef, { 
      status: item.status === 'inactive' ? 'active' : 'inactive' 
    });
    await updateLastSync();
    toast.success(`Item ab ${item.status === 'inactive' ? 'active' : 'inactive'} hai`);
  };

  const addStockItem = async (item: Omit<Stock, 'id' | 'history' | 'soldCount' | 'status'>) => {
    if (!user) return;
    try {
      const normalizedCategory = normalizeCategory(item.category);
      const sanitizedItem = { 
        ...item, 
        category: normalizedCategory,
        imageUrl: item.imageUrl || '',
        sku: item.sku || '',
        packSize: item.packSize || ''
      };

      validateStockItem(sanitizedItem);
      const shopRef = doc(db, 'shops', user.uid);
      
      // Auto-register category if it's new
      if (normalizedCategory && !categories.includes(normalizedCategory)) {
        const newCats = Array.from(new Set([...categories, normalizedCategory]));
        setCategories(newCats);
        updateDoc(shopRef, { categories: newCats }).catch(() => {});
      }

      const historyEntry: StockHistory = {
        id: 'init',
        type: 'restock',
        quantity: item.quantity,
        date: new Date().toISOString(),
        note: 'Initial Stock'
      };

      await addDoc(collection(shopRef, 'stock'), sanitizeForFirebase({
        ...sanitizedItem,
        history: [historyEntry],
        soldCount: 0,
        status: 'active',
        createdAt: serverTimestamp()
      }));
      await updateLastSync();
    } catch (e: any) {
      console.error("Add Stock Item Failed:", e);
      throw e;
    }
  };
  
  const deleteStockItem = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'stock', id), { 
      isDeleted: true, 
      deletedAt: serverTimestamp() 
    });
    await updateLastSync();
  };

  const checkLimit = (type: 'sales' | 'stock' | 'customers' | 'staff') => {
    const plan = (profile?.plan || 'free').toLowerCase();
    if (['pro', 'business'].includes(plan)) return { allowed: true };

    if (plan === 'free') {
      if (type === 'staff') {
        const staffLimit = 1;
        if (staff.length >= staffLimit) {
          return { 
            allowed: false, 
            message: `Free plan mein sirf ${staffLimit} staff member allowed hai.` 
          };
        }
      }
      return { allowed: true };
    }
    return { allowed: true };
  };
  
  const clearOldData = async (days: number) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const collections = ['sales', 'expenses', 'invoices', 'activities'];
    const batch = writeBatch(db);
    let count = 0;

    for (const coll of collections) {
      const q = query(collection(shopRef, coll), where('date', '<', cutoff.toISOString()), where('isDeleted', '!=', true));
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        batch.update(d.ref, { isDeleted: true, deletedAt: serverTimestamp() });
        count++;
      });
    }
    if (count > 0) {
      await batch.commit();
      await updateLastSync();
      toast.success(`${count} purane records Archiving mein chale gaye`);
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const collections = ['stock', 'sales', 'expenses', 'udhaar', 'contacts', 'invoices', 'staff', 'activities', 'notifications'];
    for (const coll of collections) {
      const q = query(collection(shopRef, coll), where('isDeleted', '!=', true));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, deletedAt: serverTimestamp() }));
      await batch.commit();
    }
    // Also reset categories to defaults
    const defaultCats = ['Grocery', 'Electronics', 'Clothing', 'Beverages'];
    setCategories(defaultCats);
    await updateDoc(shopRef, { categories: defaultCats });
    await updateLastSync();
    toast.success('Sara data Archive folder mein bhej diya gaya');
  };

  // ── HELPERS ───────────────────────────────────────────────────────
  const normalizeCategory = (cat: string) => {
    if (!cat) return 'Miscellaneous';
    const c = cat.toLowerCase().trim();
    
    // Exact mapping for common Kiryana variations
    if (c.includes('beverage') || c.includes('drink') || c.includes('cold drink') || c.includes('cola')) return 'Tea & Beverages';
    if (c.includes('tea') || c.includes('patti') || c.includes('chai')) return 'Tea & Beverages';
    if (c.includes('grain') || c.includes('flour') || c.includes('atta') || c.includes('daal')) return 'Grains & Flour';
    if (c.includes('spice') || c.includes('masala') || c.includes('mirch')) return 'Spices & Masala';
    if (c.includes('oil') || c.includes('ghee')) return 'Cooking Oil & Ghee';
    if (c.includes('milk') || c.includes('dairy') || c.includes('yogurt')) return 'Milk & Dairy';
    if (c.includes('grocery') || c.includes('parchoon') || c.includes('kiryana')) return 'Grocery';
    if (c.includes('personal') || c.includes('soap') || c.includes('shampoo')) return 'Personal Care';
    
    // ... rest
    
    // If it's a known default cat but in a different case, return the exact default
    const defaults = ['Grocery', 'Grains & Flour', 'Spices & Masala', 'Cooking Oil & Ghee', 'Tea & Beverages', 'Milk & Dairy', 'Personal Care', 'Household Cleaning', 'Biscuits & Snacks', 'Sauces, Pickles & Chutneys', 'Desserts & Sweets', 'Frozen Foods', 'Candies & Chocolates', 'Medical / Basic Health', 'Miscellaneous'];
    const found = defaults.find(d => d.toLowerCase() === c);
    return found || cat;
  };

  /**
   * 🛡️ SANITIZE DATA FOR FIRESTORE
   * Recursively removes 'undefined' and 'NaN' keys to prevent Firestore crashes.
   */
  const sanitizeForFirebase = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(v => sanitizeForFirebase(v));
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined && (typeof v !== 'number' || !isNaN(v)))
          .map(([k, v]) => [k, sanitizeForFirebase(v)])
      );
    }
    return obj;
  };

  const autoFixStockCategories = async (currentStock: Stock[]) => {
    if (!user || currentStock.length === 0) return;
    const shopRef = doc(db, 'shops', user.uid);
    const batch = writeBatch(db);
    let needed = false;

    for (const item of currentStock) {
        const normalized = normalizeCategory(item.category);
        if (normalized !== item.category) {
            const itemRef = doc(collection(shopRef, 'stock'), item.id);
            batch.update(itemRef, { category: normalized });
            needed = true;
        }
    }

    if (needed) {
        await batch.commit();
        console.log('Categories Auto-Fixed! 🎉');
    }
  };

  const validateStockItem = (item: any) => {
    const required = ['name', 'category'];
    const missing = required.filter(f => !item[f] || (typeof item[f] === 'string' && !item[f].trim()));
    if (missing.length) throw new Error(`Required fields missing: ${missing.join(', ')}`);
    
    if (item.price !== undefined && isNaN(Number(item.price))) throw new Error('Selling Price must be a valid number');
    if (item.buyingPrice !== undefined && isNaN(Number(item.buyingPrice))) throw new Error('Buying Price must be a valid number');
    if (item.quantity !== undefined && isNaN(Number(item.quantity))) throw new Error('Quantity must be a valid number');
  };

  const updateLastSync = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'shops', user.uid), {
        lastSync: new Date().toISOString()
      });
    } catch (e) {}
  };

  const addCategory = async (cat: string) => {
    if (!user) return;
    const newCats = Array.from(new Set([...categories, cat]));
    setCategories(newCats);
    await updateDoc(doc(db, 'shops', user.uid), { categories: newCats });
  };

  const deleteCategory = async (cat: string) => {
    if (!user) return;
    const newCats = categories.filter(c => c !== cat);
    setCategories(newCats);
    await updateDoc(doc(db, 'shops', user.uid), { categories: newCats });
  };

  return (
    <ShopContext.Provider value={{ 
      stock, sales, expenses, udhaars, contacts, contactsMap, invoices, staff, activities, notifications, categories, profile, loading, 
      currentShopId, setCurrentShopId, logAudit, updateDailyBalance,
      addSale, addExpense, addUdhaar, addUdhaarPayment, deleteUdhaar, deleteCustomer, 
      addContact, updateContact, deleteContact, toggleContactImportance, addInvoice, updateInvoice, deleteInvoice, addStaff, deleteStaff, logActivity, updateStock, updateStockItem, toggleStockItemStatus, addStockItem, deleteStockItem, updateProfile, updateRolePermissions, updateSecuritySettings, toggleUdhaarUrgency, markNotificationRead, clearNotifications, checkLimit, clearOldData, clearAllData, updateLastSync, addCategory, deleteCategory 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be inside ShopProvider');
  return ctx;
};
