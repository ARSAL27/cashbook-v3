import { db } from '../lib/firebase';
import {
  collection, doc, getDocs, addDoc, updateDoc, setDoc, getDoc,
  query, where, serverTimestamp, increment
} from 'firebase/firestore';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface PakistanBarcodeEntry {
  id?: string;
  barcode: string;
  name: string;
  company: string;
  category: string;
  unit: string;
  addedBy: string;
  confirmCount: number;
  flagCount: number;
  status: 'pending' | 'verified' | 'flagged';
  source: 'user' | 'openfoodfacts';
  imageUrl?: string;
  addedAt?: any;
  packSize?: string;
}

export interface OpenFoodFactsProduct {
  name: string;
  company: string;
  category: string;
  imageUrl?: string;
}

// ─── OFFLINE CACHE ────────────────────────────────────────────────────────────

const CACHE_KEY = 'kb_barcode_cache';
const QUEUE_KEY = 'kb_barcode_queue';

interface CachedEntry {
  barcode: string;
  data: PakistanBarcodeEntry;
  cachedAt: number;
}

interface QueuedEntry {
  barcode: string;
  data: Omit<PakistanBarcodeEntry, 'id'>;
}

function getCache(): Record<string, CachedEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, CachedEntry>) {
  try {
    // Keep only last 200 barcodes
    const entries = Object.entries(cache);
    if (entries.length > 200) {
      entries.sort((a, b) => b[1].cachedAt - a[1].cachedAt);
      const trimmed = Object.fromEntries(entries.slice(0, 200));
      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}
}

function getCachedBarcode(barcode: string): PakistanBarcodeEntry | null {
  const cache = getCache();
  const entry = cache[barcode];
  if (!entry) return null;
  // Cache valid for 24 hours
  if (Date.now() - entry.cachedAt > 24 * 60 * 60 * 1000) return null;
  return entry.data;
}

function cacheBarcode(barcode: string, data: PakistanBarcodeEntry) {
  const cache = getCache();
  cache[barcode] = { barcode, data, cachedAt: Date.now() };
  setCache(cache);
}

function getQueue(): QueuedEntry[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToQueue(entry: QueuedEntry) {
  const queue = getQueue();
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ─── OPEN FOOD FACTS API ─────────────────────────────────────────────────────

export async function lookupOpenFoodFacts(barcode: string): Promise<OpenFoodFactsProduct | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for slow connections

  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    
    // Pick the best name available
    let name = p.product_name_en || p.product_name || p.product_name_it || p.product_name_fr || p.generic_name || '';
    
    // If name is short/missing, try combining brand and item
    if (name.length < 3 && p.brands) {
      name = p.brands + (name ? ` ${name}` : '');
    }

    if (!name.trim()) return null;

    const company = p.brands || p.brand_owner || 'Unknown Brand';
    const rawCat = p.categories_tags?.[0] || p.categories || '';
    const category = mapOffCategory(rawCat);
    const imageUrl = p.image_front_url || p.image_url || '';

    return {
      name: name.trim(),
      company: company.split(',')[0].trim(),
      category,
      imageUrl: imageUrl || undefined
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

export function parseProductInfo(fullName: string) {
  const name = fullName.toLowerCase();
  let unit: 'kg' | 'units' | 'packs' | 'ltr' | 'pcs' | 'dozen' | 'bori' = 'pcs';
  let packSize = '';
  
  // Weights (g, gm, kg)
  const weightMatch = fullName.match(/(\d+\s?(?:g|gm|gram|kg|kilogram))/i);
  if (weightMatch) {
    packSize = weightMatch[0].trim();
    if (packSize.toLowerCase().includes('kg')) unit = 'kg';
  }

  // Volume (ml, l, ltr, liter)
  const volumeMatch = fullName.match(/(\d+\s?(?:ml|l|ltr|liter|litre))/i);
  if (volumeMatch) {
    packSize = volumeMatch[0].trim();
    if (packSize.toLowerCase().includes('l') && !packSize.toLowerCase().includes('ml')) unit = 'ltr';
  }

  // Packs
  if (name.includes('pack') || name.includes('pkt')) unit = 'packs';

  // Extract base name (remove the weight/volume part)
  let baseName = fullName;
  if (packSize) {
    baseName = fullName.replace(new RegExp(packSize, 'i'), '').replace(/\s+/g, ' ').trim();
  }

  return { baseName, packSize, unit };
}

export async function lookupUpcItemDb(barcode: string): Promise<OpenFoodFactsProduct | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== 'OK' || !json.items || json.items.length === 0) return null;
    const item = json.items[0];
    return {
      name: item.title || '',
      company: item.brand || 'Unknown Brand',
      category: 'Grains & Flour',
      imageUrl: item.images?.[0]
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function mapOffCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('beverage') || r.includes('drink') || r.includes('water') || r.includes('juice') || r.includes('soda') || r.includes('tea') || r.includes('coffee')) return 'Tea & Beverages';
  if (r.includes('snack') || r.includes('chip') || r.includes('biscuit') || r.includes('cookie') || r.includes('cracker')) return 'Biscuits & Snacks';
  if (r.includes('frozen') || r.includes('nugget') || r.includes('kabab') || r.includes('burger')) return 'Frozen Foods';
  if (r.includes('dessert') || r.includes('sweet') || r.includes('pudding') || r.includes('custard')) return 'Desserts & Sweets';
  if (r.includes('sauce') || r.includes('pickle') || r.includes('chutney') || r.includes('ketchup')) return 'Sauces, Pickles & Chutneys';
  if (r.includes('spice') || r.includes('masala')) return 'Spices & Masala';
  if (r.includes('soap') || r.includes('shampoo') || r.includes('lotion') || r.includes('cream') || r.includes('personal')) return 'Personal Care';
  if (r.includes('detergent') || r.includes('clean') || r.includes('household') || r.includes('washing')) return 'Household Cleaning';
  if (r.includes('oil') || r.includes('ghee')) return 'Cooking Oil & Ghee';
  if (r.includes('dairy') || r.includes('milk')) return 'Milk & Dairy';
  if (r.includes('cereal') || r.includes('flour') || r.includes('rice') || r.includes('sugar')) return 'Grains & Flour';
  return 'Miscellaneous';
}

// ─── PAKISTAN DATABASE ────────────────────────────────────────────────────────

const PK_COLLECTION = 'global_barcodes';

const HARDCODED_PAKISTAN_DB: Record<string, any> = {
  '8961014131102': { name: 'Shan Bombay Biryani (60g)', company: 'Shan Foods', category: 'Spices & Masala' },
  '8961014131119': { name: 'Shan Sindhi Biryani (60g)', company: 'Shan Foods', category: 'Spices & Masala' },
  '8961014131010': { name: 'Shan Korma Masala (50g)', company: 'Shan Foods', category: 'Spices & Masala' },
  '8961014131027': { name: 'Shan Karahi Masala (50g)', company: 'Shan Foods', category: 'Spices & Masala' },
  '8961014131058': { name: 'Shan Achar Gosht (50g)', company: 'Shan Foods', category: 'Spices & Masala' },
  '8961014131096': { name: 'Shan Nihari Masala (60g)', company: 'Shan Foods', category: 'Spices & Masala' },
  // Lays / Pepsi
  '8961011010011': { name: 'Lays Masala (Large)', company: 'Lays', category: 'Biscuits & Snacks' },
  '8961011010028': { name: 'Lays French Cheese (Large)', company: 'Lays', category: 'Biscuits & Snacks' },
  '8961012010010': { name: 'Kurkure Toofani Masala', company: 'Kurkure', category: 'Biscuits & Snacks' },
  '8961014104014': { name: 'Pepsi 1.5L', company: 'Pepsi', category: 'Tea & Beverages' },
  '8961014104021': { name: '7UP 1.5L', company: '7UP', category: 'Tea & Beverages' },
  // LU / EBM
  '8961013110016': { name: 'LU Gala (Family Pack)', company: 'LU', category: 'Biscuits & Snacks' },
  '8961013110023': { name: 'LU Prince (Family Pack)', company: 'LU', category: 'Biscuits & Snacks' },
  '8961013110030': { name: 'LU Bakeri (Family Pack)', company: 'LU', category: 'Biscuits & Snacks' },
  // Tapal
  '8961012110017': { name: 'Tapal Danedar (190g)', company: 'Tapal', category: 'Tea & Beverages' },
  '8961012110024': { name: 'Tapal Danedar (430g)', company: 'Tapal', category: 'Tea & Beverages' },
};

export async function lookupPakistanDB(barcode: string): Promise<PakistanBarcodeEntry | null> {
  // Check offline cache first
  const cached = getCachedBarcode(barcode);
  if (cached) return cached;

  try {
    // Direct lookup by document ID (barcode) is better than query
    const docRef = doc(db, PK_COLLECTION, barcode);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const entry = { id: snap.id, ...snap.data() } as PakistanBarcodeEntry;
      cacheBarcode(barcode, entry);
      return entry;
    }
    
    // Fallback to query just in case some entries don't have barcode as ID
    const q = query(collection(db, PK_COLLECTION), where('barcode', '==', barcode));
    const querySnap = await getDocs(q);
    if (querySnap.empty) return null;
    const d = querySnap.docs[0];
    const entry = { id: d.id, ...d.data() } as PakistanBarcodeEntry;
    cacheBarcode(barcode, entry);
    return entry;
  } catch (err) {
    console.error('Pakistan DB Lookup Error:', err);
    return null;
  }
}

export async function saveToPakistanDB(
  barcode: string,
  data: Pick<PakistanBarcodeEntry, 'name' | 'company' | 'category' | 'unit' | 'imageUrl' | 'packSize'>,
  userId: string,
  source: 'user' | 'openfoodfacts' = 'user'
): Promise<PakistanBarcodeEntry> {
  const entry: Omit<PakistanBarcodeEntry, 'id'> = {
    barcode,
    ...data,
    addedBy: userId,
    confirmCount: 0,
    flagCount: 0,
    status: 'pending',
    source,
    addedAt: serverTimestamp()
  };

  const isOnline = navigator.onLine;
  if (!isOnline) {
    addToQueue({ barcode, data: entry });
    const offlineEntry = { ...entry, id: 'offline-' + Date.now() };
    cacheBarcode(barcode, offlineEntry);
    return offlineEntry;
  }

  try {
    await setDoc(doc(db, PK_COLLECTION, barcode), entry, { merge: true });
    const saved = { id: barcode, ...entry };
    cacheBarcode(barcode, saved);
    return saved;
  } catch {
    addToQueue({ barcode, data: entry });
    const offlineEntry = { ...entry, id: 'offline-' + Date.now() };
    cacheBarcode(barcode, offlineEntry);
    return offlineEntry;
  }
}

export async function confirmBarcode(entryId: string): Promise<void> {
  try {
    await updateDoc(doc(db, PK_COLLECTION, entryId), {
      confirmCount: increment(1)
    });
  } catch {}
}

export async function flagBarcode(entryId: string): Promise<void> {
  try {
    await updateDoc(doc(db, PK_COLLECTION, entryId), {
      flagCount: increment(1)
    });
  } catch {}
}

// ─── SYNC OFFLINE QUEUE ───────────────────────────────────────────────────────

export async function syncOfflineQueue(): Promise<void> {
  if (!navigator.onLine) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining: QueuedEntry[] = [];
  for (const item of queue) {
    try {
      // Check if already exists
      const q = query(collection(db, PK_COLLECTION), where('barcode', '==', item.barcode));
      const snap = await getDocs(q);
      if (!snap.empty) continue; // Already synced

      await setDoc(doc(db, PK_COLLECTION, item.barcode), {
        ...item.data,
        addedAt: serverTimestamp()
      }, { merge: true });
      const saved = { id: item.barcode, ...item.data };
      cacheBarcode(item.barcode, saved as PakistanBarcodeEntry);
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

// ─── STATS ───────────────────────────────────────────────────────────────────

export interface PakistanDBStats {
  total: number;
  verified: number;
  userContribution: number;
}

export async function getPakistanDBStats(userId: string): Promise<PakistanDBStats> {
  try {
    const allSnap = await getDocs(collection(db, PK_COLLECTION));
    const total = allSnap.size;
    const verified = allSnap.docs.filter(d => d.data().status === 'verified').length;
    const userContribution = allSnap.docs.filter(d => d.data().addedBy === userId).length;
    return { total, verified, userContribution };
  } catch {
    return { total: 0, verified: 0, userContribution: 0 };
  }
}

// ─── MASTER LOOKUP ───────────────────────────────────────────────────────────
// Returns: { source, product } or null

export type LookupSource = 'openfoodfacts' | 'pakistan' | 'none';

export interface LookupResult {
  source: LookupSource;
  product: {
    name: string;
    baseName?: string;
    company: string;
    category: string;
    unit: string;
    packSize?: string;
    imageUrl?: string;
    pkEntryId?: string; // if from pakistan DB
  } | null;
}

/**
 * Normalizes barcode to handle UPC/EAN variations (leading zeros)
 */
function normalizeBarcode(barcode: string): string {
  return barcode.trim();
}

/**
 * Try to find product by exact barcode, and if fails, try with/without leading zero
 */
export async function masterBarcodeLookup(barcode: string): Promise<LookupResult> {
  const cleanBarcode = normalizeBarcode(barcode);
  
  // Create variants (e.g. "123" -> ["123", "0123"]) or ("0123" -> ["0123", "123"])
  const variants = [cleanBarcode];
  if (cleanBarcode.startsWith('0')) {
    variants.push(cleanBarcode.substring(1));
  } else {
    variants.push('0' + cleanBarcode);
  }

  // Step 0: Check Hardcoded Local App Database First
  for (const b of variants) {
    if (HARDCODED_PAKISTAN_DB[b]) {
      const hd = HARDCODED_PAKISTAN_DB[b];
      const info = parseProductInfo(hd.name);
      return {
        source: 'pakistan',
        product: {
          name: hd.name,
          baseName: info.baseName,
          company: hd.company,
          category: hd.category,
          unit: info.unit || 'pcs',
          packSize: info.packSize
        }
      };
    }
  }

  // Step 1: Check variants in order
  for (const b of variants) {
    const offResult = await lookupOpenFoodFacts(b);
    if (offResult) {
      const info = parseProductInfo(offResult.name);
      return {
        source: 'openfoodfacts',
        product: {
          name: offResult.name,
          baseName: info.baseName,
          company: offResult.company,
          category: offResult.category,
          unit: info.unit || 'pcs',
          packSize: info.packSize,
          imageUrl: offResult.imageUrl
        }
      };
    }

    const upcResult = await lookupUpcItemDb(b);
    if (upcResult) {
      const info = parseProductInfo(upcResult.name);
      return {
        source: 'openfoodfacts',
        product: {
          name: upcResult.name,
          baseName: info.baseName,
          company: upcResult.company,
          category: upcResult.category,
          unit: info.unit || 'pcs',
          packSize: info.packSize,
          imageUrl: upcResult.imageUrl
        }
      };
    }

    const pkResult = await lookupPakistanDB(b);
    if (pkResult) {
      const info = parseProductInfo(pkResult.name);
      return {
        source: 'pakistan',
        product: {
          name: pkResult.name,
          baseName: info.baseName,
          company: pkResult.company,
          category: pkResult.category,
          unit: pkResult.unit || info.unit || 'pcs',
          packSize: info.packSize,
          imageUrl: pkResult.imageUrl,
          pkEntryId: pkResult.id
        }
      };
    }
  }

  return { source: 'none', product: null };
}
