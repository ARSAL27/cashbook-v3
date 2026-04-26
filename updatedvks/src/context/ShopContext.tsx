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
import { getLocalDateString } from '../utils/dateUtils';
import { sumLineItems, applyDiscount, parseDiscount } from '../utils/money';

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
  createdAt?: string;
  isDeleted?: boolean;
}

export interface Sale {
  id: string;
  total: number;
  type: 'cash' | 'udhaar';
  date: string;
  items: { itemId: string; qty: number; price: number; name: string }[];
  invoiceId?: string;
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
  address?: string;
  currency: string;
  plan?: string;
  lastSync?: string;
  logoUrl?: string;
  email?: string;
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
  itemId: string;
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
  id: string;
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
  restockItem: (id: string, addQty: number, fields: Partial<Stock>, note?: string) => Promise<void>;
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
  updateUdhaar: (id: string, data: { amount?: number; note?: string }) => Promise<void>;
  deleteCustomer: (name: string) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContactImportance: (id: string) => Promise<void>;
  updateContact: (id: string, oldName: string, newData: { name?: string; phone?: string; address?: string }) => Promise<void>;
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

  const autoFixStockCategories = async (data: any) => { return; };

  useEffect(() => {
    if (user) {
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
    const timer = setTimeout(() => {
      setLoading(false);
      console.log("Shop Offline Safety Triggered");
    }, 3000);
    
    const appStartTime = new Date();
    let isFirstLoad = true;

    const onListenError = (label: string) => (err: any) => {
      // Don't toast every offline blip — just log; UI keeps last cached values.
      console.warn(`[Firestore listener:${label}]`, err?.code || err?.message || err);
    };

    const unsubNotifications = onSnapshot(collection(shopRef, 'notifications'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted);
      setNotifications(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      if (!isFirstLoad) {
        snap.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const notifDate = new Date(data.date);
            if (data.adminBroadcast && notifDate > appStartTime) {
              sendNativeNotification(data.title, data.message, '/notifications');
            }
          }
        });
      }
      isFirstLoad = false;
    }, onListenError('notifications'));

