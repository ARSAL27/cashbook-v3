import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import {
  collection, addDoc, onSnapshot, doc, updateDoc, setDoc,
  serverTimestamp, query, orderBy, writeBatch, getDocs, where, arrayUnion
} from 'firebase/firestore';
import { sendNativeNotification } from '../utils/notifications';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface StockHistory {
  id: string;
  type: 'restock' | 'sale' | 'adjustment';
  quantity: number;
  date: string;
  note?: string;
}

export interface Stock {
  id: string;
  name: string;
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
  adminBroadcast?: boolean; // New flag for manual broadcasts
}

interface ShopContextType {
  stock: Stock[];
  sales: Sale[];
  expenses: Expense[];
  udhaars: Udhaar[];
  contacts: Contact[];
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
  deleteInvoice: (id: string) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id' | 'joinedAt'>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
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
  const [categories, setCategories] = useState<string[]>(['Grocery', 'Electronics', 'Clothing', 'Beverages']);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setStock([]); setSales([]); setExpenses([]); setUdhaars([]); setContacts([]); 
      setInvoices([]); setStaff([]); setActivities([]); setNotifications([]); setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const shopRef = doc(db, 'shops', user.uid);
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
          if (data.categories) setCategories(data.categories);
        }
        setLoading(false);
      }, () => setLoading(false)),

      onSnapshot(query(collection(shopRef, 'stock'), orderBy('name')), snap => {
        setStock(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(i => !i.isDeleted));
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
    if (!user || !profile) return;
    const shopRef = doc(db, 'shops', user.uid);
    await updateDoc(shopRef, { 
      securitySettings: { ...profile.securitySettings, ...settings }
    });
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
    const num = String(invoices.length + 1).padStart(3, '0');
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
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'expenses'), { 
      amount, 
      description, 
      category,
      date: new Date().toISOString(),
      isDeleted: false
    });
    await updateLastSync();
  };

  const addUdhaar = async (customerName: string, amount: number, note?: string) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'udhaar'), { 
      customerName, 
      amount, 
      date: new Date().toISOString(), 
      note: note || '',
      isDeleted: false 
    });
    await updateLastSync();
  };

  const addUdhaarPayment = async (customerName: string, amount: number, note?: string) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'udhaar'), { 
      customerName, amount: -Math.abs(amount), date: new Date().toISOString(), isPayment: true, note: note || '',
      isDeleted: false
    });
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
    
    for (const i of invoice.items) {
      const stockItem = stock.find(s => s.id === i.itemId);
      if (stockItem && stockItem.quantity < i.qty) {
        throw new Error(`"${stockItem.name}" ka stock kam hai. Sirf ${stockItem.quantity} pieces hain.`);
      }
    }
    
    const shopRef = doc(db, 'shops', user.uid);
    const limit = checkLimit('sales');
    if (!limit.allowed) throw new Error(limit.message);

    const year = new Date().getFullYear();
    const num = String(invoices.length + 1).padStart(3, '0');
    const invoiceNumber = `INV-${year}-${num}`;
    const date = new Date().toISOString();

    const invRef = await addDoc(collection(shopRef, 'invoices'), {
      ...invoice,
      invoiceNumber,
      date
    });

    await addDoc(collection(shopRef, 'sales'), { 
      total: invoice.total, 
      type: invoice.paymentMethod, 
      items: invoice.items, 
      date,
      invoiceId: invRef.id,
      isDeleted: false
    });

    for (const i of invoice.items) {
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
        await updateDoc(doc(shopRef, 'stock', i.itemId), { 
          quantity: newQuantity, 
          soldCount: newSoldCount,
          history: arrayUnion(historyEntry)
        });
      }
    }

    if (invoice.paymentMethod === 'udhaar') {
      await addDoc(collection(shopRef, 'udhaar'), {
        customerName: invoice.customerName,
        amount: invoice.total,
        date,
        note: `Invoice ${invoiceNumber}`,
        isDeleted: false
      });
    }

    await updateLastSync();
    return invRef.id;
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

  const addStaff = async (member: Omit<Staff, 'id' | 'joinedAt'>) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'staff'), {
      ...member,
      joinedAt: new Date().toISOString(),
      dailyActions: 0,
      isDeleted: false
    });
  };

  const deleteStaff = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'shops', user.uid, 'staff', id), { isDeleted: true, deletedAt: serverTimestamp() });
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
    const item = stock.find(s => s.id === id);
    if (!item) return;

    const diff = newQuantity - item.quantity;
    const historyEntry: StockHistory = {
      id: Math.random().toString(36).substring(7),
      type: type,
      quantity: diff,
      date: new Date().toISOString(),
      note: note || (diff > 0 ? 'Stock Refilled' : 'Manual Adjustment')
    };

    const shopRef = doc(db, 'shops', user.uid);
    const itemRef = doc(collection(shopRef, 'stock'), id);
    await updateDoc(itemRef, { 
      quantity: newQuantity,
      history: arrayUnion(historyEntry)
    });
    await updateLastSync();

    if (newQuantity <= (item.minThreshold || 5) && item.quantity > (item.minThreshold || 5)) {
      toast(`${item.name} stock level drop ho gaya!`, { icon: '⚠️', duration: 4000 });
    }
  };

  const updateStockItem = async (id: string, data: Partial<Stock>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const itemRef = doc(collection(shopRef, 'stock'), id);
    await updateDoc(itemRef, { ...data, updatedAt: serverTimestamp() });
    await updateLastSync();
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
    const shopRef = doc(db, 'shops', user.uid);
    
    // Auto-register category if it's new
    if (item.category && !categories.includes(item.category)) {
      const newCats = Array.from(new Set([...categories, item.category]));
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
    await addDoc(collection(shopRef, 'stock'), {
      ...item,
      history: [historyEntry],
      soldCount: 0,
      status: 'active',
      sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      isDeleted: false
    });
    await updateLastSync();
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
    await updateLastSync();
    toast.success('Sara data Archive folder mein bhej diya gaya');
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
      stock, sales, expenses, udhaars, contacts, invoices, staff, activities, notifications, categories, profile, loading, 
      addSale, addExpense, addUdhaar, addUdhaarPayment, deleteUdhaar, deleteCustomer, 
      addContact, updateContact, deleteContact, toggleContactImportance, addInvoice, deleteInvoice, addStaff, deleteStaff, logActivity, updateStock, updateStockItem, toggleStockItemStatus, addStockItem, deleteStockItem, updateProfile, updateRolePermissions, updateSecuritySettings, toggleUdhaarUrgency, markNotificationRead, clearNotifications, checkLimit, clearOldData, clearAllData, updateLastSync, addCategory, deleteCategory 
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
