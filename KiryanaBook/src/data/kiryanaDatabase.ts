export interface KiryanaProduct {
  id: string;
  name: string;
  category: string;
  company: string;
  unit: string;
}

export interface KiryanaCompany {
  name: string;
  logoInitial: string;
  logoUrl?: string;
  productCount: number;
}

export interface BrandStyle {
  bg: string;
  text: string;
  abbr: string;
  logoUrl?: string;
}

export const getBrandStyle = (companyName: string): BrandStyle => {
  const n = companyName.toLowerCase();

  // ── Beverages ─────────────────────────────────────────────────────
  if (n.includes('coca cola')) return { bg: '#F40009', text: '#fff', abbr: 'CC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg' };
  if (n.includes('pepsico') || n.includes('pepsi')) return { bg: '#004B93', text: '#fff', abbr: 'PE', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Pepsi_logo_2014.svg' };
  if (n.includes('pakola')) return { bg: '#007A3D', text: '#fff', abbr: 'PK' };
  if (n.includes('makka')) return { bg: '#1A6B3C', text: '#fff', abbr: 'MC' };
  if (n.includes('rc cola')) return { bg: '#C8102E', text: '#fff', abbr: 'RC' };
  if (n.includes('shezan')) return { bg: '#E31837', text: '#fff', abbr: 'SZ' };
  if (n.includes('hamdard')) return { bg: '#006633', text: '#fff', abbr: 'HD' };
  if (n.includes('shangrila')) return { bg: '#C41E3A', text: '#fff', abbr: 'SL' };

  // ── Tea / Coffee ───────────────────────────────────────────────────
  if (n.includes('lipton')) return { bg: '#FFC20E', text: '#C8102E', abbr: 'LP', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Lipton_logo.svg' };
  if (n.includes('tapal')) return { bg: '#006400', text: '#fff', abbr: 'TP' };
  if (n.includes('supreme')) return { bg: '#1B3A6B', text: '#fff', abbr: 'SU' };
  if (n.includes('tetley')) return { bg: '#003087', text: '#fff', abbr: 'TL' };
  if (n.includes('nescafe') || n.includes('nestle')) return { bg: '#CC0000', text: '#fff', abbr: 'NS', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Nestl%C3%A9.svg' };

  // ── Food / Spices ──────────────────────────────────────────────────
  if (n.includes('shan')) return { bg: '#E31837', text: '#fff', abbr: 'SH' };
  if (n.includes('national foods')) return { bg: '#E31837', text: '#fff', abbr: 'NF' };
  if (n.includes('knorr') || n.includes('unilever')) return { bg: '#003087', text: '#fff', abbr: 'KN', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/86/Unilever_logo_2004.svg' };
  if (n.includes('dalda')) return { bg: '#006633', text: '#fff', abbr: 'DL', logoUrl: '/logos/dalda.png' };
  if (n.includes('habib')) return { bg: '#E31837', text: '#fff', abbr: 'HB', logoUrl: 'https://logos-world.net/wp-content/uploads/2022/07/Habib-Logo.png' };
  if (n.includes('sufi')) return { bg: '#8B0000', text: '#fff', abbr: 'SF', logoUrl: '/logos/sufi.png' };
  if (n.includes('eva')) return { bg: '#E91E8C', text: '#fff', abbr: 'EV', logoUrl: '/logos/eva.png' };

  // ── Snacks / Biscuits ──────────────────────────────────────────────
  if (n.includes('lays') || n.includes('lay\'s')) return { bg: '#FFD700', text: '#C8102E', abbr: 'LY', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Lay%27s_logo.svg' };
  if (n.includes('ebm')) return { bg: '#003087', text: '#fff', abbr: 'EB' };
  if (n.includes('lu ') || n.includes(' lu') || n === 'lu') return { bg: '#E31837', text: '#fff', abbr: 'LU', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/LU_logo.svg' };
  if (n.includes('hilal')) return { bg: '#009A44', text: '#fff', abbr: 'HL' };
  if (n.includes('bake parlor')) return { bg: '#8B0000', text: '#fff', abbr: 'BP' };
  if (n.includes('sunridge')) return { bg: '#FF6B00', text: '#fff', abbr: 'SR' };
  if (n.includes('peek freans') || n.includes('peek')) return { bg: '#003087', text: '#fff', abbr: 'PF' };
  if (n.includes('bisconni')) return { bg: '#E31837', text: '#fff', abbr: 'BC' };
  if (n.includes('falak')) return { bg: '#1565C0', text: '#fff', abbr: 'FK', logoUrl: '/logos/falak.webp' };

  // ── Personal Care / Household ──────────────────────────────────────
  if (n.includes('p&g') || n.includes('procter')) return { bg: '#003087', text: '#fff', abbr: 'PG', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg' };
  if (n.includes('reckitt')) return { bg: '#003087', text: '#fff', abbr: 'RB', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Reckitt_Benckiser_logo.svg' };
  if (n.includes('dettol')) return { bg: '#009A44', text: '#fff', abbr: 'DT', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Dettol_logo.svg' };
  if (n.includes('harpic')) return { bg: '#1B3A6B', text: '#fff', abbr: 'HP', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Harpic_logo.svg' };
  if (n.includes('surf')) return { bg: '#003087', text: '#fff', abbr: 'SF' };
  if (n.includes('ariel')) return { bg: '#FF8C00', text: '#fff', abbr: 'AR' };
  if (n.includes('head') && n.includes('shoulder')) return { bg: '#003087', text: '#fff', abbr: 'H&S' };
  if (n.includes('pantene')) return { bg: '#FFD700', text: '#333', abbr: 'PN' };
  if (n.includes('safeguard')) return { bg: '#C8102E', text: '#fff', abbr: 'SG' };
  if (n.includes('closeup')) return { bg: '#E31837', text: '#fff', abbr: 'CU' };
  if (n.includes('colgate')) return { bg: '#E31837', text: '#fff', abbr: 'CG' };
  if (n.includes('lux')) return { bg: '#FFD700', text: '#333', abbr: 'LX' };
  if (n.includes('lifebuoy')) return { bg: '#C8102E', text: '#fff', abbr: 'LB' };
  if (n.includes('vim')) return { bg: '#009A44', text: '#fff', abbr: 'VM' };
  if (n.includes('mortein')) return { bg: '#FFD700', text: '#333', abbr: 'MT' };

  // ── Dairy ──────────────────────────────────────────────────────────
  if (n.includes('olpers')) return { bg: '#E31837', text: '#fff', abbr: 'OL' };
  if (n.includes('nurpur')) return { bg: '#003087', text: '#fff', abbr: 'NR' };
  if (n.includes('engro')) return { bg: '#003087', text: '#fff', abbr: 'EF' };
  if (n.includes('haleeb')) return { bg: '#009A44', text: '#fff', abbr: 'HA' };

  // ── Generic fallback with hash-based color ─────────────────────────
  const colors = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF5722','#795548','#607D8B'];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const words = companyName.trim().split(/\s+/);
  const abbr = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : companyName.slice(0, 2).toUpperCase();
  return { bg: color, text: '#fff', abbr };
};

// Keep the old function for backward compatibility
export const getCompanyLogo = (companyName: string): string => {
  return getBrandStyle(companyName).logoUrl || '';
};

export interface KiryanaCategory {
  id: string;
  name: string;
  emoji: string;
  productCount: string;
  color: string;
}

export const KIRYANA_CATEGORIES: KiryanaCategory[] = [
  { id: 'beverages', name: 'Beverages & Drinks', emoji: '🥤', productCount: '380+', color: '#E3F2FD' },
  { id: 'grocery', name: 'Grocery & Food', emoji: '🌾', productCount: '520+', color: '#E8F5E9' },
  { id: 'snacks', name: 'Snacks & Biscuits', emoji: '🍪', productCount: '340+', color: '#FFF3E0' },
  { id: 'spices', name: 'Spices & Cooking', emoji: '🌶️', productCount: '380+', color: '#FBE9E7' },
  { id: 'personal', name: 'Personal Care', emoji: '🧼', productCount: '450+', color: '#F3E5F5' },
  { id: 'household', name: 'Household Cleaning', emoji: '🧹', productCount: '290+', color: '#E0F2F1' },
];

export const KIRYANA_DATABASE: KiryanaProduct[] = [
  // BEVERAGES - Coca Cola
  { id: 'bc-1', name: 'Coca Cola 250ml Can', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-2', name: 'Coca Cola 500ml Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-3', name: 'Coca Cola 1L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-4', name: 'Coca Cola 1.5L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-5', name: 'Coca Cola 2.25L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-6', name: 'Sprite 250ml Can', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-7', name: 'Sprite 500ml Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-8', name: 'Sprite 1L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-9', name: 'Sprite 1.5L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-10', name: 'Sprite 2.25L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-11', name: 'Fanta Orange 250ml Can', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-12', name: 'Fanta Orange 500ml Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-13', name: 'Fanta Orange 1.5L Bottle', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-14', name: 'Minute Maid Orange 250ml', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },
  { id: 'bc-15', name: 'Minute Maid Apple 250ml', category: 'Beverages & Drinks', company: 'Coca Cola Company', unit: 'pcs' },

  // BEVERAGES - PepsiCo
  { id: 'bp-1', name: 'Pepsi 250ml Can', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-2', name: 'Pepsi 500ml Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-3', name: 'Pepsi 1L Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-4', name: 'Pepsi 1.5L Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-5', name: 'Pepsi 2.25L Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-6', name: '7UP 250ml Can', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-7', name: '7UP 500ml Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-8', name: '7UP 1.5L Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-9', name: '7UP 2.25L Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-10', name: 'Mirinda Orange 500ml', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-11', name: 'Mirinda Orange 1.5L', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-12', name: 'Mountain Dew 500ml', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-13', name: 'Mountain Dew 1.5L', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-14', name: 'Sting Energy 250ml Can', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },
  { id: 'bp-15', name: 'Sting Energy 500ml Bottle', category: 'Beverages & Drinks', company: 'PepsiCo', unit: 'pcs' },

  // BEVERAGES - Pakola
  { id: 'bpk-1', name: 'Pakola Green 250ml Bottle', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },
  { id: 'bpk-2', name: 'Pakola Green 500ml Bottle', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },
  { id: 'bpk-3', name: 'Pakola Green 1.5L Bottle', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },
  { id: 'bpk-4', name: 'Pakola Ice Cream Soda 250ml', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },
  { id: 'bpk-5', name: 'Pakola Orange 250ml', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },
  { id: 'bpk-6', name: 'Pakola Lychee 250ml', category: 'Beverages & Drinks', company: 'Pakola', unit: 'pcs' },

  // BEVERAGES - Makka Cola
  { id: 'bmc-1', name: 'Makka Cola 500ml', category: 'Beverages & Drinks', company: 'Makka Cola', unit: 'pcs' },
  { id: 'bmc-2', name: 'Makka Cola 1.5L', category: 'Beverages & Drinks', company: 'Makka Cola', unit: 'pcs' },
  { id: 'bmc-3', name: 'Makka Cola 2.25L', category: 'Beverages & Drinks', company: 'Makka Cola', unit: 'pcs' },

  // BEVERAGES - RC Cola
  { id: 'brc-1', name: 'RC Cola 500ml', category: 'Beverages & Drinks', company: 'RC Cola', unit: 'pcs' },
  { id: 'brc-2', name: 'RC Cola 1.5L', category: 'Beverages & Drinks', company: 'RC Cola', unit: 'pcs' },
  { id: 'brc-3', name: 'RC Cola 2.25L', category: 'Beverages & Drinks', company: 'RC Cola', unit: 'pcs' },

  // BEVERAGES - Juices - Shezan
  { id: 'bs-1', name: 'Shezan Apple Juice 200ml Tetra', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-2', name: 'Shezan Apple Juice 1L Tetra', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-3', name: 'Shezan Mango Juice 200ml', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-4', name: 'Shezan Mango Juice 1L', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-5', name: 'Shezan Orange Juice 200ml', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-6', name: 'Shezan Mixed Fruit 200ml', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-7', name: 'Shezan Guava Juice 200ml', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-8', name: 'Shezan Rooh Afza 800ml', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },
  { id: 'bs-9', name: 'Shezan Rooh Afza 1.5L', category: 'Beverages & Drinks', company: 'Shezan', unit: 'pcs' },

  // BEVERAGES - Hamdard
  { id: 'bh-1', name: 'Rooh Afza 800ml', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },
  { id: 'bh-2', name: 'Rooh Afza 1.5L', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },
  { id: 'bh-3', name: 'Rooh Afza 3L', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },
  { id: 'bh-4', name: 'Hamdard Sharbat Sandal 800ml', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },
  { id: 'bh-5', name: 'Hamdard Glucose D 400g', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },
  { id: 'bh-6', name: 'Hamdard Safi 200ml', category: 'Beverages & Drinks', company: 'Hamdard', unit: 'pcs' },

  // BEVERAGES - Shangrila
  { id: 'bsh-1', name: 'Shangrila Mango Juice 200ml', category: 'Beverages & Drinks', company: 'Shangrila', unit: 'pcs' },
  { id: 'bsh-2', name: 'Shangrila Apple Juice 200ml', category: 'Beverages & Drinks', company: 'Shangrila', unit: 'pcs' },
  { id: 'bsh-3', name: 'Shangrila Guava Juice 200ml', category: 'Beverages & Drinks', company: 'Shangrila', unit: 'pcs' },
  { id: 'bsh-4', name: 'Shangrila Mixed Fruit 200ml', category: 'Beverages & Drinks', company: 'Shangrila', unit: 'pcs' },
  { id: 'bsh-5', name: 'Shangrila Peach 200ml', category: 'Beverages & Drinks', company: 'Shangrila', unit: 'pcs' },

  // BEVERAGES - Nestle
  { id: 'bn-1', name: 'Nestle Pure Life 500ml', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-2', name: 'Nestle Pure Life 1.5L', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-3', name: 'Nestle Pure Life 19L', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-4', name: 'Nestle Milo 180ml Tetra', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-5', name: 'Nestle Milo 200g Tin', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-6', name: 'Nestle Milo 400g Tin', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-7', name: 'Nestle Fruita Vitals Apple 200ml', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-8', name: 'Nestle Fruita Vitals Mango 200ml', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },
  { id: 'bn-9', name: 'Nestle Fruita Vitals Guava 200ml', category: 'Beverages & Drinks', company: 'Nestle', unit: 'pcs' },

  // BEVERAGES - Tea - Tapal
  { id: 'bt-1', name: 'Tapal Danedar 95g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-2', name: 'Tapal Danedar 190g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-3', name: 'Tapal Danedar 475g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-4', name: 'Tapal Danedar 950g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-5', name: 'Tapal Family Mixture 95g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-6', name: 'Tapal Family Mixture 190g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-7', name: 'Tapal Family Mixture 475g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-8', name: 'Tapal Green Tea 30 Bags', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-9', name: 'Tapal Green Tea 100 Bags', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-10', name: 'Tapal Mezban 190g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },
  { id: 'bt-11', name: 'Tapal Mezban 475g', category: 'Beverages & Drinks', company: 'Tapal', unit: 'pcs' },

  // BEVERAGES - Lipton
  { id: 'bl-1', name: 'Lipton Yellow Label 95g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-2', name: 'Lipton Yellow Label 190g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-3', name: 'Lipton Yellow Label 475g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-4', name: 'Lipton Yellow Label 950g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-5', name: 'Lipton Green Tea 30 Bags', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-6', name: 'Lipton Green Tea 100 Bags', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-7', name: 'Lipton Zaiqa 190g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },
  { id: 'bl-8', name: 'Lipton Zaiqa 475g', category: 'Beverages & Drinks', company: 'Lipton', unit: 'pcs' },

  // BEVERAGES - Supreme
  { id: 'bsu-1', name: 'Supreme Tea 95g', category: 'Beverages & Drinks', company: 'Supreme', unit: 'pcs' },
  { id: 'bsu-2', name: 'Supreme Tea 190g', category: 'Beverages & Drinks', company: 'Supreme', unit: 'pcs' },
  { id: 'bsu-3', name: 'Supreme Tea 475g', category: 'Beverages & Drinks', company: 'Supreme', unit: 'pcs' },
  { id: 'bsu-4', name: 'Supreme Tea 950g', category: 'Beverages & Drinks', company: 'Supreme', unit: 'pcs' },

  // BEVERAGES - Tetley
  { id: 'btet-1', name: 'Tetley Black Tea 95g', category: 'Beverages & Drinks', company: 'Tetley', unit: 'pcs' },
  { id: 'btet-2', name: 'Tetley Black Tea 190g', category: 'Beverages & Drinks', company: 'Tetley', unit: 'pcs' },
  { id: 'btet-3', name: 'Tetley Green Tea 30 Bags', category: 'Beverages & Drinks', company: 'Tetley', unit: 'pcs' },
  { id: 'btet-4', name: 'Tetley Green Tea 100 Bags', category: 'Beverages & Drinks', company: 'Tetley', unit: 'pcs' },

  // BEVERAGES - Nescafe
  { id: 'bnsc-1', name: 'Nescafe Classic 50g', category: 'Beverages & Drinks', company: 'Nescafe - Nestle', unit: 'pcs' },
  { id: 'bnsc-2', name: 'Nescafe Classic 100g', category: 'Beverages & Drinks', company: 'Nescafe - Nestle', unit: 'pcs' },
  { id: 'bnsc-3', name: 'Nescafe Classic 200g', category: 'Beverages & Drinks', company: 'Nescafe - Nestle', unit: 'pcs' },
  { id: 'bnsc-4', name: 'Nescafe 3in1 Original 20 Sachets', category: 'Beverages & Drinks', company: 'Nescafe - Nestle', unit: 'pcs' },
  { id: 'bnsc-5', name: 'Nescafe 3in1 Original 30 Sachets', category: 'Beverages & Drinks', company: 'Nescafe - Nestle', unit: 'pcs' },

  // GROCERY - Dalda
  { id: 'gd-1', name: 'Dalda Cooking Oil 1L Pouch', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-2', name: 'Dalda Cooking Oil 2L Pouch', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-3', name: 'Dalda Cooking Oil 5L Tin', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-4', name: 'Dalda Banaspati Ghee 1kg', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-5', name: 'Dalda Banaspati Ghee 2.5kg', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-6', name: 'Dalda Banaspati Ghee 5kg', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },
  { id: 'gd-7', name: 'Dalda Banaspati Ghee 16kg', category: 'Grocery & Food', company: 'Dalda', unit: 'pcs' },

  // GROCERY - Sufi
  { id: 'gs-1', name: 'Sufi Cooking Oil 1L', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-2', name: 'Sufi Cooking Oil 2L', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-3', name: 'Sufi Cooking Oil 5L', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-4', name: 'Sufi Sunflower Oil 1L', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-5', name: 'Sufi Sunflower Oil 3L', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-6', name: 'Sufi Banaspati 1kg', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gs-7', name: 'Sufi Banaspati 2.5kg', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },

  // GROCERY - Habib
  { id: 'gh-1', name: 'Habib Cooking Oil 1L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },
  { id: 'gh-2', name: 'Habib Cooking Oil 2L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },
  { id: 'gh-3', name: 'Habib Cooking Oil 5L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },
  { id: 'gh-4', name: 'Habib Sunflower Oil 1L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },
  { id: 'gh-5', name: 'Habib Canola Oil 1L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },
  { id: 'gh-6', name: 'Habib Canola Oil 3L', category: 'Grocery & Food', company: 'Habib', unit: 'pcs' },

  // GROCERY - Eva
  { id: 'ge-1', name: 'Eva Cooking Oil 1L', category: 'Grocery & Food', company: 'Eva', unit: 'pcs' },
  { id: 'ge-2', name: 'Eva Cooking Oil 2L', category: 'Grocery & Food', company: 'Eva', unit: 'pcs' },
  { id: 'ge-3', name: 'Eva Cooking Oil 5L', category: 'Grocery & Food', company: 'Eva', unit: 'pcs' },
  { id: 'ge-4', name: 'Eva Sunflower Oil 1L', category: 'Grocery & Food', company: 'Eva', unit: 'pcs' },
  { id: 'ge-5', name: 'Eva Banaspati 1kg', category: 'Grocery & Food', company: 'Eva', unit: 'pcs' },

  // GROCERY - Tullo
  { id: 'gtl-1', name: 'Tullo Cooking Oil 1L', category: 'Grocery & Food', company: 'Tullo', unit: 'pcs' },
  { id: 'gtl-2', name: 'Tullo Cooking Oil 2L', category: 'Grocery & Food', company: 'Tullo', unit: 'pcs' },
  { id: 'gtl-3', name: 'Tullo Cooking Oil 5L', category: 'Grocery & Food', company: 'Tullo', unit: 'pcs' },
  { id: 'gtl-4', name: 'Tullo Banaspati 1kg', category: 'Grocery & Food', company: 'Tullo', unit: 'pcs' },
  { id: 'gtl-5', name: 'Tullo Banaspati 2.5kg', category: 'Grocery & Food', company: 'Tullo', unit: 'pcs' },

  // GROCERY - Rice - Guard Rice
  { id: 'ggr-1', name: 'Guard Basmati Rice 1kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },
  { id: 'ggr-2', name: 'Guard Basmati Rice 5kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },
  { id: 'ggr-3', name: 'Guard Basmati Rice 10kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },
  { id: 'ggr-4', name: 'Guard Basmati Rice 25kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },
  { id: 'ggr-5', name: 'Guard Super Kernel 5kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },
  { id: 'ggr-6', name: 'Guard Super Kernel 10kg', category: 'Grocery & Food', company: 'Guard Rice', unit: 'pcs' },

  // GROCERY - Falak Rice
  { id: 'gfr-1', name: 'Falak Basmati 1kg', category: 'Grocery & Food', company: 'Falak Rice', unit: 'pcs' },
  { id: 'gfr-2', name: 'Falak Basmati 5kg', category: 'Grocery & Food', company: 'Falak Rice', unit: 'pcs' },
  { id: 'gfr-3', name: 'Falak Basmati 10kg', category: 'Grocery & Food', company: 'Falak Rice', unit: 'pcs' },
  { id: 'gfr-4', name: 'Falak Super Kernel 5kg', category: 'Grocery & Food', company: 'Falak Rice', unit: 'pcs' },

  // GROCERY - Super Basmati
  { id: 'gsb-1', name: 'Super Basmati 5kg', category: 'Grocery & Food', company: 'Super Basmati', unit: 'pcs' },
  { id: 'gsb-2', name: 'Super Basmati 10kg', category: 'Grocery & Food', company: 'Super Basmati', unit: 'pcs' },
  { id: 'gsb-3', name: 'Super Basmati 25kg', category: 'Grocery & Food', company: 'Super Basmati', unit: 'pcs' },

  // GROCERY - Kernel Basmati
  { id: 'gkb-1', name: 'Kernel Basmati 5kg', category: 'Grocery & Food', company: 'Kernel Basmati', unit: 'pcs' },
  { id: 'gkb-2', name: 'Kernel Basmati 10kg', category: 'Grocery & Food', company: 'Kernel Basmati', unit: 'pcs' },

  // GROCERY - Sugar - JDW
  { id: 'gjdw-1', name: 'JDW White Sugar 1kg', category: 'Grocery & Food', company: 'JDW Sugar', unit: 'pcs' },
  { id: 'gjdw-2', name: 'JDW White Sugar 5kg', category: 'Grocery & Food', company: 'JDW Sugar', unit: 'pcs' },
  { id: 'gjdw-3', name: 'JDW White Sugar 50kg', category: 'Grocery & Food', company: 'JDW Sugar', unit: 'pcs' },

  // GROCERY - RYK
  { id: 'gryk-1', name: 'RYK White Sugar 1kg', category: 'Grocery & Food', company: 'RYK Sugar', unit: 'pcs' },
  { id: 'gryk-2', name: 'RYK White Sugar 5kg', category: 'Grocery & Food', company: 'RYK Sugar', unit: 'pcs' },
  { id: 'gryk-3', name: 'RYK White Sugar 50kg', category: 'Grocery & Food', company: 'RYK Sugar', unit: 'pcs' },

  // GROCERY - National Foods Salt
  { id: 'gns-1', name: 'National Iodized Salt 800g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gns-2', name: 'National Salt 1kg', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gns-3', name: 'National Salt 5kg', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },

  // GROCERY - Sufi Salt
  { id: 'gss-1', name: 'Sufi Iodized Salt 800g', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },
  { id: 'gss-2', name: 'Sufi Salt 1kg', category: 'Grocery & Food', company: 'Sufi', unit: 'pcs' },

  // GROCERY - Sunridge flour
  { id: 'gsun-1', name: 'Sunridge Maida 1kg', category: 'Grocery & Food', company: 'Sunridge', unit: 'pcs' },
  { id: 'gsun-2', name: 'Sunridge Maida 5kg', category: 'Grocery & Food', company: 'Sunridge', unit: 'pcs' },
  { id: 'gsun-3', name: 'Sunridge Atta 5kg', category: 'Grocery & Food', company: 'Sunridge', unit: 'pcs' },
  { id: 'gsun-4', name: 'Sunridge Atta 10kg', category: 'Grocery & Food', company: 'Sunridge', unit: 'pcs' },

  // GROCERY - Bake Parlor
  { id: 'gbp-1', name: 'Bake Parlor Maida 1kg', category: 'Grocery & Food', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'gbp-2', name: 'Bake Parlor Maida 5kg', category: 'Grocery & Food', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'gbp-3', name: 'Bake Parlor Atta 5kg', category: 'Grocery & Food', company: 'Bake Parlor', unit: 'pcs' },

  // GROCERY - Saira
  { id: 'gsai-1', name: 'Saira Atta 5kg', category: 'Grocery & Food', company: 'Saira', unit: 'pcs' },
  { id: 'gsai-2', name: 'Saira Atta 10kg', category: 'Grocery & Food', company: 'Saira', unit: 'pcs' },
  { id: 'gsai-3', name: 'Saira Maida 1kg', category: 'Grocery & Food', company: 'Saira', unit: 'pcs' },

  // GROCERY - National Foods Pulses
  { id: 'gnfp-1', name: 'National Daal Mash 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-2', name: 'National Daal Chana 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-3', name: 'National Daal Masoor 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-4', name: 'National Daal Moong 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-5', name: 'National Daal Toor 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-6', name: 'National Chana Whole 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },
  { id: 'gnfp-7', name: 'National Rajma 500g', category: 'Grocery & Food', company: 'National Foods', unit: 'pcs' },

  // SNACKS - Lays
  { id: 'sl-1', name: 'Lays Classic 15g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-2', name: 'Lays Classic 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-3', name: 'Lays Classic 60g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-4', name: 'Lays Classic 150g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-5', name: 'Lays Masala 15g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-6', name: 'Lays Masala 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-7', name: 'Lays Masala 60g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sl-8', name: 'Lays Magic Masala 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sk-1', name: 'Kurkure Masala Munch 15g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sk-2', name: 'Kurkure Masala Munch 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sk-3', name: 'Kurkure Chutney Chaska 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sc-1', name: 'Cheetos Puffs 15g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },
  { id: 'sc-2', name: 'Cheetos Puffs 30g', category: 'Snacks & Biscuits', company: 'PepsiCo — Lays', unit: 'pcs' },

  // SNACKS - Hilal
  { id: 'sh-1', name: 'Hilal Funfries 15g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-2', name: 'Hilal Funfries 30g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-3', name: 'Hilal Crax Corn Rings 15g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-4', name: 'Hilal Crax Corn Rings 30g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-5', name: 'Hilal Nimco 100g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-6', name: 'Hilal Nimco 200g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },
  { id: 'sh-7', name: 'Hilal Chilli Milli 30g', category: 'Snacks & Biscuits', company: 'Hilal Foods', unit: 'pcs' },

  // SNACKS - Candyland
  { id: 'scan-1', name: 'Candyland Snax 30g', category: 'Snacks & Biscuits', company: 'Candyland', unit: 'pcs' },
  { id: 'scan-2', name: 'Candyland Pops 15g', category: 'Snacks & Biscuits', company: 'Candyland', unit: 'pcs' },

  // SNACKS - Biscuits - EBM
  { id: 'se-1', name: 'EBM Sooper 117g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-2', name: 'EBM Sooper 234g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-3', name: 'EBM Sooper Family Pack', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-4', name: 'EBM Gluco 117g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-5', name: 'EBM Gluco 234g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-6', name: 'EBM Butter Puff 62g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-7', name: 'EBM Gala 117g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-8', name: 'EBM Gala Chocolate 117g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-9', name: 'EBM Rio 112g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-10', name: 'EBM Rio Double Chocolate 112g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-11', name: 'EBM Tuc 68g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-12', name: 'EBM Tuc 130g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },
  { id: 'se-13', name: 'EBM Prince 108g', category: 'Snacks & Biscuits', company: 'EBM — English Biscuits', unit: 'pcs' },

  // SNACKS - LU
  { id: 'sl-9', name: 'LU Peek Freans Saltish 114g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-10', name: 'LU Peek Freans Saltish 228g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-11', name: 'LU Peek Freans Marie 114g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-12', name: 'LU Peek Freans Marie 228g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-13', name: 'LU Nankhatai 112g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-14', name: 'LU Tiger 46g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-15', name: 'LU Tiger 112g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-16', name: 'LU Prince Choco 108g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-17', name: 'LU Oreo 119g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-18', name: 'LU Oreo 285g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-19', name: 'LU Peanut Panda 56g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },
  { id: 'sl-20', name: 'LU Zeera Plus 114g', category: 'Snacks & Biscuits', company: 'LU — Peek Freans', unit: 'pcs' },

  // SPICES - Shan
  { id: 'sp-s-1', name: 'Shan Biryani Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-2', name: 'Shan Biryani Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-3', name: 'Shan Karahi Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-4', name: 'Shan Karahi Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-5', name: 'Shan Nihari Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-6', name: 'Shan Nihari Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-7', name: 'Shan Pulao Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-8', name: 'Shan Tikka Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-9', name: 'Shan Tikka Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-10', name: 'Shan Kofta Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-11', name: 'Shan Haleem Masala 75g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-12', name: 'Shan Haleem Masala 150g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-13', name: 'Shan Paya Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-14', name: 'Shan Qorma Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-15', name: 'Shan Qorma Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-16', name: 'Shan Achar Gosht Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-17', name: 'Shan Seekh Kebab 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-18', name: 'Shan Dal Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-19', name: 'Shan Chana Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-20', name: 'Shan Rajma Masala 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-21', name: 'Shan Chat Masala 100g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-22', name: 'Shan Chat Masala 200g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-23', name: 'Shan Shami Kebab 50g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-24', name: 'Shan Sindhi Biryani 65g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sp-s-25', name: 'Shan Bombay Biryani 65g', category: 'Spices & Cooking', company: 'Shan Foods', unit: 'pcs' },

  // SPICES - National Foods
  { id: 'sp-nf-1', name: 'National Biryani Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-2', name: 'National Biryani Masala 90g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-3', name: 'National Karahi Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-4', name: 'National Nihari Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-5', name: 'National Pulao Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-6', name: 'National Tikka Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-7', name: 'National Kofta Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-8', name: 'National Haleem Masala 75g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-9', name: 'National Qorma Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-10', name: 'National Chana Masala 45g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-11', name: 'National Chat Masala 100g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-12', name: 'National Achar Masala 100g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-13', name: 'National Imli Sauce 300ml', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-14', name: 'National Ketchup 300g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-15', name: 'National Ketchup 800g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-16', name: 'National Chilli Garlic Sauce 300ml', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-17', name: 'National Mixed Pickle 320g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-18', name: 'National Mixed Pickle 1kg', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-19', name: 'National Mango Pickle 320g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  { id: 'sp-nf-20', name: 'National Lemon Pickle 320g', category: 'Spices & Cooking', company: 'National Foods', unit: 'pcs' },
  
  // PERSONAL CARE - Unilever - Lux
  { id: 'p-u-1', name: 'Lux Soap Soft Touch 145g', category: 'Personal Care', company: 'Unilever — Lux', unit: 'pcs' },
  { id: 'p-u-2', name: 'Lux Soap Velvet Touch 145g', category: 'Personal Care', company: 'Unilever — Lux', unit: 'pcs' },
  { id: 'p-u-3', name: 'Lifebuoy Red 140g', category: 'Personal Care', company: 'Unilever — Lifebuoy', unit: 'pcs' },
  { id: 'p-u-4', name: 'Lifebuoy Lemon 100g', category: 'Personal Care', company: 'Unilever — Lifebuoy', unit: 'pcs' },
  { id: 'p-u-5', name: 'Sunsilk Black Shampoo 180ml', category: 'Personal Care', company: 'Unilever — Sunsilk', unit: 'pcs' },
  { id: 'p-u-6', name: 'Sunsilk Gold Shampoo 180ml', category: 'Personal Care', company: 'Unilever — Sunsilk', unit: 'pcs' },
  { id: 'p-u-7', name: 'SafeGuard White 145g', category: 'Personal Care', company: 'P&G — SafeGuard', unit: 'pcs' },
  { id: 'p-u-8', name: 'SafeGuard Lemon 145g', category: 'Personal Care', company: 'P&G — SafeGuard', unit: 'pcs' },
  
  // PERSONAL CARE - P&G - Pantene
  { id: 'p-pg-1', name: 'Pantene Anti Dandruff 180ml', category: 'Personal Care', company: 'P&G — Pantene', unit: 'pcs' },
  { id: 'p-pg-2', name: 'Head & Shoulders Smooth 180ml', category: 'Personal Care', company: 'P&G — Head & Shoulders', unit: 'pcs' },
  { id: 'p-pg-3', name: 'Ariel Washing Powder 500g', category: 'Household Cleaning', company: 'P&G — Ariel', unit: 'pcs' },
  { id: 'p-pg-4', name: 'Ariel Washing Powder 1kg', category: 'Household Cleaning', company: 'P&G — Ariel', unit: 'pcs' },
  
  // HOUSEHOLD - Unilever - Surf Excel
  { id: 'h-u-1', name: 'Surf Excel Powder 500g', category: 'Household Cleaning', company: 'Unilever — Surf Excel', unit: 'pcs' },
  { id: 'h-u-2', name: 'Surf Excel Powder 1kg', category: 'Household Cleaning', company: 'Unilever — Surf Excel', unit: 'pcs' },
  { id: 'h-u-3', name: 'Vim Dishwash Bar 140g', category: 'Household Cleaning', company: 'Unilever — Vim', unit: 'pcs' },
  { id: 'h-u-4', name: 'Vim Liquid 250ml', category: 'Household Cleaning', company: 'Unilever — Vim', unit: 'pcs' },
  { id: 'h-u-5', name: 'Harpic Blue 500ml', category: 'Household Cleaning', company: 'Reckitt — Harpic', unit: 'pcs' },
  { id: 'h-u-6', name: 'Dettol Cleaner 500ml', category: 'Household Cleaning', company: 'Reckitt — Dettol', unit: 'pcs' },
];
