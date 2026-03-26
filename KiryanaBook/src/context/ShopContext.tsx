import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import {
  collection, addDoc, onSnapshot, doc, updateDoc, setDoc,
  serverTimestamp, query, orderBy, deleteDoc, writeBatch, getDocs, where, arrayUnion
} from 'firebase/firestore';

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
  unit: 'kg' | 'units' | 'packs' | 'ltr' | 'pcs';
  category: string;
  minThreshold: number;
  sku: string;
  history: StockHistory[];
  soldCount: number;
  imageUrl?: string;
  packSize?: string;
  status: 'active' | 'inactive';
}

export interface Sale {
  id: string;
  total: number;
  type: 'cash' | 'udhaar';
  date: string;
  items: { itemId: string; qty: number; price: number; name: string }[];
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export interface Udhaar {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  isPayment?: boolean;
  note?: string;
  isUrgent?: boolean;
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
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: 'Manager' | 'Cashier' | 'Clerk';
  status: 'active' | 'inactive';
  joinedAt: string;
  dailyActions?: number;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  details: string;
  type: 'sale' | 'expense' | 'customer' | 'report';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'payment' | 'system' | 'customer' | 'supplier';
  date: string;
  read: boolean;
  relatedId?: string;
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
  profile: ShopProfile | null;
  loading: boolean;
  addSale: (items: any[], type: 'cash' | 'udhaar') => Promise<string | undefined>;
  addExpense: (amount: number, description: string, category?: string) => Promise<void>;
  addUdhaar: (customerName: string, amount: number, note?: string) => Promise<void>;
  updateStock: (id: string, newQuantity: number, type?: 'restock' | 'adjustment', note?: string) => Promise<void>;
  updateStockItem: (id: string, data: Partial<Stock>) => Promise<void>;
  toggleStockItemStatus: (id: string) => Promise<void>;
  addStockItem: (item: Omit<Stock, 'id' | 'history' | 'soldCount' | 'status'>) => Promise<void>;
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
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => Promise<string>;
  deleteInvoice: (id: string) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id' | 'joinedAt'>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  logActivity: (activity: Omit<StaffActivity, 'id' | 'date'>) => Promise<void>;
  toggleUdhaarUrgency: (id: string) => Promise<void>;
  checkLimit: (type: 'sales' | 'stock' | 'customers') => { allowed: boolean; message?: string };
  clearOldData: (days: number) => Promise<void>;
  clearAllData: () => Promise<void>;
  updateLastSync: () => Promise<void>;
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
        }
        setLoading(false);
      }, () => setLoading(false)),

      onSnapshot(query(collection(shopRef, 'stock'), orderBy('name')), snap => {
        setStock(snap.docs.map(d => ({ id: d.id, ...d.data() } as Stock)));
      }),
      onSnapshot(query(collection(shopRef, 'sales'), orderBy('date', 'desc')), snap => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
      }),
      onSnapshot(query(collection(shopRef, 'expenses'), orderBy('date', 'desc')), snap => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
      }),
      onSnapshot(query(collection(shopRef, 'udhaar'), orderBy('date', 'desc')), snap => {
        setUdhaars(snap.docs.map(d => ({ id: d.id, ...d.data() } as Udhaar)));
      }),
      onSnapshot(query(collection(shopRef, 'contacts'), orderBy('name')), snap => {
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contact)));
      }),
      onSnapshot(query(collection(shopRef, 'invoices'), orderBy('date', 'desc')), snap => {
        setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
      }),
      onSnapshot(query(collection(shopRef, 'staff'), orderBy('name')), snap => {
        setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
      }),
      onSnapshot(collection(shopRef, 'activities'), snap => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffActivity)));
      }),
      onSnapshot(collection(shopRef, 'notifications'), snap => {
        setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
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

  const addSale = async (items: any[], type: 'cash' | 'udhaar'): Promise<string | undefined> => {
    if (!user) return;
    
    // PRE-FLIGHT STOCK CHECK: Don't write anything if stock is insufficient
    for (const i of items) {
      const stockItem = stock.find(s => s.id === i.itemId);
      if (!stockItem) {
        throw new Error(`"${i.name}" stock mein majood nahi. Har sale stock se hi ho sakti hai.`);
      }
      if (stockItem.quantity < i.qty) {
        throw new Error(`"${stockItem.name}" ka stock kam hai. Sirf ${stockItem.quantity} pieces hain.`);
      }
    }

    const shopRef = doc(db, 'shops', user.uid);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const date = new Date().toISOString();
    
    // Auto-generate invoice
    const year = new Date().getFullYear();
    const num = String(invoices.length + 1).padStart(3, '0');
    const invoiceNumber = `INV-${year}-${num}`;

    // 1. Create Invoice
    const invRef = await addDoc(collection(shopRef, 'invoices'), {
      invoiceNumber,
      customerName: 'Walk-in Customer',
      items: items.map(i => ({
        itemId: i.itemId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price
      })),
      subtotal: total,
      discount: 0,
      total,
      paymentMethod: type,
      status: type === 'udhaar' ? 'unpaid' : 'paid',
      date
    });

    // 2. Create Sale Record
    await addDoc(collection(shopRef, 'sales'), { 
      total, type, items, date, invoiceId: invRef.id 
    });

    // 3. Update Stock & History
    for (const i of items) {
      const stockItem = stock.find(s => s.id === i.itemId);
      if (stockItem) {
        const newQuantity = stockItem.quantity - i.qty;
        const newSoldCount = (stockItem.soldCount || 0) + i.qty;
        
        // Notification for low stock
        if (newQuantity <= (stockItem.minThreshold || 5) && stockItem.quantity > (stockItem.minThreshold || 5)) {
          await addDoc(collection(shopRef, 'notifications'), {
            title: 'Low Stock Alert ⚠️',
            message: `${stockItem.name} stock khatam hone wala hai (${newQuantity} remain).`,
            type: 'stock',
            date: date,
            read: false,
            relatedId: i.itemId
          });
          toast(`${stockItem.name} stock level drop ho gaya!`, { icon: '⚠️', duration: 4000 });
        }

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

    // 4. Handle Udhaar if applicable
    if (type === 'udhaar') {
      await addDoc(collection(shopRef, 'udhaar'), {
        customerName: 'Walk-in Customer',
        amount: total,
        date,
        note: `Invoice ${invoiceNumber}`
      });
    }

    return invRef.id;
  };

  const addExpense = async (amount: number, description: string, category: string = 'Other') => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'expenses'), { 
      amount, 
      description, 
      category,
      date: new Date().toISOString() 
    });
  };

  const addUdhaar = async (customerName: string, amount: number, note?: string) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'udhaar'), { customerName, amount, date: new Date().toISOString(), note: note || '' });
  };

  const addUdhaarPayment = async (customerName: string, amount: number, note?: string) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'udhaar'), { 
      customerName, amount: -Math.abs(amount), date: new Date().toISOString(), isPayment: true, note: note || ''
    });
  };

  const deleteUdhaar = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'shops', user.uid, 'udhaar', id));
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
    const q = query(collection(doc(db, 'shops', user.uid), 'udhaar'), where('customerName', '==', name));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  };

  const addContact = async (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    await addDoc(collection(shopRef, 'contacts'), { 
      ...contact, 
      createdAt: new Date().toISOString() 
    });
    if (contact.initialBalance !== 0) {
      const amount = contact.initialBalance;
      await addDoc(collection(shopRef, 'udhaar'), {
        customerName: contact.name,
        amount,
        date: new Date().toISOString(),
        note: 'Opening Balance',
        isPayment: contact.type === 'customer' ? amount < 0 : amount > 0
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'shops', user.uid, 'contacts', id));
  };

  const toggleContactImportance = async (contactId: string) => {
    if (!user) return;

    // Handle legacy contacts (names inferred from udhaar entries without a contact record)
    if (contactId.startsWith('legacy-')) {
      const name = contactId.replace('legacy-', '');
      const shopRef = doc(db, 'shops', user.uid);
      await addDoc(collection(shopRef, 'contacts'), {
        name,
        phone: '',
        type: 'customer', // assume customer for legacy
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
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>): Promise<string> => {
    if (!user) throw new Error('Not logged in');
    
    // PRE-FLIGHT STOCK CHECK
    for (const i of invoice.items) {
      const stockItem = stock.find(s => s.id === i.itemId);
      if (!stockItem) {
        throw new Error(`"${i.name}" stock mein majood nahi. Bina item stock kam kiye cash add nahi ho sakta.`);
      }
      if (stockItem.quantity < i.qty) {
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
      invoiceId: invRef.id 
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
        note: `Invoice ${invoiceNumber}`
      });
    }

    return invRef.id;
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'shops', user.uid, 'invoices', id));
  };

  const addStaff = async (member: Omit<Staff, 'id' | 'joinedAt'>) => {
    if (!user) return;
    await addDoc(collection(doc(db, 'shops', user.uid), 'staff'), {
      ...member,
      joinedAt: new Date().toISOString(),
      dailyActions: 0
    });
  };

  const deleteStaff = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'shops', user.uid, 'staff', id));
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

    // Notification check
    if (newQuantity <= (item.minThreshold || 5) && item.quantity > (item.minThreshold || 5)) {
      await addDoc(collection(shopRef, 'notifications'), {
        title: 'Low Stock Alert ⚠️',
        message: `${item.name} stock level drop ho gaya (${newQuantity} units left).`,
        type: 'stock',
        date: new Date().toISOString(),
        read: false,
        relatedId: id
      });
      toast(`${item.name} stock level drop ho gaya!`, { icon: '⚠️', duration: 4000 });
    }
  };

  const updateStockItem = async (id: string, data: Partial<Stock>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const itemRef = doc(collection(shopRef, 'stock'), id);
    await updateDoc(itemRef, { ...data, updatedAt: serverTimestamp() });
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
    toast.success(`Item ab ${item.status === 'inactive' ? 'active' : 'inactive'} hai`);
  };

  const addStockItem = async (item: Omit<Stock, 'id' | 'history' | 'soldCount' | 'status'>) => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
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
      sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const checkLimit = (type: 'sales' | 'stock' | 'customers' | 'staff') => {
    const plan = (profile?.plan || 'free').toLowerCase();
    
    // Pro and Business have no limits
    if (['pro', 'business'].includes(plan)) return { allowed: true };

    // New FREE Plan rule: Only staff is limited. Sales, Stock, Customers are unlimited.
    if (plan === 'free') {
      if (type === 'staff') {
        const staffLimit = 1; // Limit free plan to 1 staff member
        if (staff.length >= staffLimit) {
          return { 
            allowed: false, 
            message: `Free plan mein sirf ${staffLimit} staff member allowed hai. Mazeed staff ke liye upgrade karein!` 
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
      const q = query(collection(shopRef, coll), where('date', '<', cutoff.toISOString()));
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        batch.delete(d.ref);
        count++;
      });
    }
    
    if (count > 0) {
      await batch.commit();
      toast.success(`${count} purane records delete ho gaye`);
    } else {
      toast.error('Koi purane records nahi mile');
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    const shopRef = doc(db, 'shops', user.uid);
    const collections = ['stock', 'sales', 'expenses', 'udhaar', 'contacts', 'invoices', 'staff', 'activities', 'notifications'];
    
    const batchSize = 500;
    for (const coll of collections) {
      const q = collection(shopRef, coll);
      const snap = await getDocs(q);
      
      // Delete in chunks if needed
      for (let i = 0; i < snap.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        snap.docs.slice(i, i + batchSize).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(shopRef); // Optional: delete profile too
    toast.success('Saara data delete ho gaya');
  };

  const updateLastSync = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'shops', user.uid), {
        lastSync: new Date().toISOString()
      });
    } catch (e) {
      console.error("Sync update failed", e);
    }
  };

  return (
    <ShopContext.Provider value={{ 
      stock, sales, expenses, udhaars, contacts, invoices, staff, activities, notifications, profile, loading, 
      addSale, addExpense, addUdhaar, addUdhaarPayment, deleteUdhaar, deleteCustomer, 
      addContact, deleteContact, toggleContactImportance, addInvoice, deleteInvoice, addStaff, deleteStaff, logActivity, updateStock, updateStockItem, toggleStockItemStatus, addStockItem, updateProfile, updateRolePermissions, updateSecuritySettings, toggleUdhaarUrgency, markNotificationRead, clearNotifications, checkLimit, clearOldData, clearAllData, updateLastSync 
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
