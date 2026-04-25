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

export const getBrandStyle = (companyName: string = ''): BrandStyle => {
  const safeName = (companyName || '').trim();
  if (!safeName) return { bg: '#888888', text: '#fff', abbr: '??' };
  const n = safeName.toLowerCase();

  // ── Beverages ─────────────────────────────────────────────────────
  if (n.includes('coca cola')) return { bg: '#F40009', text: '#fff', abbr: 'CC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg' };
  if (n.includes('pepsico') || n.includes('pepsi')) return { bg: '#004B93', text: '#fff', abbr: 'PE', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Pepsi_logo_2014.svg' };
  if (n.includes('pakola')) return { bg: '#007A3D', text: '#fff', abbr: 'PK' };
  if (n.includes('makka')) return { bg: '#1A6B3C', text: '#fff', abbr: 'MC' };
  if (n.includes('rc cola')) return { bg: '#C8102E', text: '#fff', abbr: 'RC' };
  if (n.includes('shezan')) return { bg: '#E31837', text: '#fff', abbr: 'SZ' };
  if (n.includes('hamdard')) return { bg: '#006633', text: '#fff', abbr: 'HD' };
  if (n.includes('shangrila')) return { bg: '#C41E3A', text: '#fff', abbr: 'SL' };
  
  // ── Grains & Flour ────────────────────────────────────────────────
  if (n.includes('sunridge')) return { bg: '#FF6B00', text: '#fff', abbr: 'SR' };
  if (n.includes('bake parlor')) return { bg: '#8B0000', text: '#fff', abbr: 'BP' };
  if (n.includes('falak')) return { bg: '#1565C0', text: '#fff', abbr: 'FK' };
  if (n.includes('guard')) return { bg: '#2E7D32', text: '#fff', abbr: 'GR' };
  if (n.includes('fauji')) return { bg: '#1B5E20', text: '#fff', abbr: 'FW' };
  if (n.includes('reem')) return { bg: '#C2185B', text: '#fff', abbr: 'RM' };
  if (n.includes('soan')) return { bg: '#00796B', text: '#fff', abbr: 'SN' };

  // ── Spices & Masala ───────────────────────────────────────────────
  if (n.includes('mehran')) return { bg: '#D32F2F', text: '#fff', abbr: 'MN' };
  if (n.includes('laziza')) return { bg: '#00796B', text: '#fff', abbr: 'LZ' };
  if (n.includes('mothers')) return { bg: '#E91E63', text: '#fff', abbr: 'MT' };
  
  // ── Cooking Oil & Ghee ───────────────────────────────────────────
  if (n.includes('seasons')) return { bg: '#FF8F00', text: '#fff', abbr: 'SN' };
  if (n.includes('tullo')) return { bg: '#D32F2F', text: '#fff', abbr: 'TL' };
  if (n.includes('naz')) return { bg: '#1976D2', text: '#fff', abbr: 'NZ' };
  if (n.includes('soya supreme')) return { bg: '#2E7D32', text: '#fff', abbr: 'SS' };
  if (n.includes('zaiqa')) return { bg: '#E65100', text: '#fff', abbr: 'ZQ' };
  if (n.includes('kisan')) return { bg: '#FBC02D', text: '#333', abbr: 'KS' };

  // ── Tea / Coffee ───────────────────────────────────────────────────
  if (n.includes('lipton')) return { bg: '#FFC20E', text: '#C8102E', abbr: 'LP', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Lipton_logo.svg' };
  if (n.includes('tapal')) return { bg: '#006400', text: '#fff', abbr: 'TP' };
  if (n.includes('supreme')) return { bg: '#1B3A6B', text: '#fff', abbr: 'SU' };
  if (n.includes('tetley')) return { bg: '#003087', text: '#fff', abbr: 'TL' };
  if (n.includes('nescafe') || n.includes('nestle')) return { bg: '#CC0000', text: '#fff', abbr: 'NS', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Nestl%C3%A9.svg' };
  if (n.includes('vital')) return { bg: '#2E7D32', text: '#fff', abbr: 'VT' };
  if (n.includes('ispahani')) return { bg: '#4A148C', text: '#fff', abbr: 'IS' };
  if (n.includes('brooke bond')) return { bg: '#D32F2F', text: '#fff', abbr: 'BB' };
  if (n.includes('tang')) return { bg: '#FF8F00', text: '#fff', abbr: 'TG' };
  if (n.includes('milo')) return { bg: '#2E7D32', text: '#fff', abbr: 'ML' };

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
  if (n.includes('peek freans') || n.includes('peek')) return { bg: '#003087', text: '#fff', abbr: 'PF' };
  if (n.includes('bisconni')) return { bg: '#E31837', text: '#fff', abbr: 'BC' };

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
  if (n.includes('good milk')) return { bg: '#4CAF50', text: '#fff', abbr: 'GM' };
  if (n.includes('adams')) return { bg: '#FFEB3B', text: '#333', abbr: 'AD' };
  if (n.includes('tarang')) return { bg: '#2196F3', text: '#fff', abbr: 'TR' };

  // ── Personal Care ──
  if (n.includes('ponds')) return { bg: '#F48FB1', text: '#fff', abbr: 'PD' };
  if (n.includes('vaseline')) return { bg: '#1A237E', text: '#fff', abbr: 'VS' };
  if (n.includes('himalaya')) return { bg: '#43A047', text: '#fff', abbr: 'HM' };

  // ── Cleaning ──
  if (n.includes('brite')) return { bg: '#1E88E5', text: '#fff', abbr: 'BT' };
  if (n.includes('bonus')) return { bg: '#E53935', text: '#fff', abbr: 'BN' };
  if (n.includes('saflon')) return { bg: '#00ACC1', text: '#fff', abbr: 'SL' };
  if (n.includes('scotch brite')) return { bg: '#7CB342', text: '#fff', abbr: 'SB' };

  // ── Snacks ──
  if (n.includes('kolson')) return { bg: '#E65100', text: '#fff', abbr: 'KL' };
  if (n.includes('candyland')) return { bg: '#D81B60', text: '#fff', abbr: 'CL' };
  if (n.includes('mitchell')) return { bg: '#1B5E20', text: '#fff', abbr: 'MT' };
  if (n.includes('ahmed foods')) return { bg: '#B71C1C', text: '#fff', abbr: 'AF' };

  // ── Candies ──
  if (n.includes('cadbury')) return { bg: '#4A148C', text: '#fff', abbr: 'CB' };
  
  // ── Medical ──
  if (n.includes('panadol')) return { bg: '#1E88E5', text: '#fff', abbr: 'PN' };
  if (n.includes('calpol')) return { bg: '#D81B60', text: '#fff', abbr: 'CP' };
  if (n.includes('disprin')) return { bg: '#E53935', text: '#fff', abbr: 'DS' };
  if (n.includes('vicks')) return { bg: '#006064', text: '#fff', abbr: 'VK' };
  if (n.includes('strepsils')) return { bg: '#FF8F00', text: '#fff', abbr: 'ST' };

  // ── Miscellaneous ──
  if (n.includes('mashaal')) return { bg: '#BF360C', text: '#fff', abbr: 'MH' };
  if (n.includes('energizer')) return { bg: '#212121', text: '#fff', abbr: 'EN' };

  // ── Local Pakistani Power Brands ──
  if (n.includes('qarshi')) return { bg: '#006430', text: '#fff', abbr: 'QA' };
  if (n.includes('gourmet')) return { bg: '#8B0000', text: '#fff', abbr: 'GO' };
  if (n.includes('medicam')) return { bg: '#1B3A6B', text: '#fff', abbr: 'MD' };
  if (n.includes('english')) return { bg: '#D32F2F', text: '#fff', abbr: 'EG' };
  if (n.includes('wbm')) return { bg: '#E65100', text: '#fff', abbr: 'WBM' };
  if (n.includes('shield')) return { bg: '#0D47A1', text: '#fff', abbr: 'SD' };
  if (n.includes('king tox') || n.includes('kingtox')) return { bg: '#C62828', text: '#fff', abbr: 'KT' };
  if (n.includes('finis')) return { bg: '#00838F', text: '#fff', abbr: 'FN' };
  if (n.includes('kaba')) return { bg: '#2E7D32', text: '#fff', abbr: 'KB' };
  if (n.includes('sams')) return { bg: '#AD1457', text: '#fff', abbr: 'SA' };
  if (n.includes('tibet')) return { bg: '#0277BD', text: '#fff', abbr: 'TB' };
  if (n.includes('capri')) return { bg: '#F06292', text: '#fff', abbr: 'CP' };
  if (n.includes('bio amla')) return { bg: '#2E7D32', text: '#fff', abbr: 'BA' };

  // ── Generic fallback with hash-based color ─────────────────────────
  const colors = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF5722','#795548','#607D8B'];
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const words = safeName.split(/\s+/);
  const abbr = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : safeName.slice(0, 2).toUpperCase();
  return { bg: color, text: '#fff', abbr: abbr || '??' };
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
  { id: 'groceries', name: 'Groceries', emoji: '🌾', productCount: '500+', color: '#E8F5E9' },
  { id: 'beverages', name: 'Beverages', emoji: '🥤', productCount: '300+', color: '#E3F2FD' },
  { id: 'snacks', name: 'Snacks', emoji: '🍪', productCount: '400+', color: '#FFF3E0' },
  { id: 'dairy', name: 'Dairy', emoji: '🥛', productCount: '150+', color: '#F3E5F5' },
  { id: 'personal_care', name: 'Personal Care', emoji: '🧴', productCount: '400+', color: '#FCE4EC' },
  { id: 'household', name: 'Household', emoji: '🏠', productCount: '250+', color: '#E0F2F1' },
  { id: 'baby_products', name: 'Baby Products', emoji: '🍼', productCount: '100+', color: '#FFF8E1' },
  { id: 'tobacco', name: 'Tobacco', emoji: '🚬', productCount: '50+', color: '#FFEBEE' },
  { id: 'medicines', name: 'Medicines', emoji: '💊', productCount: '100+', color: '#E1F5FE' },
  { id: 'others', name: 'Others', emoji: '📦', productCount: 'Unlimited', color: '#F5F5F5' },
];


export const KIRYANA_DATABASE: KiryanaProduct[] = [
  // ── SHAN PRODUCTS CATALOG ──────────────────────────────────────────
  
  // 1. COOKING SAUCES -> Sauces, Pickles & Chutneys
  { id: 'sh-cs-1', name: 'Shan Karahi Boti Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-2', name: 'Shan Nihari Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-3', name: 'Shan Tandoori Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-4', name: 'Shan Korma Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-5', name: 'Shan Achar Gosht Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-6', name: 'Shan Pilau Biryani Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-7', name: 'Shan Jalfrezi Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-8', name: 'Shan Sindhi Biryani Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-9', name: 'Shan Bombay Biryani Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-10', name: 'Shan Butter Chicken Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cs-11', name: 'Shan Biryani Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },

  // 2. RECIPE MIXES -> Spices & Masala
  { id: 'sh-rm-1', name: 'Shan Fish Masala (South Indian)', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-2', name: 'Shan Sambar Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-3', name: 'Shan Rasam Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-4', name: 'Shan Vegetable Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-5', name: 'Shan Meat Masala (South Indian)', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-6', name: 'Shan Chicken Masala (South Indian)', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-7', name: 'Shan Fried Fish Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-8', name: 'Shan Lahori Fish Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-9', name: 'Shan Sweet & Sour Recipe Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-10', name: 'Shan Chicken Chowmein Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-11', name: 'Shan Chicken Manchurian Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-12', name: 'Shan Chinese Beef Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-13', name: 'Shan Chinese Egg Fried Rice Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-14', name: 'Shan Kunna Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-15', name: 'Shan Achar Gosht Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-16', name: 'Shan Meat Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-17', name: 'Shan Karahi Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-18', name: 'Shan Chicken Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-19', name: 'Shan Kofta Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-20', name: 'Shan Nihari Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-21', name: 'Shan Paya Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-22', name: 'Shan Korma Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-23', name: 'Shan Murgh Cholay Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-24', name: 'Shan Fish Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-25', name: 'Shan Karachi Beef Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-26', name: 'Shan Memoni Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-27', name: 'Shan Pilau Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-28', name: 'Shan Bombay Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-29', name: 'Shan Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-30', name: 'Shan Sindhi Biryani Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-31', name: 'Shan Chicken Handi Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-32', name: 'Shan Chicken White Korma Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-33', name: 'Shan Chicken White Karahi Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-34', name: 'Shan Chicken Ginger Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-35', name: 'Shan Butter Chicken Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-36', name: 'Shan Chicken Jalfrezi Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-37', name: 'Shan Lahori Charga Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-38', name: 'Shan Chicken Broast Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-39', name: 'Shan Shami Kabab Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-40', name: 'Shan Dahi Bara Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-41', name: 'Shan Pakora Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-42', name: 'Shan Chapli Kabab Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-43', name: 'Shan Fried Chop Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-44', name: 'Shan Tandoori Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-45', name: 'Shan Chicken Tikka Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-46', name: 'Shan Seekh Kabab Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-47', name: 'Shan Tikka Boti Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-48', name: 'Shan Bihari Kabab Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-49', name: 'Shan Tikka Seekh Kabab Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-50', name: 'Shan Pav Bhaji Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-51', name: 'Shan Daal Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-52', name: 'Shan Shahi Haleem Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-53', name: 'Shan Haleem Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-54', name: 'Shan Easy Cook Haleem Mix', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-55', name: 'Shan Kabuli Rice Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-56', name: 'Shan Bukhari Rice Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-57', name: 'Shan Beryani Rice Masala (Arabic)', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-58', name: 'Shan Shish Touk Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-59', name: 'Shan Mandhi Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rm-60', name: 'Shan Kabsa Rice Masala', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },

  // 3. RICE RANGE -> Grains & Flour
  { id: 'sh-rr-1', name: 'Shan Himalayan Basmati Rice 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rr-2', name: 'Shan Daily Cooking Rice 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rr-3', name: 'Shan Biryani Rice 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-rr-4', name: 'Shan Sella Basmati Rice 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },

  // 4. PLAIN SPICES -> Spices & Masala
  { id: 'sh-ps-1', name: 'Shan Zafrani Garam Masala Powder 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-2', name: 'Shan Curry Powder 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-3', name: 'Shan Turmeric Powder 100g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-4', name: 'Shan Coriander Powder 100g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-5', name: 'Shan Red Chilli Powder 100g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-6', name: 'Shan Black Pepper Powder 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ps-7', name: 'Shan Fenugreek Leaves (Kasuri Methi) 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },

  // 5. SALT -> Spices & Masala
  { id: 'sh-salt-1', name: 'Shan Himalayan Pink Salt 800g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },

  // 6. COOKING PASTE -> Spices & Masala
  { id: 'sh-cp-1', name: 'Shan Papaya Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-2', name: 'Shan Red Chili Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-3', name: 'Shan Ginger Garlic Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-4', name: 'Shan Green Chilli Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-5', name: 'Shan Onion Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-6', name: 'Shan Ginger Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-7', name: 'Shan Minced Garlic 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-cp-8', name: 'Shan Garlic Paste 310g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },

  // 7. ACCOMPANIMENTS -> Spices & Masala (Chaat) & Sauces (Pickle/Chutney)
  { id: 'sh-ac-1', name: 'Shan Chana Chaat Masala 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-2', name: 'Shan Fruit Chaat Masala 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-3', name: 'Shan Chaat Masala 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-4', name: 'Shan Dahi Bara Chaat Masala 50g', category: 'Spices & Masala', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-5', name: 'Shan Crispy Fried Onion 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-6', name: 'Shan Green Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-7', name: 'Shan Tamarind Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-8', name: 'Shan Plum Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-9', name: 'Shan Tomato Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-10', name: 'Shan Mango Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-11', name: 'Shan Garlic Relish 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-12', name: 'Shan Dried Mango Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-13', name: 'Shan Ginger Mango Chutney 300g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-14', name: 'Shan Hyderabadi Mixed Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-15', name: 'Shan Mango Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-16', name: 'Shan Garlic Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-17', name: 'Shan Mixed Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-18', name: 'Shan Chilli Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ac-19', name: 'Shan Carrot Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Shan Foods', unit: 'pcs' },

  // 8. DESSERTS -> Desserts & Sweets
  { id: 'sh-ds-1', name: 'Shan Badam Kheer Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-2', name: 'Shan Gulab Jaman Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-3', name: 'Shan Sheer Khurma Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-4', name: 'Shan Gajar Halwa Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-5', name: 'Shan Lauki Halwa Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-6', name: 'Shan Rasmalai Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ds-7', name: 'Shan Special Kheer Mix 150g', category: 'Desserts & Sweets', company: 'Shan Foods', unit: 'pcs' },

  // 9. LENTILS -> Grains & Flour
  { id: 'sh-ln-1', name: 'Shan Toor Dal 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-2', name: 'Shan Chick Peas Tyson Black 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-3', name: 'Shan Split Masoor Dal 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-4', name: 'Shan Split Moong Dal 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-5', name: 'Shan Orid Dal 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-6', name: 'Shan Split Dal Chana 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-7', name: 'Shan Black Eye Beans 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-8', name: 'Shan Red Kidney Beans 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ln-9', name: 'Shan Chick Peas White 1kg', category: 'Grains & Flour', company: 'Shan Foods', unit: 'pcs' },

  // 10. FROZEN FOODS -> Frozen Foods
  { id: 'sh-ff-1', name: 'Shan Frozen Chicken Tandoori', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-2', name: 'Shan Frozen Beef Seekh Kebab', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-3', name: 'Shan Frozen Beef Shami Kebab', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-4', name: 'Shan Frozen Chicken Nihari', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-5', name: 'Shan Frozen Chicken Haleem', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-6', name: 'Shan Frozen Butter Chicken', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-7', name: 'Shan Frozen Chicken Shami Kebab', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-8', name: 'Shan Frozen Chicken Pilau Biryani', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-9', name: 'Shan Frozen Chicken Bombay Biryani', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-10', name: 'Shan Frozen Chicken Tikka Bites', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-11', name: 'Shan Frozen Beef Haleem', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-12', name: 'Shan Frozen Chicken Karahi', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-13', name: 'Shan Frozen Beef Nihari', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-ff-14', name: 'Shan Frozen Chicken Korma', category: 'Frozen Foods', company: 'Shan Foods', unit: 'pcs' },

  // 11. SHOOP - Instant Noodles -> Biscuits & Snacks
  { id: 'sh-sp-1', name: 'Shan Shoop Masala Noodles', category: 'Biscuits & Snacks', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-sp-2', name: 'Shan Shoop Chicken Noodles', category: 'Biscuits & Snacks', company: 'Shan Foods', unit: 'pcs' },
  { id: 'sh-sp-3', name: 'Shan Shoop Chatpatta Noodles', category: 'Biscuits & Snacks', company: 'Shan Foods', unit: 'pcs' },

  // ── SUNRIDGE (Unity Foods) ──────────────────────────────────────────
  { id: 'sr-at-1', name: 'Sunridge Fortified Chakki Atta 2kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-2', name: 'Sunridge Fortified Chakki Atta 5kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-3', name: 'Sunridge Fortified Chakki Atta 10kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-4', name: 'Sunridge Fiber Fit Atta 2kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-5', name: 'Sunridge Fiber Fit Atta 5kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-6', name: 'Sunridge Super Fine Atta 5kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-7', name: 'Sunridge Super Fine Atta 10kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-8', name: 'Sunridge Super White Atta 5kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-9', name: 'Sunridge Super White Atta 10kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-at-10', name: 'Sunridge Classic Chakki Atta 5kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-1', name: 'Sunridge Premium Basmati Rice', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-2', name: 'Sunridge Sella Gold Basmati Rice', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-3', name: 'Sunridge Royale Super Basmati', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-4', name: 'Sunridge Barkat Basmati', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-5', name: 'Sunridge Zauqeen Basmati', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ri-6', name: 'Sunridge Rozana Basmati', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-1', name: 'Sunridge Maida 500g', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-2', name: 'Sunridge Maida 1kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-3', name: 'Sunridge Besan 500g', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-4', name: 'Sunridge Besan 1kg', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-5', name: 'Sunridge Suji 250g', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ke-6', name: 'Sunridge Suji 500g', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-sa-1', name: 'Sunridge Himalayan Pink Salt', category: 'Spices & Masala', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-sa-2', name: 'Sunridge Iodized Refined Salt', category: 'Spices & Masala', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-sa-3', name: 'Sunridge Refined Salt', category: 'Spices & Masala', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-1', name: 'Sunridge Daal Moong', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-2', name: 'Sunridge Daal Chana', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-3', name: 'Sunridge Daal Masoor', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-4', name: 'Sunridge Sabut Masoor', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-5', name: 'Sunridge Daal Mash', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-6', name: 'Sunridge White Chana', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-lp-7', name: 'Sunridge Black Chana', category: 'Grains & Flour', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-oil-1', name: 'Sunridge Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-oil-2', name: 'Sunridge Cooking Oil 3L', category: 'Cooking Oil & Ghee', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-oil-3', name: 'Sunridge Canola Oil 1L', category: 'Cooking Oil & Ghee', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-oil-4', name: 'Sunridge Canola Oil 3L', category: 'Cooking Oil & Ghee', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-oil-5', name: 'Sunridge Deep Frying Oil 16L', category: 'Cooking Oil & Ghee', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-1', name: 'Sunridge Plain Paratha', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-2', name: 'Sunridge Fiber-Fit Paratha', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-3', name: 'Sunridge Whole Wheat Paratha', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-4', name: 'Sunridge Aloo Paratha', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-5', name: 'Sunridge Lachaydar Paratha', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-6', name: 'Sunridge Punjabi Samosa', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },
  { id: 'sr-ff-7', name: 'Sunridge Vegetable Spring Roll', category: 'Frozen Foods', company: 'Sunridge', unit: 'pcs' },

  // ── BAKE PARLOR (Rasul Group) ───────────────────────────────────────
  { id: 'bp-prm-1', name: 'Bake Parlor Bar B.Que Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-2', name: 'Bake Parlor Bihari Tikka Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-3', name: 'Bake Parlor Shashlik Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-4', name: 'Bake Parlor Qeema Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-5', name: 'Bake Parlor Chicken Manchurian Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-6', name: 'Bake Parlor Chicken Ginger Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-7', name: 'Bake Parlor Biryani Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-8', name: 'Bake Parlor Jalfrezi Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-9', name: 'Bake Parlor Balti Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-10', name: 'Bake Parlor Tikka Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-11', name: 'Bake Parlor Seven Spice Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-12', name: 'Bake Parlor Achari Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-13', name: 'Bake Parlor Malai Tikka Macaroni', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-14', name: 'Bake Parlor Alfredo White Sauce Pasta', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-15', name: 'Bake Parlor Cajun Spaghetti', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-16', name: 'Bake Parlor Chowmein Hakka Noodles', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-17', name: 'Bake Parlor Chicken Chilli Spaghetti', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-18', name: 'Bake Parlor Chicken Chowmein Spaghetti', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-19', name: 'Bake Parlor Chicken Lasagne', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-20', name: 'Bake Parlor Fajita Spaghetti', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-prm-21', name: 'Bake Parlor Khowsuey Mix', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-1', name: 'Bake Parlor Penne Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-2', name: 'Bake Parlor Twisted Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-3', name: 'Bake Parlor Three Color Fusilli', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-4', name: 'Bake Parlor Spiral Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-5', name: 'Bake Parlor Shell Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-6', name: 'Bake Parlor Spaghetti', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-7', name: 'Bake Parlor Jumbo Elbow Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-8', name: 'Bake Parlor Large Penne Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-9', name: 'Bake Parlor Lasagne Sheets', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-10', name: 'Bake Parlor Long Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-11', name: 'Bake Parlor Elbow Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-12', name: 'Bake Parlor Big Elbow Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-13', name: 'Bake Parlor Ring Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-pp-14', name: 'Bake Parlor Chinese Real Egg Noodles', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-ww-1', name: 'Bake Parlor Whole Wheat Elbow Macaroni', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-ww-2', name: 'Bake Parlor Whole Wheat Spaghetti', category: 'Biscuits & Snacks', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-ism-1', name: 'Bake Parlor Instant Red Sauce Mix', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-ism-2', name: 'Bake Parlor Instant White Sauce Mix', category: 'Spices & Masala', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-1', name: 'Bake Parlor Chilli Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-2', name: 'Bake Parlor Soy Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-3', name: 'Bake Parlor Synthetic Vinegar', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-4', name: 'Bake Parlor Pizza Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-5', name: 'Bake Parlor Tomato Ketchup', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sk-6', name: 'Bake Parlor Chilli Garlic Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-vm-1', name: 'Bake Parlor U-Shaped Vermicelli', category: 'Desserts & Sweets', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-vm-2', name: 'Bake Parlor Roasted Vermicelli', category: 'Desserts & Sweets', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-vm-3', name: 'Bake Parlor Color Flavored Vermicelli', category: 'Desserts & Sweets', company: 'Bake Parlor', unit: 'pcs' },
  { id: 'bp-sy-1', name: 'Bake Parlor Jam-e-Mashriq Ice-Cream Syrup', category: 'Tea & Beverages', company: 'Bake Parlor', unit: 'pcs' },

  // ── FALAK (Matco Foods) ─────────────────────────────────────────────
  { id: 'fk-ri-1', name: 'Falak Extreme Basmati Rice', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-ri-2', name: 'Falak Premium Basmati Rice', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-ri-3', name: 'Falak Brown Basmati Rice', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-ri-4', name: 'Falak Bachat Long Grain Rice', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-ri-5', name: 'Falak Daily Rice', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-fl-1', name: 'Falak Corn Flour 275g', category: 'Grains & Flour', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sm-1', name: 'Falak Bombay Biryani Masala', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sm-2', name: 'Falak Chicken Tikka Masala', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sm-3', name: 'Falak Chaat Masala', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sm-4', name: 'Falak Black Pepper Powder', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sa-1', name: 'Falak Himalayan Pink Salt', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sa-2', name: 'Falak Arabian Sea Salt', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-rm-1', name: 'Falak Chatpatta Dahi Bara Mix', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-rm-2', name: 'Falak Chicken Corn Soup', category: 'Spices & Masala', company: 'Falak', unit: 'pcs' },
  { id: 'fk-sc-1', name: 'Falak Chili Crunch (Original)', category: 'Sauces, Pickles & Chutneys', company: 'Falak', unit: 'pcs' },

  // ── GUARD (Guard Agri) ──────────────────────────────────────────────
  { id: 'gr-ri-1', name: 'Guard Supreme Basmati Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-ri-2', name: 'Guard Ultimate Basmati Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-ri-3', name: 'Guard Tibar Basmati Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-ri-4', name: 'Guard Super Kernel Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-ri-5', name: 'Guard Easy Cook Sella Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-ri-6', name: 'Guard Awami Rice', category: 'Grains & Flour', company: 'Guard', unit: 'pcs' },
  { id: 'gr-sa-1', name: 'Guard Himalayan Pink Salt', category: 'Spices & Masala', company: 'Guard', unit: 'pcs' },

  // ── FAUJI CEREALS ───────────────────────────────────────────────────
  { id: 'fw-cf-1', name: 'Fauji Corn Flakes', category: 'Biscuits & Snacks', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-cf-2', name: 'Fauji Rice Flakes', category: 'Biscuits & Snacks', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-cf-3', name: 'Fauji Wheat Flakes', category: 'Biscuits & Snacks', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-cp-1', name: 'Fauji Chocolate Corn Pops', category: 'Biscuits & Snacks', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-cp-2', name: 'Fauji Honey Corn Pops', category: 'Biscuits & Snacks', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-po-1', name: 'Fauji Wheat Porridge', category: 'Grains & Flour', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-po-2', name: 'Fauji Barley Porridge', category: 'Grains & Flour', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-ds-1', name: 'Fauji Custard Powder', category: 'Desserts & Sweets', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-ds-2', name: 'Fauji Jelly Mix', category: 'Desserts & Sweets', company: 'Fauji', unit: 'pcs' },
  { id: 'fw-at-1', name: 'Fauji Wheat Atta', category: 'Grains & Flour', company: 'Fauji', unit: 'pcs' },

  // ── SOAN (Soan Foods) ───────────────────────────────────────────────
  { id: 'sn-ri-1', name: 'Soan Basmati Rice', category: 'Grains & Flour', company: 'Soan', unit: 'pcs' },
  { id: 'sn-ri-2', name: 'Soan Sella Rice', category: 'Grains & Flour', company: 'Soan', unit: 'pcs' },
  { id: 'sn-ri-3', name: 'Soan Long Grain Rice', category: 'Grains & Flour', company: 'Soan', unit: 'pcs' },

  // ── REEM RICE ───────────────────────────────────────────────────────
  { id: 'rm-ri-1', name: 'Reem Basmati Rice', category: 'Grains & Flour', company: 'Reem Rice', unit: 'pcs' },
  { id: 'rm-ri-2', name: 'Reem Super Kernel Rice', category: 'Grains & Flour', company: 'Reem Rice', unit: 'pcs' },
  { id: 'rm-ri-3', name: 'Reem Sella Basmati Rice', category: 'Grains & Flour', company: 'Reem Rice', unit: 'pcs' },
  { id: 'rm-ri-4', name: 'Reem Long Grain Rice', category: 'Grains & Flour', company: 'Reem Rice', unit: 'pcs' },

  // ── NATIONAL FOODS ──────────────────────────────────────────────────
  // 1. RECIPE MIXES
  { id: 'nf-rm-1', name: 'National Biryani Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-2', name: 'National Sindhi Biryani Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-3', name: 'National Bombay Biryani Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-4', name: 'National Memoni Biryani Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-5', name: 'National Yakhni Pulao Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-6', name: 'National Karahi Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-7', name: 'National Nihari Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-8', name: 'National Haleem Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-9', name: 'National Korma Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-10', name: 'National Achar Gosht Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-11', name: 'National Shami Kabab Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-12', name: 'National Seekh Kabab Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-13', name: 'National Tikka Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-14', name: 'National Fish Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-15', name: 'National Kofta Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-rm-16', name: 'National Quorma Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-me-1', name: 'National Made Easy Biryani Mix', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-me-2', name: 'National Made Easy Karahi Mix', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },

  // 2. BASIC INGREDIENTS
  { id: 'nf-in-1', name: 'National Red Chilli Powder', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-2', name: 'National Turmeric Powder (Haldi)', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-3', name: 'National Coriander Powder (Dhania)', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-4', name: 'National Cumin Seeds (Zeera)', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-5', name: 'National Garam Masala Powder', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-6', name: 'National Black Pepper Powder', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-in-7', name: 'National Kasuri Methi 50g', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-cp-1', name: 'National Ginger Paste', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-cp-2', name: 'National Garlic Paste', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-sa-1', name: 'National Iodized Refined Salt', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-sa-2', name: 'National Himalayan Pink Salt', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },

  // 3. KETCHUP & SAUCES
  { id: 'nf-ks-1', name: 'National Tomato Ketchup Bottle', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-2', name: 'National Tomato Ketchup Pouch 1kg', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-3', name: 'National Chilli Garlic Sauce', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-4', name: 'National Soy Sauce', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-5', name: 'National Hot Sauce', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-6', name: 'National Drizz\'l Smoky Sauce', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ks-7', name: 'National Drizz\'l Tangy Sauce', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },

  // 4. PICKLES (ACHAR)
  { id: 'nf-pi-1', name: 'National Mango Pickle (Aam ka Achar)', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-pi-2', name: 'National Mixed Pickle', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-pi-3', name: 'National Lemon Pickle', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-pi-4', name: 'National Chilli Pickle', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-pi-5', name: 'National Garlic Pickle', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-pi-6', name: 'National Karachi Style Achar', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },

  // 5. MAYONNAISE & DRESSINGS
  { id: 'nf-my-1', name: 'National Classic Mayonnaise', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-my-2', name: 'National Garlic Mayonnaise', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ch-1', name: 'National Podina Chutney', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ch-2', name: 'National Imli Chutney', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },

  // 6. DESSERTS
  { id: 'nf-de-1', name: 'National Mango Custard Powder', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-2', name: 'National Strawberry Custard Powder', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-3', name: 'National Vanilla Custard Powder', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-4', name: 'National Banana Custard Powder', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-5', name: 'National Strawberry Jelly Mix', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-6', name: 'National Mango Jelly Mix', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-7', name: 'National Kheer Mix', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-8', name: 'National Falooda Mix', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-9', name: 'National Sheer Khurma Mix', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-de-10', name: 'National Roasted Vermicelli', category: 'Desserts & Sweets', company: 'National Foods', unit: 'pcs' },

  // 7. JAMS & JELLIES
  { id: 'nf-ja-1', name: 'National Mixed Fruit Jam', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ja-2', name: 'National Strawberry Jam', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ja-3', name: 'National Mango Jam', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-ja-4', name: 'National Apricot Jam (Khubani)', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },

  // 8. SNACKS & SEASONINGS
  { id: 'nf-sn-1', name: 'National Chat Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-sn-2', name: 'National Dahi Bara Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-sn-3', name: 'National Pakora Masala', category: 'Spices & Masala', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-sn-4', name: 'National Karachi Nimco Mix', category: 'Biscuits & Snacks', company: 'National Foods', unit: 'pcs' },
  { id: 'nf-fo-1', name: 'National Golden Fried Onions 400g', category: 'Sauces, Pickles & Chutneys', company: 'National Foods', unit: 'pcs' },

  // ── MEHRAN FOODS ──────────────────────────────────────────────────
  // 1. RECIPE MIXES
  { id: 'me-rm-1', name: 'Mehran Biryani Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-2', name: 'Mehran Sindhi Biryani Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-3', name: 'Mehran Yakhni Pulao Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-4', name: 'Mehran Karahi Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-5', name: 'Mehran Butter Chicken Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-6', name: 'Mehran Achar Gosht Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-7', name: 'Mehran Nihari Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-8', name: 'Mehran Korma Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-9', name: 'Mehran Haleem Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-10', name: 'Mehran Seekh Kabab Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-11', name: 'Mehran Shami Kabab Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-rm-12', name: 'Mehran Tikka Masala', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  
  // 2. BASIC SPICES & SALT
  { id: 'me-in-1', name: 'Mehran Red Chilli Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-2', name: 'Mehran Coriander Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-3', name: 'Mehran Turmeric Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-4', name: 'Mehran Cumin Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-5', name: 'Mehran Garam Masala Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-6', name: 'Mehran Black Pepper Powder', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-7', name: 'Mehran Kasuri Methi', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-in-8', name: 'Mehran Iodized Salt', category: 'Spices & Masala', company: 'Mehran Foods', unit: 'pcs' },

  // 3. PICKLES & SAUCES
  { id: 'me-pi-1', name: 'Mehran Mixed Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-pi-2', name: 'Mehran Mango Pickle 400g', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-pi-3', name: 'Mehran Lemon Pickle', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-pi-4', name: 'Mehran Chilli Pickle', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-cp-1', name: 'Mehran Ginger Garlic Paste 750g', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-cp-2', name: 'Mehran Tomato Ketchup', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-cp-3', name: 'Mehran Chilli Sauce', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },

  // 4. RICE & FLOUR
  { id: 'me-ri-1', name: 'Mehran Super Kernel Basmati Rice', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-ri-2', name: 'Mehran Sella Rice', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-fl-1', name: 'Mehran Wheat Flour (Atta)', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-fl-2', name: 'Mehran Maida 1kg', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-fl-3', name: 'Mehran Besan (Gram Flour) 1kg', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-fl-4', name: 'Mehran Sooji (Semolina)', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  
  // 5. PULSES (DAALAIN)
  { id: 'me-da-1', name: 'Mehran Daal Moong 1kg', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-da-2', name: 'Mehran Daal Chana 1kg', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-da-3', name: 'Mehran Daal Masoor 1kg', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-da-4', name: 'Mehran White Chana (Chickpeas)', category: 'Grains & Flour', company: 'Mehran Foods', unit: 'pcs' },

  // 6. DESSERTS
  { id: 'me-de-1', name: 'Mehran Kheer Mix', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-2', name: 'Mehran Zarda Mix', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-3', name: 'Mehran Sheer Khurma Mix', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-4', name: 'Mehran Custard Powder', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-5', name: 'Mehran Jelly Mix', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-6', name: 'Mehran Vermicelli (Plain)', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-de-7', name: 'Mehran Roasted Vermicelli', category: 'Desserts & Sweets', company: 'Mehran Foods', unit: 'pcs' },

  // 7. DRY FRUITS & OTHERS
  { id: 'me-df-1', name: 'Mehran Almonds (Badam)', category: 'Biscuits & Snacks', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-df-2', name: 'Mehran Cashews (Kaju)', category: 'Biscuits & Snacks', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-df-3', name: 'Mehran Dates (Khajoor)', category: 'Biscuits & Snacks', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-oi-1', name: 'Mehran Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-oi-2', name: 'Mehran White Vinegar', category: 'Sauces, Pickles & Chutneys', company: 'Mehran Foods', unit: 'pcs' },
  { id: 'me-fr-1', name: 'Mehran Frozen Paratha', category: 'Frozen Foods', company: 'Mehran Foods', unit: 'pcs' },

  // ── LAZIZA FOODS ───────────────────────────────────────────────────
  // 1. RECIPE MIXES
  { id: 'lz-rm-1', name: 'Laziza Biryani Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-2', name: 'Laziza Sindhi Biryani Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-3', name: 'Laziza Karahi Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-4', name: 'Laziza Nihari Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-5', name: 'Laziza Achar Gosht Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-6', name: 'Laziza Chicken Tikka Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-7', name: 'Laziza Haleem Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-rm-8', name: 'Laziza Behari Kabab Masala', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  
  // 2. DESSERTS (Laziza specialty)
  { id: 'lz-de-1', name: 'Laziza Mango Custard Powder 300g', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-2', name: 'Laziza Strawberry Custard 300g', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-3', name: 'Laziza Kheer Mix (Standard)', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-4', name: 'Laziza Kajoo Kheer Mix', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-5', name: 'Laziza Firni Khas Zafran', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-6', name: 'Laziza Rabri Falooda Mix', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-7', name: 'Laziza Gulab Jamun Mix', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-8', name: 'Laziza Jelly Strawberry', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-de-9', name: 'Laziza Roasted Vermicelli', category: 'Desserts & Sweets', company: 'Laziza Foods', unit: 'pcs' },

  // 3. OTHERS
  { id: 'lz-pi-1', name: 'Laziza Mixed Pickle', category: 'Sauces, Pickles & Chutneys', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-ks-1', name: 'Laziza Tomato Ketchup', category: 'Sauces, Pickles & Chutneys', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-in-1', name: 'Laziza Red Chilli Powder', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },
  { id: 'lz-in-2', name: 'Laziza Turmeric Powder', category: 'Spices & Masala', company: 'Laziza Foods', unit: 'pcs' },

  // ── NASEEM FOODS ───────────────────────────────────────────────────
  { id: 'ns-rm-1', name: 'Naseem Nihari Masala (Bulk 1kg)', category: 'Spices & Masala', company: 'Naseem Foods', unit: 'pcs' },
  { id: 'ns-rm-2', name: 'Naseem Biryani Masala 60g', category: 'Spices & Masala', company: 'Naseem Foods', unit: 'pcs' },
  { id: 'ns-rm-3', name: 'Naseem Karahi Masala', category: 'Spices & Masala', company: 'Naseem Foods', unit: 'pcs' },
  { id: 'ns-in-1', name: 'Naseem Red Chilli Powder', category: 'Spices & Masala', company: 'Naseem Foods', unit: 'pcs' },

  // ── HABIB OIL MILLS (HOM) ──────────────────────────────────────────
  // 1. COOKING OILS
  { id: 'hb-ol-1', name: 'Habib Cooking Oil 1L Bottle', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-2', name: 'Habib Cooking Oil 2.5L Tin', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-3', name: 'Habib Cooking Oil 5L Tin', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-4', name: 'Habib Banaspati Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-5', name: 'Habib Banaspati Ghee 5kg Tin', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-6', name: 'Super Habib Soybean Oil 3L', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-7', name: 'Handi Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-ol-8', name: 'Nayab Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Habib Oil Mills', unit: 'pcs' },

  // 2. WATER
  { id: 'hb-wt-1', name: 'First Habib Mineral Water 500ml', category: 'Tea & Beverages', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-wt-2', name: 'First Habib Mineral Water 1.5L', category: 'Tea & Beverages', company: 'Habib Oil Mills', unit: 'pcs' },
  { id: 'hb-wt-3', name: 'First Habib Mineral Water 19L Dispenser', category: 'Tea & Beverages', company: 'Habib Oil Mills', unit: 'pcs' },

  // ── COOKING OIL & GHEE ──────────────────────────────────────────────
  // DALDA
  { id: 'co-dl-1', name: 'Dalda Cooking Oil 1L Pouch', category: 'Cooking Oil & Ghee', company: 'Dalda', unit: 'pcs' },
  { id: 'co-dl-2', name: 'Dalda Cooking Oil 5L Tin', category: 'Cooking Oil & Ghee', company: 'Dalda', unit: 'pcs' },
  { id: 'co-dl-3', name: 'Dalda VTF Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Dalda', unit: 'pcs' },
  { id: 'co-dl-4', name: 'Manpasand Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Dalda', unit: 'pcs' },
  { id: 'co-dl-5', name: 'Tullo Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Dalda', unit: 'pcs' },
  // SUFI
  { id: 'co-sf-1', name: 'Sufi Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Sufi', unit: 'pcs' },
  { id: 'co-sf-2', name: 'Sufi Banaspati Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Sufi', unit: 'pcs' },
  { id: 'co-sf-3', name: 'Sufi Sunflower Oil 1L', category: 'Cooking Oil & Ghee', company: 'Sufi', unit: 'pcs' },
  // SEASONS
  { id: 'co-sn-1', name: 'Seasons Canola Oil 1L', category: 'Cooking Oil & Ghee', company: 'Seasons', unit: 'pcs' },
  { id: 'co-sn-2', name: 'Seasons Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Seasons', unit: 'pcs' },
  // SOYA SUPREME
  { id: 'co-ss-1', name: 'Soya Supreme Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Soya Supreme', unit: 'pcs' },
  { id: 'co-ss-2', name: 'Soya Supreme Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Soya Supreme', unit: 'pcs' },
  // MEZAN
  { id: 'co-mz-1', name: 'Mezan Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Mezan', unit: 'pcs' },
  { id: 'co-mz-2', name: 'Mezan Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Mezan', unit: 'pcs' },
  // EVA
  { id: 'co-ev-1', name: 'Eva Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Eva', unit: 'pcs' },
  { id: 'co-ev-2', name: 'Eva Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Eva', unit: 'pcs' },
  // OTHER OILS
  { id: 'co-kn-1', name: 'Kisan Cooking Oil 1L', category: 'Cooking Oil & Ghee', company: 'Kisan', unit: 'pcs' },
  { id: 'co-kn-2', name: 'Kisan Banaspati 1kg', category: 'Cooking Oil & Ghee', company: 'Kisan', unit: 'pcs' },
  { id: 'co-az-1', name: 'Aseel Pure Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Aseel', unit: 'pcs' },
  { id: 'co-ad-1', name: 'Adams Desi Ghee 500g', category: 'Cooking Oil & Ghee', company: 'Adams', unit: 'pcs' },
  { id: 'co-pd-1', name: 'Pak Desi Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Pak Desi Ghee', unit: 'pcs' },

  // ── TEA & BEVERAGES ─────────────────────────────────────────────────
  // LIPTON
  { id: 'tb-lp-1', name: 'Lipton Yellow Label Tea 190g', category: 'Tea & Beverages', company: 'Lipton', unit: 'pcs' },
  { id: 'tb-lp-2', name: 'Lipton Yellow Label 430g', category: 'Tea & Beverages', company: 'Lipton', unit: 'pcs' },
  { id: 'tb-lp-3', name: 'Lipton Tea Bags 50s', category: 'Tea & Beverages', company: 'Lipton', unit: 'pcs' },
  { id: 'tb-lp-4', name: 'Lipton Green Tea Original', category: 'Tea & Beverages', company: 'Lipton', unit: 'pcs' },
  // TAPAL
  { id: 'tb-tp-1', name: 'Tapal Danedar Tea 190g', category: 'Tea & Beverages', company: 'Tapal', unit: 'pcs' },
  { id: 'tb-tp-2', name: 'Tapal Danedar 430g pouch', category: 'Tea & Beverages', company: 'Tapal', unit: 'pcs' },
  { id: 'tb-tp-3', name: 'Tapal Family Mixture', category: 'Tea & Beverages', company: 'Tapal', unit: 'pcs' },
  { id: 'tb-tp-4', name: 'Tapal Mezban Dust Tea', category: 'Tea & Beverages', company: 'Tapal', unit: 'pcs' },
  { id: 'tb-tp-5', name: 'Tapal Green Tea Lemon', category: 'Tea & Beverages', company: 'Tapal', unit: 'pcs' },
  // VITAL
  { id: 'tb-vt-1', name: 'Vital Tea Danedar 450g', category: 'Tea & Beverages', company: 'Vital Tea', unit: 'pcs' },
  { id: 'tb-vt-2', name: 'Vital Green Tea', category: 'Tea & Beverages', company: 'Vital Tea', unit: 'pcs' },
  // BROOKE BOND (SUPREME)
  { id: 'tb-bb-1', name: 'Brooke Bond Supreme 430g', category: 'Tea & Beverages', company: 'Supreme Tea', unit: 'pcs' },
  { id: 'tb-bb-2', name: 'Brooke Bond A1 Tea', category: 'Tea & Beverages', company: 'Brooke Bond', unit: 'pcs' },
  // COFFEE & CHOCOLATE
  { id: 'tb-nc-1', name: 'Nescafe Classic 50g Bottle', category: 'Tea & Beverages', company: 'Nescafe', unit: 'pcs' },
  { id: 'tb-nc-2', name: 'Nescafe Gold 100g Bottle', category: 'Tea & Beverages', company: 'Nescafe', unit: 'pcs' },
  { id: 'tb-nc-3', name: 'Nescafe 3-in-1 Sachet', category: 'Tea & Beverages', company: 'Nescafe', unit: 'pcs' },
  { id: 'tb-ml-1', name: 'Milo Powder 200g Tin', category: 'Tea & Beverages', company: 'Milo', unit: 'pcs' },
  { id: 'tb-ml-2', name: 'Milo RTD 200ml Tetra', category: 'Tea & Beverages', company: 'Milo', unit: 'pcs' },
  // DRINKS & SHARBATS
  { id: 'tb-ra-1', name: 'Rooh Afza 800ml Bottle', category: 'Tea & Beverages', company: 'Rooh Afza', unit: 'pcs' },
  { id: 'tb-ra-2', name: 'Rooh Afza 1.5L Bottle', category: 'Tea & Beverages', company: 'Rooh Afza', unit: 'pcs' },
  { id: 'tb-tg-1', name: 'Tang Orange 750g Jar', category: 'Tea & Beverages', company: 'Tang', unit: 'pcs' },
  { id: 'tb-tg-2', name: 'Tang Mango 750g Jar', category: 'Tea & Beverages', company: 'Tang', unit: 'pcs' },
  { id: 'tb-tg-3', name: 'Tang Orange Sachet', category: 'Tea & Beverages', company: 'Tang', unit: 'pcs' },

  // ── MILK & DAIRY ────────────────────────────────────────────────────
  // NESTLE MILKPAK
  { id: 'md-mp-1', name: 'Milkpak UHT Milk 250ml', category: 'Milk & Dairy', company: 'Nestle Milkpak', unit: 'pcs' },
  { id: 'md-mp-2', name: 'Milkpak UHT Milk 1 Litre', category: 'Milk & Dairy', company: 'Nestle Milkpak', unit: 'pcs' },
  { id: 'md-mp-3', name: 'Milkpak Cream 200ml', category: 'Milk & Dairy', company: 'Nestle Milkpak', unit: 'pcs' },
  { id: 'md-mp-4', name: 'Milkpak Butter 200g', category: 'Milk & Dairy', company: 'Nestle Milkpak', unit: 'pcs' },
  { id: 'md-mp-5', name: 'Nestle Everyday 600g pouch', category: 'Milk & Dairy', company: 'Nestle Everyday', unit: 'pcs' },
  { id: 'md-mp-6', name: 'Nestle Nido 1kg pouch', category: 'Milk & Dairy', company: 'Nestle Nido', unit: 'pcs' },
  // OLPERS
  { id: 'md-ol-1', name: 'Olper\'s UHT Milk 250ml', category: 'Milk & Dairy', company: 'Olpers', unit: 'pcs' },
  { id: 'md-ol-2', name: 'Olper\'s UHT Milk 1 Litre', category: 'Milk & Dairy', company: 'Olpers', unit: 'pcs' },
  { id: 'md-ol-3', name: 'Olper\'s Dairy Cream 200ml', category: 'Milk & Dairy', company: 'Olpers', unit: 'pcs' },
  { id: 'md-ol-4', name: 'Olper\'s Tarka Desi Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Olpers', unit: 'pcs' },
  { id: 'md-ol-5', name: 'Dairy Omung Milk 1L', category: 'Milk & Dairy', company: 'Olpers', unit: 'pcs' },
  // TARANG
  { id: 'md-tr-1', name: 'Tarang Tea Whitener 250ml', category: 'Milk & Dairy', company: 'Tarang', unit: 'pcs' },
  { id: 'md-tr-2', name: 'Tarang Tea Whitener Powder sachet', category: 'Milk & Dairy', company: 'Tarang', unit: 'pcs' },
  // HALEEB
  { id: 'md-hl-1', name: 'Haleeb Full Cream Milk 1L', category: 'Milk & Dairy', company: 'Haleeb', unit: 'pcs' },
  { id: 'md-hl-2', name: 'Haleeb Dairy Cream 200ml', category: 'Milk & Dairy', company: 'Haleeb', unit: 'pcs' },
  { id: 'md-hl-3', name: 'Haleeb Asli Desi Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Haleeb', unit: 'pcs' },
  // NURPUR
  { id: 'md-np-1', name: 'Nurpur UHT Milk 1L', category: 'Milk & Dairy', company: 'Nurpur', unit: 'pcs' },
  { id: 'md-np-2', name: 'Nurpur Butter Salted 200g', category: 'Milk & Dairy', company: 'Nurpur', unit: 'pcs' },
  { id: 'md-np-3', name: 'Nurpur Cheddar Cheese 200g', category: 'Milk & Dairy', company: 'Nurpur', unit: 'pcs' },
  // ADAMS
  { id: 'md-ad-1', name: 'Adams Cheddar Cheese 200g', category: 'Milk & Dairy', company: 'Adams', unit: 'pcs' },
  { id: 'md-ad-2', name: 'Adams Mozzarella Cheese 200g', category: 'Milk & Dairy', company: 'Adams', unit: 'pcs' },
  { id: 'md-ad-3', name: 'Adams Desi Ghee 1kg', category: 'Cooking Oil & Ghee', company: 'Adams', unit: 'pcs' },
  { id: 'md-ad-4', name: 'Adams Yogurt 1kg', category: 'Milk & Dairy', company: 'Adams', unit: 'pcs' },
  // GOOD MILK
  { id: 'md-gm-1', name: 'Good Milk 1L UHT', category: 'Milk & Dairy', company: 'Good Milk', unit: 'pcs' },

  // ── QARSHI PRODUCTS ────────────────────────────────────────────────
  { id: 'qa-js-1', name: 'Qarshi Jam-e-Shirin 800ml', category: 'Tea & Beverages', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-js-2', name: 'Qarshi Jam-e-Shirin 1.5L', category: 'Tea & Beverages', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-tp-1', name: 'Qarshi Toothpaste Miswak', category: 'Personal Care', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-wt-1', name: 'Qarshi Spring Water 500ml', category: 'Tea & Beverages', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-wt-2', name: 'Qarshi Spring Water 1.5L', category: 'Tea & Beverages', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-is-1', name: 'Qarshi Ispaghol 50g', category: 'Medical / Basic Health', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-tk-1', name: 'Qarshi Tut-i-Khas 120ml', category: 'Medical / Basic Health', company: 'Qarshi', unit: 'pcs' },
  { id: 'qa-hj-1', name: 'Qarshi Hajmola Tablets', category: 'Medical / Basic Health', company: 'Qarshi', unit: 'pcs' },

  // ── GOURMET PRODUCTS ────────────────────────────────────────────────
  { id: 'go-dr-1', name: 'Gourmet Cola 500ml', category: 'Tea & Beverages', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-dr-2', name: 'Gourmet Cola 1.5L', category: 'Tea & Beverages', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-dr-3', name: 'Gourmet Lemon Up 1.5L', category: 'Tea & Beverages', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-dr-4', name: 'Gourmet Orange 1.5L', category: 'Tea & Beverages', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-bi-1', name: 'Gourmet Butter Cookies', category: 'Biscuits & Snacks', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-bi-2', name: 'Gourmet Nan Khatai', category: 'Biscuits & Snacks', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-bi-3', name: 'Gourmet Rusk 400g', category: 'Biscuits & Snacks', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-bi-4', name: 'Gourmet Bread (Large)', category: 'Biscuits & Snacks', company: 'Gourmet', unit: 'pcs' },
  { id: 'go-mi-1', name: 'Gourmet Milk 1L', category: 'Milk & Dairy', company: 'Gourmet', unit: 'pcs' },

  // ── MEDICAM & ENGLISH (Personal Care) ───────────────────────────────
  { id: 'eg-tp-1', name: 'English Toothpaste Original', category: 'Personal Care', company: 'English', unit: 'pcs' },
  { id: 'eg-tp-2', name: 'English Toothpaste Herbal', category: 'Personal Care', company: 'English', unit: 'pcs' },
  { id: 'eg-fs-1', name: 'English Anti-Lice Shampoo', category: 'Personal Care', company: 'English', unit: 'pcs' },
  { id: 'md-tp-1', name: 'Medicam Toothpaste 100g', category: 'Personal Care', company: 'Medicam', unit: 'pcs' },
  { id: 'md-sh-1', name: 'Medicam Anti-Dandruff Shampoo', category: 'Personal Care', company: 'Medicam', unit: 'pcs' },
  { id: 'md-sp-1', name: 'Medicam Soap (White)', category: 'Personal Care', company: 'Medicam', unit: 'pcs' },
  { id: 'md-pw-1', name: 'Medicam Prickly Heat Powder', category: 'Personal Care', company: 'Medicam', unit: 'pcs' },

  // ── HOUSEHOLD & CLEANING ──────────────────────────────────────────
  { id: 'kt-it-1', name: 'King Tox Insect Killer Spray', category: 'Household Cleaning', company: 'King Tox', unit: 'pcs' },
  { id: 'kt-it-2', name: 'King Tox Mosquito Coil (Classic)', category: 'Household Cleaning', company: 'King Tox', unit: 'pcs' },
  { id: 'kt-it-3', name: 'King Tox Liquid Refill', category: 'Household Cleaning', company: 'King Tox', unit: 'pcs' },
  { id: 'fn-cl-1', name: 'Finis Phenyl 1L', category: 'Household Cleaning', company: 'Finis', unit: 'pcs' },
  { id: 'fn-cl-2', name: 'Finis Ant Killer Powder', category: 'Household Cleaning', company: 'Finis', unit: 'pcs' },
  { id: 'fn-cl-3', name: 'Finis Rat Killer Cake', category: 'Household Cleaning', company: 'Finis', unit: 'pcs' },
  { id: 'kb-sp-1', name: 'Kaba Soap 120g', category: 'Personal Care', company: 'Kaba', unit: 'pcs' },
  { id: 'kb-sp-2', name: 'Kaba Laundry Soap (Yellow)', category: 'Household Cleaning', company: 'Kaba', unit: 'pcs' },

  // ── SHIELD & BABY CARE ──────────────────────────────────────────────
  { id: 'sd-bc-1', name: 'Shield Baby Diaper (Large)', category: 'Personal Care', company: 'Shield', unit: 'ps' },
  { id: 'sd-bc-2', name: 'Shield Baby Wipes 80s', category: 'Personal Care', company: 'Shield', unit: 'pcs' },
  { id: 'sd-bc-3', name: 'Shield Baby Soap', category: 'Personal Care', company: 'Shield', unit: 'pcs' },
  { id: 'sd-bc-4', name: 'Shield Baby Shampoo', category: 'Personal Care', company: 'Shield', unit: 'pcs' },
  { id: 'sd-tb-1', name: 'Shield Toothbrush (Soft)', category: 'Personal Care', company: 'Shield', unit: 'pcs' },

  // ── WBM & MODERN PAKISTANI BRANDS ──────────────────────────────────
  { id: 'wb-sa-1', name: 'WBM Himalayan Pink Salt 800g', category: 'Spices & Masala', company: 'WBM', unit: 'pcs' },
  { id: 'wb-sa-2', name: 'WBM Pink Himalayan Salt Grinder', category: 'Spices & Masala', company: 'WBM', unit: 'pcs' },
  { id: 'wb-pc-1', name: 'WBM Lavender Hand Wash', category: 'Personal Care', company: 'WBM', unit: 'pcs' },
  { id: 'wb-pc-2', name: 'WBM Bamboo Tissues (Box)', category: 'Household Cleaning', company: 'WBM', unit: 'pcs' },

  // ── TIBET & CAPRI (Legacy Brands) ──────────────────────────────────
  { id: 'tb-sn-1', name: 'Tibet Snow Cream 50g', category: 'Personal Care', company: 'Tibet', unit: 'pcs' },
  { id: 'tb-sp-1', name: 'Tibet Soap (Classic)', category: 'Personal Care', company: 'Tibet', unit: 'pcs' },
  { id: 'cp-sp-1', name: 'Capri Soap 125g', category: 'Personal Care', company: 'Capri', unit: 'pcs' },
  { id: 'ba-sh-1', name: 'Bio Amla Shampoo 200ml', category: 'Personal Care', company: 'Bio Amla', unit: 'pcs' },
  { id: 'ba-sh-2', name: 'Bio Amla Shampoo Sachet', category: 'Personal Care', company: 'Bio Amla', unit: 'pcs' },

  // ── SNACKS & CANDIES (More) ────────────────────────────────────────
  { id: 'sa-sn-1', name: 'Sams Potato Sticks', category: 'Biscuits & Snacks', company: 'Sams', unit: 'pcs' },
  { id: 'sa-sn-2', name: 'Sams Kurkure Style Snacks', category: 'Biscuits & Snacks', company: 'Sams', unit: 'pcs' },
];