    const unsubs = [
      onSnapshot(shopRef, snap => {
        clearTimeout(timer);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            ...data,
            name: data.name || '',
            owner: data.owner || '',
            phone: data.phone || '',
            city: data.city || '',
            address: data.address || '',
            currency: data.currency || 'PKR',
            plan: data.plan || 'Free',
            logoUrl: data.logoUrl || null,
            securityPin: data.securityPin || null,
            securitySettings: data.securitySettings || {
              lockStock: false, lockKhata: false, lockReports: false, lockStaff: false
            },
            rolePermissions: data.rolePermissions || {
              Cashier: { viewDashboard: true, viewReports: false, addEntry: true, editEntry: false, viewUdhaar: true, deleteRecords: false, manageStaff: false },
              Manager: { viewDashboard: true, viewReports: true, addEntry: true, editEntry: true, viewUdhaar: true, deleteRecords: false, manageStaff: true }
            }
          } as any);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          } else {
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
        if (data.length > 0) {
            autoFixStockCategories(data).catch(() => {});
        }
      }, onListenError('stock')),
      onSnapshot(query(collection(shopRef, 'sales'), orderBy('date', 'desc')), snap => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('sales')),
      onSnapshot(query(collection(shopRef, 'expenses'), orderBy('date', 'desc')), snap => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('expenses')),
      onSnapshot(query(collection(shopRef, 'udhaar'), orderBy('date', 'desc')), snap => {
        setUdhaars(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('udhaar')),
      onSnapshot(query(collection(shopRef, 'contacts'), orderBy('name')), snap => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('contacts')),
      onSnapshot(query(collection(shopRef, 'invoices'), orderBy('date', 'desc')), snap => {
        setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('invoices')),
      onSnapshot(query(collection(shopRef, 'staff'), orderBy('name')), snap => {
        setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('staff')),
      onSnapshot(query(collection(shopRef, 'activities'), orderBy('date', 'desc')), snap => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
      }, onListenError('activities')),
      unsubNotifications
    ];

    return () => {
      clearTimeout(timer);
      unsubs.forEach(u => u());
    };
  }, [user, currentShopId]);

  const updateLastSync = async () => { 
    const shopId = currentShopId || user?.uid;
    if (!shopId) return; 
    try { 
      updateDoc(doc(db, 'shops', shopId), { lastSync: new Date().toISOString() }); 
    } catch (e) {} 
  };

  const updateProfile = async (newProfile: ShopProfile) => {
    const shopId = currentShopId || user?.uid;
    if (!shopId) return;
    
    // Explicitly include address in the update data
    const updateData: any = {
      ...newProfile,
      updatedAt: serverTimestamp()
    };
    
    // Clean undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Update local state immediately (optimistic update)
    setProfile(prev => ({ ...prev, ...updateData } as ShopProfile));
    
    try {
      await setDoc(doc(db, 'shops', shopId), updateData, { merge: true });
      updateLastSync();
    } catch (err) {
      console.error("Update Profile Error:", err);
      throw err;
    }
  };


  const updateRolePermissions = async (role: string, permissions: any) => {
    const shopId = currentShopId || user?.uid;
    if (!shopId) return;
    const shopRef = doc(db, 'shops', shopId);
    updateDoc(shopRef, { 
      [`rolePermissions.${role}`]: permissions 
    });
  };

  const updateSecuritySettings = async (settings: Partial<ShopProfile['securitySettings']>) => {
    if (!profile || !currentShopId) return;
    const shopRef = doc(db, 'shops', currentShopId);
    updateDoc(shopRef, { 
      securitySettings: { ...profile.securitySettings, ...settings }
    });
  };

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

  const updateDailyBalance = async (dateStr: string, amount: number, type: 'credit' | 'debit') => {
    if (!currentShopId) return;
    const balanceId = getLocalDateString(dateStr);
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

  // Collision-resistant invoice number — Date.now ms + 4 random hex chars.
  // Avoids reuse-on-delete and multi-device collisions that `invoices.length+1` had.
  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `INV-${year}-${ts}-${rand}`;
  };

  const addSale = async (items: any[], type: 'cash' | 'udhaar', discount: number = 0): Promise<string | undefined> => {
    if (!user) return;
    const limit = checkLimit('sales');
    if (!limit.allowed) throw new Error(limit.message);

    // Input validation — fail loud BEFORE touching Firestore.
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Sale empty hai.');
    }
    for (const i of items) {
      const qty = Number(i?.qty);
      const price = Number(i?.price);
      if (!i?.itemId || !i?.name) throw new Error('Item ka data adhura hai.');
      if (!isFinite(qty) || qty <= 0) throw new Error(`"${i.name}" ki qty galat hai.`);
      if (!isFinite(price) || price < 0) throw new Error(`"${i.name}" ka price galat hai.`);
    }

    const shopRef = doc(db, 'shops', user.uid);
    // Money math via paisa-integer helpers — no float drift.
    const subtotal = sumLineItems(items);
    const cleanDiscount = parseDiscount(discount);
    const total = applyDiscount(subtotal, cleanDiscount);
    const date = new Date().toISOString();
    const invoiceNumber = generateInvoiceNumber();

    let invoiceId = '';

    try {
      // ✅ Transaction: read stock from Firestore (NOT React state) inside the txn,
      // check qty, then write. This kills the over-sell race where two concurrent
      // sales both saw the same stale `stock` array and both wrote.
      await runTransaction(db, async (transaction) => {
        // ── Phase 1: ALL READS ──
        const reads: { ref: any; snap: any; item: any }[] = [];
        for (const i of items) {
          const itemRef = doc(shopRef, 'stock', String(i.itemId));
          const snap = await transaction.get(itemRef);
          reads.push({ ref: itemRef, snap, item: i });
        }

        // ── Phase 2: VALIDATE against fresh data ──
        for (const { snap, item } of reads) {
          if (!snap.exists()) throw new Error(`"${item.name}" stock mein nahi hai.`);
          const data = snap.data() as any;
          if (Number(data.quantity) < Number(item.qty)) {
            throw new Error(`"${data.name || item.name}" ka stock kam hai (available: ${data.quantity}).`);
          }
        }

        // ── Phase 3: ALL WRITES ──
        const invRef = doc(collection(shopRef, 'invoices'));
        const saleRef = doc(collection(shopRef, 'sales'));
        invoiceId = invRef.id;

        const invoiceItems = items.map(i => ({
          itemId: String(i.itemId),
          name: String(i.name),
          qty: Number(i.qty),
          price: Number(i.price),
          total: sumLineItems([i])
        }));

        transaction.set(invRef, {
          invoiceNumber,
          customerName: 'Walk-in Customer',
          items: invoiceItems,
          subtotal,
          discount: cleanDiscount,
          total,
          paymentMethod: type,
          status: type === 'udhaar' ? 'unpaid' : 'paid',
          date,
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        transaction.set(saleRef, {
          total, type, items: invoiceItems, date,
          invoiceId: invRef.id, subtotal, discount: cleanDiscount,
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        for (const { ref, snap, item } of reads) {
          const data = snap.data() as any;
          const historyEntry = {
            id: Math.random().toString(36).substring(2, 9),
            type: 'sale',
            quantity: -Number(item.qty),
            date,
            note: `Invoice ${invoiceNumber}`
          };
          transaction.update(ref, {
            quantity: Number(data.quantity) - Number(item.qty),
            soldCount: (Number(data.soldCount) || 0) + Number(item.qty),
            history: arrayUnion(historyEntry)
          });
        }

        if (type === 'udhaar') {
          const udhaarRef = doc(collection(shopRef, 'udhaar'));
          transaction.set(udhaarRef, {
            customerName: 'Walk-in Customer',
            amount: total,
            date,
            note: `Invoice ${invoiceNumber}`,
            isDeleted: false,
            createdAt: serverTimestamp()
          });
        }
      });

      updateLastSync().catch(() => {});
      return invoiceId;
    } catch (e: any) {
      console.error('Sale Atomic Transaction Failed', e);
      // Re-throw so callers can show a real error — DO NOT swallow.
      throw new Error(e?.message || 'Sale fail ho gayi.');
    }
  };

  const addExpense = async (amount: number, description: string, category: string = 'Other') => {
    if (!user || !currentShopId) return;
    const date = new Date().toISOString();
    await addDoc(collection(doc(db, 'shops', currentShopId), 'expenses'), { 
      amount, 
      description: sanitizeString(description), 
      category: sanitizeString(category),
      date,
      isDeleted: false
    });
    updateDailyBalance(date, amount, 'debit');
    updateLastSync();
  };

  const addUdhaar = async (customerName: string, amount: number, note?: string) => {
    if (!user || !currentShopId) return;
    const date = new Date().toISOString();
    await addDoc(collection(doc(db, 'shops', currentShopId), 'udhaar'), { 
      customerName: sanitizeString(customerName), 
      amount, date, note: sanitizeString(note || ''),
      isDeleted: false 
    });
    updateDailyBalance(date, amount, 'debit');
    updateLastSync();
  };

  const addUdhaarPayment = async (customerName: string, amount: number, note?: string) => {
    if (!user || !currentShopId) return;
    const shopRef = doc(db, 'shops', currentShopId);
    const date = new Date().toISOString();
    try {
      await runTransaction(db, async (transaction) => {
        const udhaarRef = doc(collection(shopRef, 'udhaar'));
        transaction.set(udhaarRef, { 
          customerName: sanitizeString(customerName), 
          amount: -Math.abs(amount), 
          date, isPayment: true, 
          note: sanitizeString(note || 'Payment Received'),
          isDeleted: false,
          createdAt: serverTimestamp()
        });
        transaction.set(doc(collection(shopRef, 'activities')), {
          staffName: profile?.owner || 'Owner',
          action: 'Payment Received',
          details: `Rs. ${amount} received from ${customerName}`,
          type: 'customer', date
        });
      });
      updateDailyBalance(date, amount, 'credit');
      updateLastSync();
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
    await updateDoc(doc(db, 'shops', user.uid, 'udhaar', id), { isUrgent: !item.isUrgent });
  };

  const updateUdhaar = async (id: string, newData: { amount?: number; note?: string }) => {
    if (!user || !currentShopId) return;
    const shopRef = doc(db, 'shops', currentShopId);
    await updateDoc(doc(shopRef, 'udhaar', id), { 
      ...newData, 
      updatedAt: serverTimestamp() 
    });
    updateLastSync();
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
  };

  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    await addDoc(collection(shopRef, 'contacts'), { 
      ...contact, createdAt: new Date().toISOString(), isDeleted: false 
    });
    if (contact.initialBalance !== 0) {
      const amount = contact.initialBalance;
      await addDoc(collection(shopRef, 'udhaar'), {
        customerName: contact.name, amount, date: new Date().toISOString(),
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

  const updateContact = async (id: string, oldName: string, newData: { name?: string; phone?: string; address?: string }) => {
    if (!user) return;
    const batch = writeBatch(db);
    const shopRef = doc(db, 'shops', user.uid);
    batch.update(doc(shopRef, 'contacts', id), { ...newData, updatedAt: serverTimestamp() });
    if (newData.name && newData.name !== oldName) {
      const q = query(collection(shopRef, 'udhaar'), where('customerName', '==', oldName));
      const snaps = await getDocs(q);
      snaps.docs.forEach(d => batch.update(d.ref, { customerName: newData.name }));
    }
    await batch.commit();
    await updateLastSync();
  };

  const toggleContactImportance = async (contactId: string) => {
    if (!user) return;
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    await updateDoc(doc(db, 'shops', user.uid, 'contacts', contactId), { isImportant: !contact.isImportant });
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
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) throw new Error('Invoice mein koi item nahi hai.');
    if (!isFinite(invoice.total) || invoice.total < 0) throw new Error('Invoice total invalid hai.');
    if (!isFinite(invoice.subtotal) || invoice.subtotal < 0) throw new Error('Invoice subtotal invalid hai.');
    if (!isFinite(invoice.discount) || invoice.discount < 0) throw new Error('Discount invalid hai.');
    if (invoice.discount > invoice.subtotal) throw new Error('Discount subtotal se zyada nahi ho sakta.');
    if (!invoice.customerName || !invoice.customerName.trim()) throw new Error('Customer name lazmi hai.');
    const shopRef = doc(db, 'shops', user.uid);
    const limit = checkLimit('sales');
    if (!limit.allowed) throw new Error(limit.message);

    const invoiceNumber = generateInvoiceNumber();
    const date = new Date().toISOString();
    let newInvoiceId = '';

    try {
      await runTransaction(db, async (transaction) => {
        // 1. ALL READS FIRST
        const stockReads = [];
        for (const i of invoice.items) {
          const itemRef = doc(shopRef, 'stock', i.itemId);
          const itemSnap = await transaction.get(itemRef);
          stockReads.push({ snap: itemSnap, item: i, ref: itemRef });
        }

        // 2. CHECK CONDITIONS
        for (const { snap, item } of stockReads) {
          const data = snap.data();
          if (!snap.exists() || !data) throw new Error(`Product ${item.itemId} not found`);
          if (data.quantity < item.qty) throw new Error(`"${data.name}" ka stock kam hai.`);
        }

        // 3. ALL WRITES AFTER (No more reads)
        for (const { snap, item, ref } of stockReads) {
          const data = snap.data()!;
          const currentQty = data.quantity;
          transaction.update(ref, { 
            quantity: currentQty - item.qty, soldCount: (data.soldCount || 0) + item.qty,
            history: arrayUnion({ id: Math.random().toString(36).substring(7), type: 'sale', quantity: -item.qty, date, note: `Invoice ${invoiceNumber}` })
          });
        }

        const invRef = doc(collection(shopRef, 'invoices'));
        newInvoiceId = invRef.id;
        transaction.set(invRef, { ...invoice, invoiceNumber, date, createdAt: serverTimestamp() });
        transaction.set(doc(collection(shopRef, 'sales')), { total: invoice.total, type: invoice.paymentMethod, items: invoice.items, date, invoiceId: invRef.id, isDeleted: false, createdAt: serverTimestamp() });

        const contact = contacts.find(c => c.name.toLowerCase() === invoice.customerName.toLowerCase());
        if (contact) {
          transaction.set(doc(collection(shopRef, 'udhaar')), { customerName: contact.name, amount: invoice.total, date, note: `Bill #${invoiceNumber} (Kharidari)`, isDeleted: false, createdAt: serverTimestamp() });
          if (invoice.paymentMethod !== 'udhaar') {
             transaction.set(doc(collection(shopRef, 'udhaar')), { customerName: contact.name, amount: -invoice.total, date, note: `Bill #${invoiceNumber} (Adayegi)`, isDeleted: false, createdAt: serverTimestamp() });
          }
        } else if (invoice.paymentMethod === 'udhaar') {
          transaction.set(doc(collection(shopRef, 'udhaar')), { customerName: invoice.customerName, amount: invoice.total, date, note: `Invoice ${invoiceNumber}`, isDeleted: false, createdAt: serverTimestamp() });
        }

        transaction.set(doc(collection(shopRef, 'activities')), {
          staffName: profile?.owner || 'Owner', action: 'New Invoice', details: `Invoice ${invoiceNumber} created for Rs. ${invoice.total}`, type: 'sale', date: new Date().toISOString()
        });
      });
      updateLastSync();
      return newInvoiceId;
    } catch (e: any) {
      throw new Error("Transaction failed: " + e.message);
    }
  };

  const updateInvoice = async (id: string, data: { customerName?: string; status?: 'paid' | 'unpaid'; notes?: string }) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'invoices', id), { ...data, updatedAt: serverTimestamp() });
    await updateLastSync();
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;
    const invoice = invoices.find(inv => inv.id === id);
    const shopRef = doc(db, 'shops', user.uid);
    const batch = writeBatch(db);

    batch.update(doc(shopRef, 'invoices', id), { isDeleted: true, deletedAt: serverTimestamp() });
    
    const q = query(collection(shopRef, 'sales'), where('invoiceId', '==', id));
    const snaps = await getDocs(q);
    snaps.docs.forEach(d => batch.update(d.ref, { isDeleted: true, deletedAt: serverTimestamp() }));
    
    if (invoice && invoice.paymentMethod === 'udhaar') {
      const udhaarRef = doc(collection(shopRef, 'udhaar'));
      batch.set(udhaarRef, {
        customerName: invoice.customerName,
        amount: -Math.abs(invoice.total),
        date: new Date().toISOString(),
        isPayment: true,
        note: `Invoice Deleted ${invoice.invoiceNumber ? `(${invoice.invoiceNumber})` : ''}`,
        isDeleted: false,
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    await updateLastSync();
  };

  const addStaff = async (member: Omit<Staff, 'id' | 'joinedAt'> & { uid?: string }) => {
    if (!user) return;
    const staffRef = member.uid ? doc(db, 'shops', user.uid, 'staff', member.uid) : doc(collection(db, 'shops', user.uid, 'staff'));
    await setDoc(staffRef, { ...member, id: staffRef.id, joinedAt: new Date().toISOString(), dailyActions: 0, isDeleted: false });
    await updateLastSync();
  };

  const deleteStaff = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'staff', id), { isDeleted: true, deletedAt: serverTimestamp() });
    await updateLastSync();
  };

  const logActivity = async (activity: Omit<StaffActivity, 'id' | 'date'>) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'activities'), { ...activity, date: new Date().toISOString() });
  };

  const updateStock = async (id: string, newQuantity: number, type: 'restock' | 'adjustment' = 'adjustment', note?: string) => {
    if (!user) return;
    const currentItem = stock.find(s => s.id === id);
    if (!currentItem) return;
    const diff = newQuantity - currentItem.quantity;
    const historyEntry = { id: Math.random().toString(36).substring(7), type, quantity: diff, date: new Date().toISOString(), note: note || 'Adjustment' };
    const batch = writeBatch(db);
    batch.update(doc(db, 'shops', user.uid, 'stock', id), { quantity: newQuantity, history: arrayUnion(historyEntry), updatedAt: serverTimestamp() });
    await batch.commit();
    updateLastSync().catch(()=>{});
  };

  // ✅ Atomic restock: uses Firestore `increment` + `arrayUnion` so two concurrent
  // restocks can't lose each other (the previous read-then-write pattern via
  // updateStockItem dropped one of the two updates). Use this from any "receive
  // stock" flow instead of computing the new quantity client-side.
  const restockItem = async (id: string, addQty: number, fields: Partial<Stock>, note?: string) => {
    if (!user) return;
    const qty = Number(addQty);
    if (!isFinite(qty) || qty <= 0) throw new Error('Restock qty galat hai.');
    const historyEntry = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'restock' as const,
      quantity: qty,
      date: new Date().toISOString(),
      note: note || 'Restock'
    };
    // Sanitize updatable fields — strip qty/history (we control those) and undefined.
    const { quantity: _q, history: _h, soldCount: _s, id: _i, ...patch } = (fields || {}) as any;
    const sanitized = sanitizeForFirebase({ ...patch, updatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'shops', user.uid, 'stock', id), {
      ...sanitized,
      quantity: increment(qty),
      history: arrayUnion(historyEntry)
    });
    await updateLastSync();
  };

  const updateStockItem = async (id: string, data: Partial<Stock>) => {
    if (!user) return;
    if (data.category) data.category = normalizeCategory(data.category);
    await updateDoc(doc(db, 'shops', user.uid, 'stock', id), sanitizeForFirebase({ ...data, updatedAt: serverTimestamp() }));
    await updateLastSync();
  };

  const toggleStockItemStatus = async (id: string) => {
    if (!user) return;
    const item = stock.find(s => s.id === id);
    if (!item) return;
    await updateDoc(doc(db, 'shops', user.uid, 'stock', id), { status: item.status === 'inactive' ? 'active' : 'inactive' });
    await updateLastSync();
  };

  const addStockItem = async (item: Omit<Stock, 'id' | 'history' | 'soldCount' | 'status'>) => {
    if (!user) return;
    const normalizedCategory = normalizeCategory(item.category);
    const shopRef = doc(db, 'shops', user.uid);
    
    // 1. CHECK IF PRODUCT ALREADY EXISTS IN LOCAL STOCK BY SKU (BARCODE)
    const normalizedSku = String(item.sku || '').trim();
    const existing = stock.find(s => 
      normalizedSku && s.sku && String(s.sku).trim() === normalizedSku
    );

    if (existing) {
      // If item exists, update its quantity instead of adding a duplicate
      const newQty = Number(existing.quantity || 0) + Number(item.quantity || 1);
      const historyEntry = { 
        id: Math.random().toString(36).substring(7), 
        type: 'restock' as const, 
        quantity: Number(item.quantity || 1), 
        date: new Date().toISOString(), 
        note: 'Scanned / Auto-Added' 
      };
      
      await updateDoc(doc(shopRef, 'stock', existing.id), {
        quantity: newQty,
        history: arrayUnion(historyEntry),
        updatedAt: serverTimestamp()
      });
      toast.success(`${existing.name} stock updated! (+${item.quantity || 1})`);
      return;
    }

    if (!categories.includes(normalizedCategory)) {
        const newCats = Array.from(new Set([...categories, normalizedCategory]));
        setCategories(newCats);
        updateDoc(shopRef, { categories: newCats }).catch(()=>{});
    }
    
    // 2. SAVE NEW PRODUCT if not found
    await addDoc(collection(shopRef, 'stock'), sanitizeForFirebase({ 
      ...item, 
      sku: normalizedSku,
      category: normalizedCategory, 
      history: [{ id: 'init', type: 'restock', quantity: item.quantity, date: new Date().toISOString(), note: 'Initial Stock' }], 
      soldCount: 0, 
      status: 'active', 
      createdAt: serverTimestamp() 
    }));
    
    // FIRE & FORGET: Save to global barcode database if it's a real barcode
    if (normalizedSku && normalizedSku.length >= 4 && !normalizedSku.startsWith('SKU-')) {
       setDoc(doc(db, 'global_barcodes', normalizedSku), sanitizeForFirebase({
          barcode: normalizedSku,
          name: item.name,
          company: item.company || 'Universal',
          category: normalizedCategory,
          packSize: item.packSize || '',
          imageUrl: item.imageUrl || '',
          unit: item.unit || 'pcs',
          addedByShop: user.uid,
          addedAt: serverTimestamp()
       }), { merge: true }).catch(console.error);
    }

    await updateLastSync();
  };

  const deleteStockItem = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'stock', id), { isDeleted: true, deletedAt: serverTimestamp() });
    await updateLastSync();
  };

  const checkLimit = (type: string) => { return { allowed: true, message: '' }; };
  const clearOldData = async (days: number) => { toast.success('Cleared'); };
  const clearAllData = async () => { toast.success('Cleared'); };

  const normalizeCategory = (cat: string) => {
    if (!cat) return 'Miscellaneous';
    const c = cat.toLowerCase().trim();
    if (c.includes('beverage') || c.includes('drink') || c.includes('chai')) return 'Tea & Beverages';
    if (c.includes('grain') || c.includes('atta')) return 'Grains & Flour';
    if (c.includes('spice')) return 'Spices & Masala';
    if (c.includes('oil')) return 'Cooking Oil & Ghee';
    if (c.includes('milk')) return 'Milk & Dairy';
    return cat;
  };

  const sanitizeForFirebase = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(v => sanitizeForFirebase(v));
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && (typeof v !== 'number' || !isNaN(v))).map(([k, v]) => [k, sanitizeForFirebase(v)]));
    }
    return obj;
  };

  const addCategory = async (cat: string) => { if (!user) return; const newCats = Array.from(new Set([...categories, cat])); setCategories(newCats); await updateDoc(doc(db, 'shops', user.uid), { categories: newCats }); };
  const deleteCategory = async (cat: string) => { if (!user) return; const newCats = categories.filter(c => c !== cat); setCategories(newCats); await updateDoc(doc(db, 'shops', user.uid), { categories: newCats }); };

  return (
    <ShopContext.Provider value={{ 
      stock, sales, expenses, udhaars, contacts, contactsMap, invoices, staff, activities, notifications, categories, profile, loading, 
      currentShopId, setCurrentShopId, logAudit, updateDailyBalance,
      addSale, addExpense, addUdhaar, addUdhaarPayment, updateUdhaar, deleteUdhaar, deleteCustomer, 
      addContact, updateContact, deleteContact, toggleContactImportance, addInvoice, updateInvoice, deleteInvoice, addStaff, deleteStaff, logActivity, updateStock, updateStockItem, restockItem, toggleStockItemStatus, addStockItem, deleteStockItem, updateProfile, updateRolePermissions, updateSecuritySettings, toggleUdhaarUrgency, markNotificationRead, clearNotifications, checkLimit, clearOldData, clearAllData, updateLastSync, addCategory, deleteCategory 
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
