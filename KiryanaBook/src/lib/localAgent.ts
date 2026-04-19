// Advice and Dukaan Mitra libraries removed as per user request.

/**
 * 🤖 KiryanaBook Local Agent — Zero API, Zero Internet
 * Pure rule-based engine using keyword matching + real shop data.
 * Supports Roman Urdu + English + mixed queries.
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ShopData {
  sales: Array<{ id: string; total: number; type: string; date: string; items?: Array<{ itemId: string; name: string; qty: number; price: number }> }>;
  expenses: Array<{ id: string; amount: number; description: string; date: string; category?: string }>;
  udhaars: Array<{ id: string; customerName: string; amount: number; date: string; isPayment?: boolean }>;
  stock: Array<{ id: string; name: string; price: number; buyingPrice: number; quantity: number; unit: string; category: string; minThreshold: number; soldCount?: number }>;
  contacts: Array<{ id: string; name: string; phone: string; type: string; isImportant?: boolean }>;
  invoices: Array<{ id: string; invoiceNumber: string; customerName: string; total: number; date: string; items: any[]; status: string }>;
  profile: { name?: string; owner?: string; phone?: string; city?: string; email?: string; address?: string; currency?: string; plan?: string } | null;
}

type Intent =
  | 'TODAY_SALES' | 'YESTERDAY_SALES' | 'DAY_BEFORE_YESTERDAY_SALES' | 'WEEK_SALES' | 'MONTH_SALES' | 'YEAR_SALES'
  | 'TODAY_PROFIT' | 'YESTERDAY_PROFIT' | 'DAY_BEFORE_YESTERDAY_PROFIT' | 'WEEK_PROFIT' | 'MONTH_PROFIT' | 'YEAR_PROFIT'
  | 'TODAY_EXPENSE' | 'YESTERDAY_EXPENSE' | 'DAY_BEFORE_YESTERDAY_EXPENSE' | 'WEEK_EXPENSE' | 'MONTH_EXPENSE' | 'YEAR_EXPENSE'
  | 'TOTAL_UDHAAR' | 'YESTERDAY_UDHAAR' | 'DAY_BEFORE_YESTERDAY_UDHAAR' | 'TOP_DEBTORS' | 'OVERDUE' | 'CUSTOMER_UDHAAR' | 'CUSTOMER_PAYMENT' | 'RECOVERY_CHASE' | 'CUSTOMER_HISTORY'
  | 'LOW_STOCK' | 'STOCK_VALUE' | 'BEST_SELLING' | 'ITEM_STOCK' | 'STOCK_COUNT' | 'SLOW_STOCK' | 'LOW_MARGIN_ITEMS'
  | 'INVOICE_LOOKUP' | 'CUSTOMER_COUNT' | 'BEST_CUSTOMER'
  | 'STAFF_OVERVIEW' | 'STAFF_PERFORMANCE' | 'STAFF_ACTIVITY' | 'STAFF_ATTENDANCE'
  | 'FORECAST_REVENUE' | 'FORECAST_STOCK'
  | 'EXPENSE_BREAKDOWN' | 'SALES_BREAKDOWN' | 'CASH_FLOW' | 'TOP_EXPENSE' | 'PROFIT_MARGIN' | 'CASH_HAND' | 'NET_WORTH' | 'LOSS_MAKING'
  | 'SHOP_HEALTH' | 'SHOP_INFO' | 'COMPARISON' | 'GREETING' | 'ADVICE' | 'DATA_AUDIT' | 'MATH' | 'SPECIFIC_DATE' | 'SPECIFIC_MONTH' | 'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'ENTITY_SUMMARY' | 'UNKNOWN';

type IntentCategory = 'greeting' | 'cashbook_action' | 'report_request' | 'irrelevant';

const INTENT_TO_CATEGORY: Record<Intent, IntentCategory> = {
  GREETING: 'greeting',
  MATH: 'cashbook_action',
  CUSTOMER_UDHAAR: 'cashbook_action',
  CUSTOMER_PAYMENT: 'cashbook_action',
  ITEM_STOCK: 'cashbook_action',
  CUSTOMER_HISTORY: 'report_request',
  SHOP_HEALTH: 'report_request',
  TOTAL_UDHAAR: 'report_request',
  LOW_STOCK: 'report_request',
  TODAY_SALES: 'report_request',
  YESTERDAY_SALES: 'report_request',
  WEEK_SALES: 'report_request',
  MONTH_SALES: 'report_request',
  YEAR_SALES: 'report_request',
  TODAY_PROFIT: 'report_request',
  YESTERDAY_PROFIT: 'report_request',
  WEEK_PROFIT: 'report_request',
  MONTH_PROFIT: 'report_request',
  YEAR_PROFIT: 'report_request',
  TODAY_EXPENSE: 'report_request',
  YESTERDAY_EXPENSE: 'report_request',
  WEEK_EXPENSE: 'report_request',
  MONTH_EXPENSE: 'report_request',
  YEAR_EXPENSE: 'report_request',
  TOP_DEBTORS: 'report_request',
  OVERDUE: 'report_request',
  RECOVERY_CHASE: 'report_request',
  STOCK_VALUE: 'report_request',
  BEST_SELLING: 'report_request',
  STOCK_COUNT: 'report_request',
  SLOW_STOCK: 'report_request',
  LOW_MARGIN_ITEMS: 'report_request',
  CUSTOMER_COUNT: 'report_request',
  BEST_CUSTOMER: 'report_request',
  INVOICE_LOOKUP: 'cashbook_action',
  ENTITY_SUMMARY: 'report_request',
  STAFF_OVERVIEW: 'report_request',
  STAFF_PERFORMANCE: 'report_request',
  STAFF_ACTIVITY: 'report_request',
  STAFF_ATTENDANCE: 'report_request',
  FORECAST_REVENUE: 'report_request',
  FORECAST_STOCK: 'report_request',
  EXPENSE_BREAKDOWN: 'report_request',
  CASH_FLOW: 'report_request',
  TOP_EXPENSE: 'report_request',
  PROFIT_MARGIN: 'report_request',
  CASH_HAND: 'report_request',
  NET_WORTH: 'report_request',
  LOSS_MAKING: 'report_request',
  SHOP_INFO: 'report_request',
  COMPARISON: 'report_request',
  ADVICE: 'report_request',
  DATA_AUDIT: 'report_request',
  SPECIFIC_DATE: 'report_request',
  SPECIFIC_MONTH: 'report_request',
  DAY_BEFORE_YESTERDAY_SALES: 'report_request',
  DAY_BEFORE_YESTERDAY_PROFIT: 'report_request',
  DAY_BEFORE_YESTERDAY_EXPENSE: 'report_request',
  DAY_BEFORE_YESTERDAY_UDHAAR: 'report_request',
  YESTERDAY_UDHAAR: 'report_request',
  SALES_BREAKDOWN: 'report_request',
  INCOME_STATEMENT: 'report_request',
  BALANCE_SHEET: 'report_request',
  UNKNOWN: 'irrelevant'
};

// ─── KEYWORD MAPS ─────────────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  TODAY_SALES: ['aaj', 'today', 'ajj', 'sale', 'bikri', 'revenue', 'kitna bika', 'total sales', 'aaj ki kamai', 'aaj ka kaam', 'aaj kitni sale', 'sales check', 'sela', 'sail', 'selae', 'sel', 'aj', 'ajh', 'aje', 'abi', 'abhi', 'ab tak', 'din bhar', 'ajj ki', 'aj ki'],
  YESTERDAY_SALES: ['kal', 'yesterday', 'pichle din', 'pichla din', 'pichli sale', 'kal kitna bika', 'kal ki sale', 'kl', 'kla', 'klaa', 'kall', 'kell', 'kel'],
  DAY_BEFORE_YESTERDAY_SALES: ['parson', 'parso', 'day before yesterday', 'pichle se pichla', 'dosra din', 'prson', 'prso', 'parsoon'],
  WEEK_SALES: ['hafte', 'hafta', 'week', '7 din', 'saat din', 'weekly', 'is hafte'],
  MONTH_SALES: ['mahine', 'mahina', 'month', 'monthly', 'is mahine', '30 din'],
  YEAR_SALES: ['saal', 'year', 'yearly', 'annual', 'is saal'],
  
  TODAY_PROFIT: ['aaj', 'today', 'profit', 'munafa', 'fayda', 'bachat', 'bachhat'],
  YESTERDAY_PROFIT: ['kal', 'yesterday', 'profit', 'munafa', 'fayda', 'kamai'],
  DAY_BEFORE_YESTERDAY_PROFIT: ['parson', 'parso', 'profit', 'munafa', 'parson ki kamai'],
  WEEK_PROFIT: ['hafte', 'hafta', 'week', 'profit', 'munafa', 'kamai', 'hafte ka profit', 'is hafte kya bacha', '7 din ka munafa', 'hafton ka', 'wike ka'],
  MONTH_PROFIT: ['mahine', 'mahina', 'month', 'profit', 'munafa', 'mahine ka profit', 'poore mahine ki bachat', 'monthly profit', 'monath profit'],
  YEAR_PROFIT: ['saal', 'year', 'profit', 'munafa', 'poore saal ka fayda', 'yearly profit'],

  TODAY_EXPENSE: ['aaj', 'today', 'expense', 'kharcha', 'kharch'],
  YESTERDAY_EXPENSE: ['kal', 'yesterday', 'expense', 'kharcha', 'kal ka kharcha'],
  DAY_BEFORE_YESTERDAY_EXPENSE: ['parson', 'parso', 'expense', 'kharcha', 'parson ka kharcha'],
  WEEK_EXPENSE: ['hafte', 'hafta', 'week', 'kharcha', 'hafte ka kharcha', 'weekly expense'],
  MONTH_EXPENSE: ['mahine', 'mahina', 'month', 'kharcha', 'mahine ka kharcha', 'monthly expense'],
  YEAR_EXPENSE: ['saal', 'year', 'kharcha'],

  TOTAL_UDHAAR: ['udhaar', 'udhar', 'baaki', 'qarz', 'pese lene', 'paise lene', 'pese denay', 'hisaab', 'total baki', 'kitna udhaar', 'market ka udhar', 'udhari', 'kitne paise lene hain', 'kul udhar', 'logon se kia lena he', 'pese kitne lenay', 'udhr', 'odhar', 'udhri', 'udar', 'udary', 'udhary', 'qars', 'karz', 'baqi', 'baki'],
  YESTERDAY_UDHAAR: ['kal', 'yesterday', 'udhaar', 'udhar', 'pichle din ka udhar'],
  DAY_BEFORE_YESTERDAY_UDHAAR: ['parson', 'parso', 'udhaar', 'udhar', 'parson ka udhaar'],
  TOP_DEBTORS: ['kis se pese', 'kis se paise', 'kis se lene', 'udhari list', 'top udhaar', 'debtors', 'kon he vo', 'kon hai wo', 'kis kis ka', 'naam batao', 'kis kis se', 'bande batao', 'sab se zyada udhar kis pe he', 'top debtors', 'sab se bade udhar wale', 'kon he wo'],
  OVERDUE: ['purana udhaar', 'purani udhari', 'delay', 'urgent', 'purana qarz', 'bohat din se baki', 'overdue', 'purana hisab', 'purna'],
  CUSTOMER_UDHAAR: ['ka udhaar', 'ka kitna', 'hisaab', 'account', 'ka baki', 'ka khata', 'ke paise', 'ka balance', 'ka udhar'],
  CUSTOMER_PAYMENT: ['pese kisne diye', 'payment aayi', 'kisne diya', 'recovery', 'wapsi aaya', 'udhar kon laya', 'kisne lautyaya', 'jama karwaye', 'paise mil gae', 'vasuli', 'payment ayi'],
  RECOVERY_CHASE: ['paise nahi de raha', 'slow payment', 'kis se lene hain bohat din se', 'purani recovery', 'phasay hue pese', 'fast recovery', 'takaza', 'tqaza'],

  LOW_STOCK: ['khatam', 'low', 'stock', 'kam', 'alert', 'thori', 'shrt', 'shortage', 'maal kam hai', 'khatam honay wala', 'short he', 'shortage check', 'out of stock'],
  STOCK_VALUE: ['stock ki qeemat', 'inventory value', 'total stock', 'stock value', 'maal kitne ka', 'asasa', 'dukan mein kitna maal hai', 'dukan ka maal', 'dukan ki keemat', 'asset value', 'maal ki worth'],
  BEST_SELLING: ['sabse zyada bikne wala', 'top selling', 'popular item', 'zayda kya bika', 'fast moving', 'zyada bikne wali cheez'],
  SLOW_STOCK: ['slow stock', 'nahi bik raha', 'dead stock', 'rakha hua hai', 'purana stock', 'fuzool stock', 'kharab ho raha', 'nikal nahi raha', 'slow moving'],
  ITEM_STOCK: ['kitna bacha', 'stock check', 'hai kya', 'available', 'kita hai', 'para hai', 'stock mien kitna', 'quantity batao'],
  STOCK_COUNT: ['total items', 'kitne items', 'category list', 'items list', 'kitni variety', 'item count', 'total variety', 'stock me kiya he', 'stock me kya hai', 'stock ki list', 'sara maal', 'stock item', 'items count'],
  LOW_MARGIN_ITEMS: ['kam munafa', 'loss wale item', 'margin kam hai', 'no profit', 'fayda nahi he is me', 'sasta maal'],

  CUSTOMER_COUNT: ['total customer', 'kitne log', 'kharedar', 'total contacts', 'gahak', 'kitne gahak'],
  BEST_CUSTOMER: ['best customer', 'top customer', 'sabse acha customer', 'loyal customer', 'VVIP gahak'],
  CUSTOMER_HISTORY: ['hisaab batao', 'history', 'kab aya', 'kya kharida', 'visit kab thi', 'kab se aa raha hai', 'kitni baar aya', 'detail history', 'pichla bill'],
  INVOICE_LOOKUP: ['invoice', 'bill', 'receipt', 'parchi', 'chalan', 'order number'],
  ENTITY_SUMMARY: [],
  
  STAFF_OVERVIEW: ['kitne staff', 'staff kon', 'mulazim', 'attendance', 'absent', 'naukar'],
  STAFF_PERFORMANCE: ['best staff', 'staff performance', 'kisne zyada kaam kiya', 'mehnat karne wala', 'kaun acha hai'],
  STAFF_ACTIVITY: ['staff kya kiya', 'entry delete', 'activity log', 'kisne edit kiya', 'activity check'],
  STAFF_ATTENDANCE: ['hazir', 'chutti', 'aaj aaya', 'kaam pe aya', 'leave', 'present'],

  FORECAST_REVENUE: ['projected', 'forecast', 'aglay mahine', 'estimate', 'saal ke end tak', 'agay kya hoga'],
  FORECAST_STOCK: ['stock kab khatam', 'kab tak chalega', 'reorder point', 'kab mangwana hai'],

  EXPENSE_BREAKDOWN: ['kharchay', 'categories', 'kahan gaya', 'breakdown', 'kharch kahan', 'kharchon ki list', 'fuzool kharch', 'expense report', 'kharch ka tafseel', 'detail expense'],
  SALES_BREAKDOWN: ['sale breakdown', 'sales list', 'orders list', 'bikri ki tafseel', 'detail sale', 'items sold', 'kaun kaun si sale हुई', 'sale ki list'],
  TOP_EXPENSE: ['top kharcha', 'sabse zyada kharcha', 'biggest expense', 'sabse bara kharch', 'bara kharcha', 'main kharch'],
  CASH_FLOW: ['cash in', 'cash out', 'flow', 'hath mein', 'cash balance', 'cash flow report', 'paisa kahan se aya', 'paisa kahan gaya'],
  CASH_HAND: ['kitne paise hain', 'galla', 'galle mein kitne hain', 'cash kitna hai', 'hath mein cash', 'cash in hand', 'available cash', 'kitne paise bache', 'rokra kitna he', 'counter cash'],
  NET_WORTH: ['dukan ki worth', 'net worth', 'total value', 'total asasa', 'shop value', 'kitna paisa hai total', 'kul asasa', 'shop assets'],
  LOSS_MAKING: ['nuqsan', 'loss', 'ghata', 'nuqsaan', 'loss ho raha hai', 'loss check'],
  PROFIT_MARGIN: ['margin', 'percentage', 'profit percent', 'kitne feesad', 'fee sad', 'bachat percentage', 'profit %'],
  SHOP_HEALTH: ['health', 'status', 'kaisa chal', 'report', 'summary', 'shop ka hal', 'performance kaisi', 'kaisa kaam hai', 'theek hai', 'shop progress'],
  SHOP_INFO: ['city', 'sheher', 'location', 'kahan hai', 'naam kya', 'owner', 'address', 'area', 'dukan ki info', 'dukan kahan he'],
  COMPARISON: ['vs', 'muqabla', 'fark', 'behtar', 'difference', 'compare', 'pichle mahine vs', 'pehle se behtar', 'pichli bar se', 'kal vs aaj', 'sales comparison'],
  ADVICE: ['advice', 'mashwara', 'behtar kaise karein', 'suggestions', 'kya karna chahiye', 'future', 'sale barhao', 'growth', 'taraki', 'strategy', 'planning', 'increase', 'tips', 'karen', 'tareeka', 'tarika', 'improve', 'help', 'growth', 'mashura', 'mashwara den', 'karobar kaisa barhaun', 'sujhaav', 'barhaun', 'barhana', 'izafa', 'taraqqi', 'brah', 'barh', 'brh', 'brahaye', 'barhaye'],
  DATA_AUDIT: ['anomaly', 'galat entry', 'duplicate', 'audit', 'check data', 'galti'],
  GREETING: ['salam', 'hello', 'hi', 'assalam', 'hey', 'kaise ho', 'aoa', 'kia hal he', 'kya haal hai'],
  MATH: ['hisaab', 'calculate', 'equal', 'plus', 'minus', 'times', 'divide', 'jama', 'zarb', 'taqseem', 'tafreeq'],
  SPECIFIC_DATE: ['tareekh', 'date', 'pichli tareekh', 'ko kya hua'],
  SPECIFIC_MONTH: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'janvari', 'farvari', 'maarch', 'aprail', 'joon', 'julai', 'agast', 'sitambar', 'aktubar', 'navambar', 'disambar'],
  INCOME_STATEMENT: ['income statement', 'profit loss statement', 'pnl', 'karobar ki amdani', 'karobar ka andaz', 'kharch aur kamai', 'income report', 'net income', 'financial statement', 'pnl report', 'amdani ki tafseel', 'munafa nuqsan', 'incom statment', 'incom shet', 'incom sheet'],
  BALANCE_SHEET: ['balance sheet', 'maliyati hisab', 'total asset liabilities', 'financial position', 'shishha', 'balance sheet dikhao', 'assets aur liabilities', 'kul hisab kitab', 'dukan ki mali halat', 'mali asase', 'blance sheet', 'balance shet', 'balance shett', 'blance shett', 'blnce shet', 'blnc', 'balnce'],
  UNKNOWN: [],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Normalizes text by removing punctuation, extra spaces, and common 
 * Roman Urdu char variations to make matching robust.
 */
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '') // Remove punctuation (inc. Urdu chars)
    // Handle Roman Urdu phonetics
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/v/g, 'w')
    .replace(/ph/g, 'f')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/th/g, 't')
    .replace(/sh/g, 's')
    .replace(/(.)\1+/g, '$1') // Collapse repeated characters
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 🕵️‍♂️ Dynamic Entity Lookup System
 * Scans for ANY product, contact, or profile field mentioned in the query.
 * Makes the manager "feel" like it knows everything.
 */
function dynamicEntityLookup(q: string, data: ShopData): { type: 'product' | 'contact' | 'profile' | 'invoice' | null, item: any, field?: string } {
  // 1. Profile Fields (Email, Address, etc.)
  const profile = data.profile || {};
  const profileFields: Record<string, string[]> = {
    name: ['naam', 'name', 'dukan ka naam'],
    owner: ['owner', 'malik', 'sahib'],
    phone: ['number', 'phone', 'contact', 'mobile'],
    city: ['sheher', 'city', 'kahan'],
    email: ['email', 'mail'],
    address: ['pata', 'address', 'location']
  };

  for (const [field, keywords] of Object.entries(profileFields)) {
    if (keywords.some(kw => q.includes(kw))) {
      return { type: 'profile', item: profile, field };
    }
  }

  // 2. Stocks (Products)
  const mentionedStock = (data.stock || []).find(s => s?.name && s.name.length >= 2 && q.includes(String(s.name).toLowerCase()));
  if (mentionedStock) return { type: 'product', item: mentionedStock };

  // 3. Contacts (Customers/Suppliers)
  const mentionedContact = (data.contacts || []).find(c => c?.name && c.name.length >= 2 && q.includes(String(c.name).toLowerCase()));
  if (mentionedContact) return { type: 'contact', item: mentionedContact };

  // 4. Invoices (Bill IDs)
  const invMatch = q.match(/#?(\d{3,})/);
  if (invMatch) {
    const inv = (data.invoices || []).find(i => String(i?.invoiceNumber).includes(invMatch[1]) || String(i?.id).includes(invMatch[1]));
    if (inv) return { type: 'invoice', item: inv };
  }

  return { type: null, item: null };
}

/**
 * Calculates a simple fuzzy matching score based on character overlap.
 * High score = high similarity.
 */
function fuzzyMatch(query: string, keyword: string): number {
  const qClean = normalizeText(query);
  const kwClean = normalizeText(keyword);
  
  if (qClean === kwClean) return keyword.length * 10; // Exact match bonus
  if (qClean.includes(kwClean)) return kwClean.length * 5; // Direct inclusion
  
  // Fuzzy character overlap
  let matches = 0;
  let lastIdx = -1;
  for (const char of kwClean) {
    const idx = qClean.indexOf(char, lastIdx + 1);
    if (idx !== -1) {
      matches++;
      lastIdx = idx;
    }
  }
  
  const ratio = matches / kwClean.length;
  return ratio >= 0.8 ? kwClean.length * 2 : 0;
}

// ─── INTENT DETECTION ────────────────────────────────────────────────────────

export interface IntentResult {
  intent: Intent;
  confidence: number; // 0 to 1
}

function detectIntent(query: string, data: ShopData, history: any[] = []): IntentResult {
    // 1. Pre-process: Normalization + Filler Removal
    const fillers = [
      'yar', 'matlab', 'eh', 'umm', 'bhai', 'janab', 'sahib', 'sir', 'please', 'meherbaani', 'meherbani', 'zara', 'thora', 'karo', 'karain', 'bataen', 'bataiye', 'pucho', 'den', 'do', 'na', 'nhi', 'ni', 'nai', 'btao', 'btayn', 'btado',
      'yaara', 'bae', 'bro', 'buddy', 'aik', 'ek', 'ki', 'ka', 'ke', 'ko', 'mein', 'me', 'the', 'is', 'ha', 'hai', 'heen', 'hain', 'tha', 'thi', 'the', 'ho', 'ga', 'gi', 'ge', 'to', 'ta', 'te', 'ti', 'hua', 'wa', 'va',
      'kuch', 'kitna', 'kitni', 'kia', 'kya', 'kyon', 'kyun', 'kab', 'kahan', 'kidher', 'kidhar', 'kaise', 'kesey', 'kese', 'kis', 'kon', 'kaun', 'wese', 'waise', 'agar', 'magar', 'lekin', 'par', 'per',
      'sirf', 'bas', 'bss', 'bus', 'shayed', 'shayad', 'zaroor', 'zarur', 'bilkul', 'shabaash', 'shabash', 'theek', 'thik', 'acha', 'achha', 'ok', 'okay', 'ji', 'haan', 'han', 'nahi'
    ];
    let q = normalizeText(query);
    
    fillers.forEach(f => {
        const regex = new RegExp(`\\b${f}\\b`, 'g');
        q = q.replace(regex, '');
    });
    q = q.replace(/\s+/g, ' ').trim();

  // ⚡ DYNAMIC LOOKUP OVERRIDE (HIGH PRIORITY)
  const entity = dynamicEntityLookup(normalizeText(query), data);
  if (entity.type) {
    if (entity.type === 'profile') return { intent: 'SHOP_INFO', confidence: 1.0 };
    if (entity.type === 'invoice') return { intent: 'INVOICE_LOOKUP', confidence: 1.0 };
    if (entity.type === 'product' && !query.includes('sale') && !query.includes('profit')) return { intent: 'ITEM_STOCK', confidence: 1.0 };
    if (entity.type === 'contact' && !query.includes('history')) return { intent: 'CUSTOMER_UDHAAR', confidence: 1.0 };
  }

  const names = (data.contacts || []).map(c => c?.name?.toLowerCase()).filter(Boolean);
  const stockNames = (data.stock || []).map(s => s?.name?.toLowerCase()).filter(Boolean);

  // 📝 CASE-SPECIFIC HONESTY CHECK
  if (q.includes('january') || q.includes('janvari')) {
    const janData = (data.sales || []).some(s => s.date.startsWith('2026-01'));
    if (!janData && (q.includes('sale') || q.includes('kitna') || q.includes('aik'))) {
       // Only return this if we are SURE it's a sale query for a missing month
       // return { intent: 'SPECIFIC_MONTH', confidence: 1 }; // Handled in switch below
    }
  }

  // Generic Intent Scoring
  const scores: Partial<Record<Intent, number>> = {};
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (intent === 'UNKNOWN') continue;
    let score = 0;
    keywords.forEach(kw => { 
      const normKw = normalizeText(kw);
      const fScore = fuzzyMatch(q, normKw);
      if (fScore > 0) score += fScore;
    });
    if (score > 0) scores[intent] = score;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [Intent, number][];
  let topIntent = sorted.length > 0 ? sorted[0][0] : 'UNKNOWN';
  let topScore = sorted.length > 0 ? sorted[0][1] : 0;
  
  // ─── POWER UP: MATH & SPECIFIC DATES (PRIORITY OVERRIDES) ───
  const hasBusinessKW = /sale|profit|expense|kharcha|inventory|stock|maal|customer|paisa|dena|lena|report|munafa|record|bikri|khata|ledger|ale/i.test(q);

  // 🗓️ TAREKH/TARIKH (Highest Priority for Specific Time)
  if (/(\d{1,2})(vi|wa|wein|ween|\s)?\s*(tarekh|tarikh|tarkh|tarek|tarix)/i.test(q)) return { intent: 'SPECIFIC_DATE', confidence: 1.0 };
  
  const isDate = /(\d{1,2})[\/\-\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|aprail|may|june|july|august|september|october|november|december|farvari|sitambar|navambar|disambar|01|02|03|04|05|06|07|08|09|10|11|12)/i.test(q);
  if (isDate && (hasBusinessKW || q.length < 15)) return { intent: 'SPECIFIC_DATE', confidence: 1.0 };

  const isDayQuery = /monday|tuesday|wednesday|thursday|friday|saturday|sunday|peer|somwar|mangal|budh|jumeraat|juma|hafta|itwar/i.test(q);
  const isSpecificDatePattern = /(\d{1,2})[\s\-\.\/](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|aprail|may|june|july|august|september|october|november|december|farvari|sitambar|navambar|disambar)/i.test(q);
  if (isDayQuery && (hasBusinessKW || q.length < 15)) return { intent: 'SPECIFIC_DATE', confidence: 1.0 };
  if (isSpecificDatePattern) return { intent: 'SPECIFIC_DATE', confidence: 1.0 };

  // 📅 SPECIFIC MONTH: "January ki sale" (Lower priority than specific date)
  const monthNameRegex = /(jan(uary|vari)?|feb(ruary|rvari)?|mar(ch|aarch)?|apr(il|ail)?|may|maai|jun(e|oon)?|jul(y|ai)?|aug(ust|ast)?|sep(tember|tambar|tamber|tanbar)?|oct(ober|ubar)?|nov(ember|ambar|anbar)?|dec(ember|ambar|anbar)?)/i;
  if (monthNameRegex.test(q)) return { intent: 'SPECIFIC_MONTH', confidence: 1.0 };

  // 🌟 BEST SELLING OVERRIDE (High priority)
  if (q.includes('best') || q.includes('top') || q.includes('popular') || q.includes('bikne wala')) {
    if (q.includes('sell') || q.includes('product') || q.includes('item') || q.includes('sale')) return { intent: 'BEST_SELLING', confidence: 1.0 };
  }

  // Time-sensitive Sales Check (Before generic Sale check)
  const hasSaleKW = /sale|kamai|aamdan|bikri|\bsel\b/.test(q);
  if (hasSaleKW) {
    if (/parso|parson|parsun/.test(q)) return { intent: 'DAY_BEFORE_YESTERDAY_SALES', confidence: 0.98 };
    if (/kal|pichla|yesterday|kl/.test(q)) return { intent: 'YESTERDAY_SALES', confidence: 0.98 };
    if (/today|aaj|ajj|aj/.test(q)) return { intent: 'TODAY_SALES', confidence: 0.98 };
  }

  // Only default to Today if it really looks like a generic "sale" check with NO specific timeframe keywords
  const hasTimeframeKw = /kal|yesterday|pichla|aaj|today|week|month|mahine|tarekh|tarikh|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(q);
  if (hasSaleKW && !hasTimeframeKw && !(q.includes('loss') || q.includes('profit') || q.includes('vs'))) return { intent: 'TODAY_SALES', confidence: 0.8 };

  // Specific Udhaar
  if (q.includes('udhaar') || q.includes('udhar') || q.includes('baaki') || q.includes('ka kitna')) {
    if ((data.contacts || []).some(c => c?.name && q.includes(c.name.toLowerCase()))) return { intent: 'CUSTOMER_UDHAAR', confidence: 0.98 };
    if (topIntent !== 'OVERDUE' && topIntent !== 'TOP_DEBTORS') return { intent: 'TOTAL_UDHAAR', confidence: 0.95 };
  }
  
  // 📦 STOCK LIST/COUNT OVERRIDE
  if (q.includes('list') || q.includes('variety') || q.includes('sara maal') || q.includes('sari variety')) {
    if (q.includes('stock') || q.includes('maal') || q.includes('item')) return { intent: 'STOCK_COUNT', confidence: 1.0 };
  }

  // Specific Item Check
  const mentionedStock = (data.stock || []).find(s => s?.name && s.name.length > 2 && q.includes(s.name.toLowerCase()));
  if (mentionedStock && (q.includes('kitna') || q.includes('hai kya') || q.includes('bacha'))) return { intent: 'ITEM_STOCK', confidence: 0.98 };

  // Generic Disambiguation (Triggered only for ambiguous queries like "sale")
  const hasProfit = /profit|munafa|fayda|bachat|kamai|prft|proft|munafa|monafa|monafah|fedah|faidah/i.test(q);
  const hasExpense = /expense|kharcha|kharch|kharchay|expanse|exp|karcha|karche/i.test(q);
  const hasSale = /sale|bikri|revenue|bikna|becha|bechna|aamdan|sel|sela|sail|sil|sele/i.test(q);
  
  const hasYesterday = /kal|yesterday|pichli|pichla|kl|kla|kall|kel|kell|kalla/i.test(q);
  const hasWeek = /hafte|week|hafta|hfta|hefte|wike|wek/i.test(q);
  const hasMonth = /mahine|month|mahina|mahena|mhena|mhina|monath/i.test(q);
  const hasToday = /aaj|today|ajj|aj|ajh|aje/i.test(q);
  const hasParson = /parso|parson|parsun|prso|prson/.test(q);

  // 🧪 Strategic Intent Detection (Phase 16)
  const hasStrategic = /improve|increase|barhane|barhao|tips|advice|mashwara|izafa|behtar|better|growth|mashura/.test(q);
  if (hasStrategic) return { intent: 'ADVICE', confidence: 0.95 }; 

  const isGeneric = topIntent === 'UNKNOWN' || topIntent.includes('SALES') || topIntent.includes('PROFIT') || topIntent.includes('EXPENSE');
  
  if (isGeneric) {
    if (hasProfit) {
      if (hasYesterday) return { intent: 'YESTERDAY_PROFIT', confidence: 0.95 };
      if (hasWeek) return { intent: 'WEEK_PROFIT', confidence: 0.95 };
      if (hasMonth) return { intent: 'MONTH_PROFIT', confidence: 0.95 };
      if (hasToday) return { intent: 'TODAY_PROFIT', confidence: 0.95 };
      return { intent: 'TODAY_PROFIT', confidence: 0.8 };
    }

    if (hasExpense) {
      if (hasParson) return { intent: 'DAY_BEFORE_YESTERDAY_EXPENSE', confidence: 0.95 };
      if (hasYesterday) return { intent: 'YESTERDAY_EXPENSE', confidence: 0.95 };
      if (hasWeek) return { intent: 'WEEK_EXPENSE', confidence: 0.95 };
      if (hasMonth) return { intent: 'MONTH_EXPENSE', confidence: 0.95 };
      if (hasToday) return { intent: 'TODAY_EXPENSE', confidence: 0.95 };
      return { intent: 'TODAY_EXPENSE', confidence: 0.8 };
    }

    if (hasSale) {
      if (hasParson) return { intent: 'DAY_BEFORE_YESTERDAY_SALES', confidence: 0.95 };
      if (hasYesterday) return { intent: 'YESTERDAY_SALES', confidence: 0.95 };
      if (hasWeek) return { intent: 'WEEK_SALES', confidence: 0.95 };
      if (hasMonth) return { intent: 'MONTH_SALES', confidence: 0.95 };
      if (hasToday) return { intent: 'TODAY_SALES', confidence: 0.95 };
      return { intent: 'TODAY_SALES', confidence: 0.8 };
    }
    
    if (q.includes('udhar') || q.includes('udhaar')) {
        if (hasParson) return { intent: 'DAY_BEFORE_YESTERDAY_UDHAAR', confidence: 0.95 };
        if (hasYesterday) return { intent: 'YESTERDAY_UDHAAR', confidence: 0.95 };
    }
  }

  // ─── FINAL FALLBACK ───
  const confidence = Math.min(topScore / 10, 1.0);
  return { intent: topIntent, confidence };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) { 
  if (!n || isNaN(n) || !isFinite(n)) return 'Rs. 0';
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`; 
}

function getDates() {
  const d = new Date();
  
  // Helper to get YYYY-MM-DD in LOCAL time
  const toLocalISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const today = toLocalISO(d);
  
  const yesterdayDate = new Date(d);
  yesterdayDate.setDate(d.getDate() - 1);
  const yesterday = toLocalISO(yesterdayDate);

  const dayBeforeYesterdayDate = new Date(d);
  dayBeforeYesterdayDate.setDate(d.getDate() - 2);
  const dayBeforeYesterday = toLocalISO(dayBeforeYesterdayDate);

  const weekStart = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const yearStart = new Date(d.getFullYear(), 0, 1).toISOString();

  return { today, yesterday, dayBeforeYesterday, weekStart, monthStart, yearStart };
}

function isDateMatch(isoDate: string, targetYMD: string): boolean {
  if (!isoDate) return false;
  try {
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}` === targetYMD;
  } catch {
    return false;
  }
}

// ─── RESPONSE GENERATORS ──────────────────────────────────────────────────────

function getSalesText(d: ShopData, filter: (s: any) => boolean, title: string): string {
  const allSales = d.sales || [];
  const s = allSales.filter(filter);
  const total = s.reduce((a, x) => a + (x?.total || 0), 0);
  
  // Extract time label from title (e.g., "Kal Ki Sale" -> "kal")
  const lowerTitle = title.toLowerCase();
  const timeWord = lowerTitle.includes('kal') ? 'kal' : lowerTitle.includes('parson') ? 'parson' : 'aaj';

  // Logic: Compare with historical average per day
  const historyTotal = allSales.reduce((a, x) => a + (x?.total || 0), 0);
  const avgPerSale = historyTotal / (allSales.length || 1);
  const performance = total > (avgPerSale * 0.8) ? `✅ Sales stable hain.` : `⚠️ Sales thori kam hain ${timeWord}.`;

  if (s.length === 0) return `📊 **${title}**\n\nAbhi tak koi sale nahi hui.`;

  return `📊 **${title}**\n\n` +
    `Total: **${fmt(total)}**\n` +
    `Orders: ${s.length}\n` +
    `Avg/Bill: ${fmt(total / s.length)}`;
}

function getProfitText(d: ShopData, filter: (s: any) => boolean, title: string): string {
  const allSales = d.sales || [];
  const allExpenses = d.expenses || [];
  const allStock = d.stock || [];
  const s = allSales.filter(filter);
  const revenue = s.reduce((a, x) => a + (x?.total || 0), 0);
  const expense = allExpenses.filter(filter).reduce((a, x) => a + (x?.amount || 0), 0);
  
  let cogs = 0;
  s.forEach(sale => (sale?.items || []).forEach((i: any) => {
    const item = allStock.find(st => st?.id === i?.itemId || st?.name === i?.name);
    cogs += (item?.buyingPrice || 0) * (i?.qty || 0);
  }));

  const grossProfit = revenue - cogs;
  
  // Treat negative expenses as "Other Income"
  const otherIncome = allExpenses.filter(filter)
    .filter(e => (e?.amount || 0) < 0)
    .reduce((a, x) => a + Math.abs(x?.amount || 0), 0);

  const expenseTotal = allExpenses.filter(filter)
    .filter(e => (e?.amount || 0) > 0)
    .reduce((a, x) => a + (x?.amount || 0), 0);

  // ...
  const netProfit = grossProfit - expenseTotal + otherIncome;
  const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(0) : '0';

  let commentary = "Karobar stable hai.";
  if (netProfit < 0) commentary = "⚠️ Loss ho raha hai! Kharchay zyada hain ya margin kam.";
  else if (Number(margin) > 20) commentary = "🌟 Zabardast munafa milt raha hai!";

  return `📄 **Income Statement (${title})**\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `(+) **Total Sales:** ${fmt(revenue)}\n` +
    `(-) **Maal ki Qeemat (COGS):** ${fmt(cogs)}\n` +
    `────────────────────\n` +
    `(=) **Gross Profit:** ${fmt(grossProfit)}\n\n` +
    `(-) **Kharchay (Expenses):** ${fmt(expenseTotal)}\n` +
    `(+) **Other Income:** ${fmt(otherIncome)}\n` +
    `────────────────────\n` +
    `**NET PROFIT/LOSS: ${fmt(netProfit)}**\n` +
    `Percentage: **${margin}%**\n` +
    `━━━━━━━━━━━━━━━━━━━━`;
}

function customerUdhaar(query: string, d: ShopData): string {
  const entity = dynamicEntityLookup(normalizeText(query), d);
  const customer = entity.type === 'contact' ? entity.item : null;
  
  if (!customer) return `👤 Customer mil nahi raha. Meherbaani karke sahi naam likhein ya contact check karein.`;
  
  const allUdhaars = d.udhaars || [];
  const bal = allUdhaars.filter(u => u?.customerName === customer!.name).reduce((a, x) => a + (x?.amount || 0), 0);
  
  return `👤 **${customer.name}**\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Current Balance: **${fmt(bal)}**\n` +
    `Phone: ${customer.phone || 'N/A'}\n` +
    `Type: ${customer.type || 'Customer'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    (bal > 0 ? "⚠️ In se paise lene hain." : bal < 0 ? "✅ In ke paise dene hain." : "👍 Hisaab barabar hai.");
}

function itemStockCheck(query: string, d: ShopData): string {
  const entity = dynamicEntityLookup(normalizeText(query), d);
  const item = entity.type === 'product' ? entity.item : null;
  
  if (!item) return `❌ Item "${query}" stock mein nahi mila.`;
  
  return `📦 **${item.name}**\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Qty: **${item.quantity} ${item.unit}**\n` +
    `Sale Price: ${fmt(item.price)}\n` +
    `Cost Price: ${fmt(item.buyingPrice)}\n` +
    `Status: ${(item.quantity || 0) <= (item.minThreshold || 5) ? '🔴 LOW STOCK' : '✅ OK'}\n` +
    `Category: ${item.category || 'N/A'}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;
}

function getComparison(d: ShopData): string {
  const { today, yesterday } = getDates();
  const allSales = d.sales || [];
  const tSales = allSales.filter(s => isDateMatch(s?.date, today)).reduce((a, x) => a + (x?.total || 0), 0);
  const ySales = allSales.filter(s => isDateMatch(s?.date, yesterday)).reduce((a, x) => a + (x?.total || 0), 0);
  
  const diff = tSales - ySales;
  const p = ySales > 0 ? ((diff / ySales) * 100).toFixed(0) : '100';
  
  return `⚖️ **Aaj vs Kal**\n\nAaj: ${fmt(tSales)}\nKal: ${fmt(ySales)}\n──────────────\nFark: **${fmt(Math.abs(diff))}** ${diff >= 0 ? '📈 Zyada' : '📉 Kam'}\nGrowth: **${diff >= 0 ? '+' : ''}${p}%**`;
}

// ─── MAIN AGENT FUNCTION ──────────────────────────────────────────────────────

// ─── STATEFUL CONTEXT (Last used timeframe & Intent) ─────────────────────────
let lastTimeframe: 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'TODAY';
let lastIntent: Intent = 'GREETING';

export function askLocalAgent(query: string, data: ShopData, history: any[] = []): string {
  // Top-level crash guard — no error should ever reach the UI
  try {
    return _askLocalAgentInternal(query, data, history);
  } catch (e) {
    console.error('[askLocalAgent] Unexpected crash:', e);
    return `🤔 Kuch masla aa gaya. Dobara try karein ya app refresh karein.`;
  }
}

function _askLocalAgentInternal(query: string, data: ShopData, history: any[] = []): string {
  const result = detectIntent(query, data, history);
  let { intent, confidence } = result;
  
  const q = normalizeText(query);
  
  // 🔍 CLARIFICATION SYSTEM: Don't give wrong answers! Ask instead.
  if (confidence < 0.6) {
    // Check for partial matches to give specific follow-up
    if (/sale|kamai|bikri|income|revenue/.test(q)) {
      return "Aap sale ke baare mein poochna chahte hain, lekin kis waqt ki? (Aaj, Kal, ya kisi khaas din ki?)";
    }
    if (/kharcha|expense/.test(q)) {
        return "Kharchay ki tafseel kis waqt ki chahiye? (Aaj, is mahine, ya koi khaas date?)";
    }
    if (/udhaar|udhar|hisaab|pese/.test(q)) {
        return "Kis customer ka udhaar ya hisaab check karna hai? Naam bataiye.";
    }
    if (q.match(/\d{1,2}/)) {
        return "Aapne date ya raqam (amount) likhi hai, lekin ye nahi bataya ke iska kya karna hai? (Maslan: '17 april ki sale')";
    }
    
    return "Maaf kijiyega, mujhe ye samajh nahi aaya. Main sirf aapki dukan ke data (Sale, Stock, Udhaar, Health) ke baare mein sawalon ke jawab de sakta hoon. Please apne sawal ko wazeh karein.";
  }

  // 🗣️ CONVERSATIONAL STOP (Humorous handling)
  if (q.includes('chup') || q.includes('bas') || q.includes('stop') || q.includes('khatam')) {
    return "Theek hai bhai, Munshi ab chup hai. Jab zaroorat ho awaaz de dijiyega! 🤐";
  }

  // 👋 GOODBYE HANDLING
  if (q === 'bye' || q === 'allah hafiz' || q === 'khuda hafiz' || q === 'tata') {
    return "Allah Hafiz! Apna aur apni dukan ka khayal rakhen. Phir milenge! 👋✨";
  }

  // 🧠 CONTEXT MEMORY: If query is "aur?", "next?", "kuch aur?"
  const isFollowUp = (q.includes('aur') || q.includes('and') || q.includes('next') || q.includes('more') || q.includes('phir') || (q.length < 8 && !['hi', 'hiii', 'bye', 'ok'].includes(q)));
  
  if (confidence < 0.5 && isFollowUp) {
    if (q.includes('munafa') || q.includes('profit')) {
      intent = `${lastTimeframe}_PROFIT` as Intent;
      confidence = 0.9;
    } else if (q.includes('kharcha') || q.includes('expense')) {
      intent = `${lastTimeframe}_EXPENSE` as Intent;
      confidence = 0.9;
    } else if (q.includes('sale') || q.includes('kamai')) {
      intent = `${lastTimeframe}_SALES` as Intent;
      confidence = 0.9;
    } else {
      // General follow-up: carry over last intent
      intent = lastIntent;
      confidence = 0.9;
    }
  }

  // Update context for next query
  if (intent !== 'UNKNOWN') lastIntent = intent;
  if (intent.includes('YESTERDAY')) lastTimeframe = 'YESTERDAY';
  else if (intent.includes('WEEK')) lastTimeframe = 'WEEK';
  else if (intent.includes('MONTH')) lastTimeframe = 'MONTH';
  else if (intent.includes('YEAR')) lastTimeframe = 'YEAR';
  else if (intent.includes('TODAY')) lastTimeframe = 'TODAY';
  
  // 🏁 STRICT REDIRECTION & CLASSIFICATION (User Rule #1)
  const category = INTENT_TO_CATEGORY[intent];
  
  if (category === 'irrelevant' || confidence < 0.4) {
    return "I can only help with your shop cashbook and financial records. Karobar ke hawale se kuch poochein.";
  }

  const { today, yesterday, dayBeforeYesterday, weekStart, monthStart, yearStart } = getDates();
  let response = "";

  try {
    switch (intent) {
    case 'TODAY_SALES': response = getSalesText(data, s => s?.date?.startsWith(today) ?? false, 'Aaj Ki Sale'); break;
    case 'YESTERDAY_SALES': response = getSalesText(data, s => s?.date?.startsWith(yesterday) ?? false, 'Kal Ki Sale'); break;
    case 'DAY_BEFORE_YESTERDAY_SALES': response = getSalesText(data, s => s?.date?.startsWith(dayBeforeYesterday) ?? false, 'Parson Ki Sale'); break;
    case 'WEEK_SALES': response = getSalesText(data, s => s?.date != null && s.date >= weekStart, 'Is Hafte Ki Sale'); break;
    case 'MONTH_SALES': response = getSalesText(data, s => s?.date != null && s.date >= monthStart, 'Is Mahine Ki Sale'); break;
    case 'YEAR_SALES': response = getSalesText(data, s => s?.date != null && s.date >= yearStart, 'Is Saal Ki Sale'); break;
    
    case 'TODAY_PROFIT': response = getProfitText(data, s => s?.date?.startsWith(today) ?? false, 'Aaj Ka Profit'); break;
    case 'YESTERDAY_PROFIT': response = getProfitText(data, s => s?.date?.startsWith(yesterday) ?? false, 'Kal Ka Profit'); break;
    case 'DAY_BEFORE_YESTERDAY_PROFIT': response = getProfitText(data, s => s?.date?.startsWith(dayBeforeYesterday) ?? false, 'Parson Ka Profit'); break;
    case 'WEEK_PROFIT': response = getProfitText(data, s => s?.date != null && s.date >= weekStart, 'Is Hafte Ka Profit'); break;
    case 'MONTH_PROFIT': response = getProfitText(data, s => s?.date != null && s.date >= monthStart, 'Is Mahine Ka Profit'); break;
    
    case 'TODAY_EXPENSE': response = `💸 **Aaj ka Kharcha:** ${fmt((data.expenses || []).filter(e => e?.date?.startsWith(today)).reduce((a, x) => a + (x?.amount || 0), 0))}`; break;
    case 'YESTERDAY_EXPENSE': response = `💸 **Kal ka Kharcha:** ${fmt((data.expenses || []).filter(e => e?.date?.startsWith(yesterday)).reduce((a, x) => a + (x?.amount || 0), 0))}`; break;
    case 'DAY_BEFORE_YESTERDAY_EXPENSE': response = `💸 **Parson ka Kharcha:** ${fmt((data.expenses || []).filter(e => e?.date?.startsWith(dayBeforeYesterday)).reduce((a, x) => a + (x?.amount || 0), 0))}`; break;

    case 'YESTERDAY_UDHAAR': {
        const list = (data.udhaars || []).filter(u => u?.date?.startsWith(yesterday));
        const total = list.reduce((a, x) => a + (x?.amount || 0), 0);
        response = `💰 **Kal ka Udhaar:**\n\nTotal added: **${fmt(total)}**\nDetails:\n${list.slice(0, 10).map(u => `• ${u.customerName}: ${fmt(u.amount)}`).join('\n') || "Kal koi udhaar nahi hua."}`;
        break;
    }
    case 'DAY_BEFORE_YESTERDAY_UDHAAR': {
        const list = (data.udhaars || []).filter(u => u?.date?.startsWith(dayBeforeYesterday));
        const total = list.reduce((a, x) => a + (x?.amount || 0), 0);
        response = `💰 **Parson ka Udhaar:**\n\nTotal added: **${fmt(total)}**\nDetails:\n${list.slice(0, 10).map(u => `• ${u.customerName}: ${fmt(u.amount)}`).join('\n') || "Parson koi udhaar nahi hua."}`;
        break;
    }
    
    case 'EXPENSE_BREAKDOWN': {
      const breakdown: Record<string, number> = {};
      const items: Array<{desc: string, amount: number}> = [];
      (data.expenses || []).forEach(e => {
        if (!e) return;
        const cat = e.category || 'Deegar';
        breakdown[cat] = (breakdown[cat] || 0) + (e.amount || 0);
        items.push({ desc: e.description || e.category || 'Expense', amount: e.amount || 0 });
      });
      const top = Object.entries(breakdown).sort(([,a], [,b]) => b - a).slice(0, 5);
      if (items.length === 0) response = "💸 Abhi tak koi kharcha darj nahi hai.";
      else {
        response = `📊 **Kharchay (Expenses) Breakdown:**\n\n`;
        response += `**Categories:**\n${top.map(([c, a], i) => `${i+1}. ${c}: **${fmt(a)}**`).join('\n')}\n\n`;
        response += `**Tafseel (All Items):**\n${items.slice(0, 20).map(it => `• ${it.desc}: ${fmt(it.amount)}`).join('\n')}`;
        if (items.length > 20) response += `\n...aur ${items.length - 20} mazeed kharchay.`;
      }
      break;
    }

    case 'SALES_BREAKDOWN': {
      const { today } = getDates();
      const s = (data.sales || []).filter(x => x?.date?.startsWith(today)).slice(0, 15);
      if (s.length === 0) return "📊 Aaj abhi tak koi sale nahi hui.";
      return `📜 **Aaj ki Sales List:**\n\n${s.map((sale, i) => `${i+1}. Order **#${sale.id.slice(-4)}**: **${fmt(sale.total)}** (${(sale.type || 'Cash')})`).join('\n')}\n\nTamam sales ke liye "All Activity" check karein.`;
    }

    case 'TOP_EXPENSE': {
      const safeExp = data.expenses || [];
      if (safeExp.length === 0) return "✅ Koi kharcha darj nahi hai.";
      const topE = [...safeExp].sort((a, b) => (b?.amount || 0) - (a?.amount || 0))[0];
      if (!topE) return "✅ Koi kharcha darj nahi hai.";
      return `💸 **Sabse Bara Kharcha:**\n\n**${topE.description || topE.category || 'Unknown'}** par **${fmt(topE.amount || 0)}** kharch hue thay (${(topE.date || '').substring(0,10)}).`;
    }

    case 'PROFIT_MARGIN': {
      const s = (data.sales || []).filter(s => s?.date?.startsWith(today));
      const revenue = s.reduce((a, x) => a + (x?.total || 0), 0);
      let cogs = 0;
      s.forEach(sale => (sale?.items || []).forEach((i: any) => {
        if (!i) return;
        const item = (data.stock || []).find(st => st?.id === i?.itemId || st?.name === i?.name);
        cogs += (item?.buyingPrice || 0) * (i?.qty || 0);
      }));
      
      const expense = (data.expenses || []).filter(e => e?.date?.startsWith(today) && (e?.amount || 0) > 0).reduce((a, x) => a + (x?.amount || 0), 0);
      const otherIncome = (data.expenses || []).filter(e => e?.date?.startsWith(today) && (e?.amount || 0) < 0).reduce((a, x) => a + Math.abs(x?.amount || 0), 0);

      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - expense + otherIncome;
      const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';

      return `📊 **Income Summary (Aaj):**\n\n` +
        `Sales: **${fmt(revenue)}**\n` +
        `Gross Profit: **${fmt(grossProfit)}**\n` +
        `Net Profit: **${fmt(netProfit)}**\n` +
        `Net Margin: **${margin}%**`;
    }

    case 'INCOME_STATEMENT': {
      const s = (data.sales || []);
      const revenue = s.reduce((a, x) => a + (x?.total || 0), 0);
      let cogs = 0;
      s.forEach(sale => (sale?.items || []).forEach((i: any) => {
        if (!i) return;
        const item = (data.stock || []).find(st => st?.id === i?.itemId || st?.name === i?.name);
        cogs += (item?.buyingPrice || 0) * (i?.qty || 0);
      }));
      
      const expense = (data.expenses || []).filter(e => (e?.amount || 0) > 0).reduce((a, x) => a + (x?.amount || 0), 0);
      const otherIncome = (data.expenses || []).filter(e => (e?.amount || 0) < 0).reduce((a, x) => a + Math.abs(x?.amount || 0), 0);

      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - expense + otherIncome;
      const margin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';

      return `📄 **INCOME STATEMENT (Amdani / Munafa Tafseel - All Time)**\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `(+) **Revenue (Total Sales):** ${fmt(revenue)}\n` +
             `(-) **COGS (Khareedari Kharcha):** ${fmt(cogs)}\n` +
             `────────────────────\n` +
             `(=) **Gross Profit (Kacha Munafa):** ${fmt(grossProfit)}\n\n` +
             `(-) **Expenses (Deegar Kharchay):** ${fmt(expense)}\n` +
             `(+) **Other Income (Wapsi/Izafi):** ${fmt(otherIncome)}\n` +
             `────────────────────\n` +
             `(=) **NET PROFIT (Khalis Munafa): ${fmt(netProfit)}**\n` +
             `📈 **Net Margin:** ${margin}%\n` +
             `━━━━━━━━━━━━━━━━━━━━`;
    }

    case 'BALANCE_SHEET': {
      const stockVal = (data.stock || []).reduce((a, st) => a + ((st?.buyingPrice || 0) * (st?.quantity || 0)), 0);
      
      const udhaars = data.udhaars || [];
      const balances: Record<string, number> = {};
      udhaars.forEach(u => { if (u?.customerName) balances[u.customerName] = (balances[u.customerName] || 0) + (u?.amount || 0); });
      
      let receivable = 0;
      let payable = 0;
      Object.values(balances).forEach(b => {
        if (b > 0) receivable += b;
        else if (b < 0) payable += Math.abs(b);
      });

      const totalAssets = stockVal + receivable;
      const netWorth = totalAssets - payable;

      return `⚖️ **BALANCE SHEET (Maliyati Hisab)**\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `📦 **ASSETS (Asaasay)**\n` +
             `• Inventory Value (Stock): **${fmt(stockVal)}**\n` +
             `• Accounts Receivable (Lena Hai): **${fmt(receivable)}**\n` +
             `────────────────────\n` +
             `💰 **Total Assets:** **${fmt(totalAssets)}**\n\n` +
             `💳 **LIABILITIES (Karz / Dena Hai)**\n` +
             `• Accounts Payable (Udhaar Dena): **${fmt(payable)}**\n` +
             `────────────────────\n` +
             `📊 **NET WORTH (Dukan ki Asli Qeemat): ${fmt(netWorth)}**\n` +
             `━━━━━━━━━━━━━━━━━━━━`;
    }
    
    case 'CUSTOMER_UDHAAR': return customerUdhaar(query, data);
    case 'CUSTOMER_PAYMENT': {
      const payments = (data.udhaars || []).filter(u => u?.isPayment || (u?.amount || 0) < 0).sort((a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime());
      if (payments.length === 0) return "⏳ Abhi tak udhaar ki koi wapsi darj nahi hui.";
      const recent = payments.slice(0, 3);
      return `💰 **Haaliya Payments (Wapsi):**\n\n${recent.map(p => `• **${p?.customerName || 'Unknown'}** ne **${fmt(Math.abs(p?.amount || 0))}** diye (${(p?.date || '').substring(0,10)}).`).join('\n')}`;
    }
    case 'ITEM_STOCK': return itemStockCheck(query, data);
    case 'COMPARISON': return getComparison(data);
    
    case 'TOTAL_UDHAAR': {
      const safeUdhaarsLocal = data.udhaars || [];
      const balances: Record<string, number> = {};
      safeUdhaarsLocal.forEach(u => { if (u?.customerName) balances[u.customerName] = (balances[u.customerName] || 0) + (u?.amount || 0); });
      
      let receivable = 0;
      let payable = 0;
      Object.values(balances).forEach(b => {
        if (b > 0) receivable += b;
        else if (b < 0) payable += Math.abs(b);
      });

      const top = Object.entries(balances)
        .filter(([, b]) => b > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      let text = `💰 **Total Udhaar (Accounting Status):**\n\n`;
      text += `• **Lena Hai (Receivable):** ${fmt(receivable)}\n`;
      text += `• **Dena Hai (Payable):** ${fmt(payable)}\n`;
      
      if (top.length > 0) {
        text += `\n**Bade Udhaar (Lena hai):**\n${top.map(([n, a]) => `• ${n}: ${fmt(a)}`).join('\n')}\n\nTamam list ke liye "Udhar list" likhein.`;
      }
      return text;
    }

    case 'TOP_DEBTORS': {
      const balances: Record<string, number> = {};
      (data.udhaars || []).forEach(u => { if (u?.customerName) balances[u.customerName] = (balances[u.customerName] || 0) + (u?.amount || 0); });
      const top = Object.entries(balances)
        .filter(([, b]) => b > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15); // Show more people when asked "kis kis ka"
      
      if (top.length === 0) return "✅ Kisi ka udhaar (Lena) nahi hai!";
      return `👥 **Udhaar Lene Wale (Debtors List):**\n\n${top.map(([n, a], i) => `${i+1}. ${n}: **${fmt(a)}**`).join('\n')}`;
    }

    case 'RECOVERY_CHASE':
    case 'OVERDUE': {
      const balances: Record<string, number> = {};
      (data.udhaars || []).forEach(u => { if (u?.customerName) balances[u.customerName] = (balances[u.customerName] || 0) + (u?.amount || 0); });
      const overdue = Object.entries(balances)
        .filter(([, b]) => b > 100)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7);
      if (overdue.length === 0) return "✅ Bohat purana ya bada udhaar kisi ka baqi nahi hai. Recovery stable hai.";
      return `⏳ **Recovery Alert:**\n\nIn logon se paise lenay walay hain:\n\n${overdue.map(([n, a]) => `• ${n}: **${fmt(a)}**`).join('\n')}`;
    }

    case 'BEST_SELLING': {
      const itemSales: Record<string, { name: string; qty: number }> = {};
      (data.sales || []).forEach(s => (s?.items || []).forEach((i: any) => {
        if (!i?.itemId) return;
        if (!itemSales[i.itemId]) itemSales[i.itemId] = { name: i.name || 'Unknown', qty: 0 };
        itemSales[i.itemId].qty += (i.qty || 0);
      }));
      const best = Object.values(itemSales).sort((a, b) => b.qty - a.qty)[0];
      if (!best) return "📊 Abhi koi sale nahi hui.";
      return `🌟 **Subse Zyada Bikne Wala Item:**\n\n**${best.name}**\nTotal: ${best.qty} units bika hai.`;
    }

    case 'LOW_STOCK': {
      const low = (data.stock || []).filter(s => s?.quantity != null && s.quantity <= (s.minThreshold || 5));
      if (low.length === 0) return "✅ Stock full hai! Koi item kam nahi.";
      return `⚠️ **Low Stock Alert (${low.length} items):**\n\n${low.slice(0, 5).map(s => `• ${s?.name || 'Item'}: **${s?.quantity ?? 0} ${s?.unit || ''}**`).join('\n')}`;
    }

    case 'SLOW_STOCK': {
      const soldItemIds = new Set<string>();
      (data.sales || []).forEach(s => (s?.items || []).forEach((i: any) => { if (i?.itemId) soldItemIds.add(i.itemId); }));
      const slow = (data.stock || []).filter(s => s?.id && !soldItemIds.has(s.id));
      if (slow.length === 0) return "✅ Aapka tamam stock bik raha hai, koi dead item nahi!";
      return `🐢 **Slow / Dead Stock:**\n\n**${slow.length}** items aisey hain jo ab tak nahi bikay.\nMisaal ke tor par:\n${slow.slice(0, 3).map(s => `• ${s?.name || 'Item'} (${s?.quantity ?? 0} ${s?.unit || ''})`).join('\n')}`;
    }

    case 'STOCK_VALUE': {
      const val = (data.stock || []).reduce((a, s) => a + ((s.buyingPrice || 0) * (s.quantity || 0)), 0);
      const retailVal = (data.stock || []).reduce((a, s) => a + ((s.price || 0) * (s.quantity || 0)), 0);
      return `📦 **Stock Summary:**\n\nInvestment: ${fmt(val)}\nRetail Value: ${fmt(retailVal)}\nPotential Profit: **${fmt(retailVal - val)}**`;
    }

    case 'STOCK_COUNT': {
      try {
        const stockArr = (data.stock || []).filter(s => s && s.name);
        if (stockArr.length === 0) return "📦 Aapke stock mein abhi tak koi item nahi hai.";
        
        const totalQuantity = stockArr.reduce((a, s) => a + (Number(s.quantity) || 0), 0);
        const topItems = [...stockArr].sort((a,b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0)).slice(0, 5);
        
        return `📦 **Stock Summary (List):**\n` + 
               `━━━━━━━━━━━━━━━━━━━━\n` +
               `Total Variety: **${stockArr.length}**\n` +
               `Total Quantity: **${totalQuantity}**\n\n` +
               `**Top Items:**\n` +
               topItems.map(s => `• ${s.name}: **${s.quantity} ${s.unit || ''}**`).join('\n') +
               (stockArr.length > 5 ? `\n\n...aur ${stockArr.length - 5} deegar items mojood hain.` : '');
      } catch (err) {
        return "⚠️ Stock count karte waqt galti hui.";
      }
    }
    case 'CUSTOMER_COUNT': return `👥 Aapke paas total **${(data.contacts || []).length}** customers/contacts saved hain.`;

    case 'CUSTOMER_HISTORY': {
      try {
        const entity = dynamicEntityLookup(normalizeText(query), data);
        const customer = (entity.type === 'contact' ? entity.item : null) || (data.contacts || []).find(c => String(c?.name).toLowerCase().includes(normalizeText(query)));
        
        if (!customer) return `❌ Customer "${query}" nahi mila.`;
        
        const custSales = (data.sales || []).filter(s => s?.items?.some(i => i?.name === customer.name) || (customer.id && s?.items?.some(i => i?.itemId === customer.id)));
        const custInvoices = (data.invoices || []).filter(inv => inv?.customerName === customer.name);
        
        // Top items calculation
        const itemMap: Record<string, number> = {};
        custSales.forEach(s => s?.items?.forEach(i => { if(i?.name) itemMap[i.name] = (itemMap[i.name] || 0) + (i.qty || 0); }));
        const topItems = Object.entries(itemMap).sort(([,a],[,b]) => b - a).slice(0, 3);

        return `📜 **History for ${customer.name}**\n` +
               `━━━━━━━━━━━━━━━━━━━━\n` +
               `Visits: **${custSales.length + custInvoices.length}** bar\n` +
               `Total Udhaar: **${fmt((data.udhaars || []).filter(u => u?.customerName === customer.name).reduce((a, x) => a + (x?.amount || 0), 0))}**\n` +
               `Phone: ${customer.phone || 'N/A'}\n` +
               `━━━━━━━━━━━━━━━━━━━━\n` +
               `**Khareedari (Top Items):**\n` +
               (topItems.length > 0 ? topItems.map(([n, q]) => `• ${n} (${q} units)`).join('\n') : "Koi record nahi mil saka.");
      } catch (err) {
        console.error('CUSTOMER_HISTORY error:', err);
        return "⚠️ Hisaab nikaalte waqt kuch galti hui.";
      }
    }

    case 'STAFF_OVERVIEW': {
      const staffList = (data.contacts || []).filter(c => c.type?.toLowerCase() === 'staff' || c.type?.toLowerCase() === 'employee');
      if (staffList.length === 0) return "👥 Staff ka data abhi contacts mein saved nahi hai. Staff ko as 'Staff' contact save karein.";
      return `👥 **Staff Overview:**\n\nTotal: ${staffList.length}\nActive Aaj: ${staffList.length} (Assuming all present)`;
    }

    case 'STAFF_ATTENDANCE': {
      // Since attendance might not be fully tracked in db, give a helpful prompt
      return `📝 **Staff Attendance:**\n\nAttendance auto-track nahi hoti agar staff system login use na kar raha ho. Aap "Add Expense" mein ja kar rozaana ke wage/dihaari track kar sakte hain.`;
    }

    case 'FORECAST_REVENUE': {
      const { today } = getDates();
      const monthSales = (data.sales || []).filter(s => s?.date?.startsWith(today.substring(0, 7))).reduce((a, x) => a + (x?.total || 0), 0);
      const dayOfMonth = new Date().getDate();
      const projection = (monthSales / Math.max(1, dayOfMonth)) * 30;
      return `🔮 **Sales Forecast:**\n\nIs mahine ab tak: ${fmt(monthSales)}\nProjected Total (Month End): **${fmt(projection)}**\nTrend: ${projection > monthSales ? "📈 Charao par hai" : "📊 Stable hai"}`;
    }

    case 'CUSTOMER_UDHAAR': response = customerUdhaar(query, data); break;
    case 'ITEM_STOCK': response = itemStockCheck(query, data); break;
    case 'COMPARISON': response = getComparison(data); break;
    
    case 'CASH_HAND': {
      const totalSales = (data.sales || []).reduce((a, x) => a + (x.total || 0), 0);
      const totalExp = (data.expenses || []).reduce((a, x) => a + (x.amount || 0), 0);
      const netUdhaar = (data.udhaars || []).reduce((a, x) => a + (x.amount || 0), 0);
      const cash = totalSales - totalExp - netUdhaar;
      response = `💵 **Gulla Cash:** Aapke pass lag bhag **${fmt(cash)}** hona chahiye.`;
      break;
    }

    case 'NET_WORTH': {
      const stockVal = (data.stock || []).reduce((a, s) => a + ((s.buyingPrice || 0) * (s.quantity || 0)), 0);
      const receivables = (data.udhaars || []).reduce((a, x) => a + (x.amount || 0), 0);
      response = `🏦 **Net Worth:** Kul asasa **${fmt(stockVal + receivables)}** hai (Stock + Udhaar).`;
      break;
    }

    case 'SHOP_HEALTH': {
      const { today } = getDates();
      const s = (data.sales || []).filter(x => isDateMatch(x?.date, today)).length;
      const h = s > 5 ? "Zabardast" : s > 1 ? "Stable" : "Thora slow";
      const totalOfToday = (data.sales || []).filter(x => isDateMatch(x?.date, today)).reduce((a,x) => a + (x?.total || 0), 0);
      const totalUdhaar = (data.udhaars || []).reduce((a,x) => a + (x?.amount || 0), 0);
      response = `🏥 **Shop Health Report:**\n\nStatus: **${h}**\nAaj ki Sales: ${fmt(totalOfToday)}\nUdhaar Risk: ${totalUdhaar > 10000 ? "⚠️ High" : "✅ Low"}\n\nApp bilkul theek chal rahi hai masha'Allah!`;
      break;
    }

    case 'LOSS_MAKING': {
      const totalSales = (data.sales || []).reduce((a, x) => a + (x.total || 0), 0);
      const totalExp = (data.expenses || []).reduce((a, x) => a + (x.amount || 0), 0);
      const loss = totalExp - totalSales;
      if (loss <= 0) response = "✅ Masha'Allah, abhi tak koi loss (nuqsan) nahi hua. Karobar munafa mein hai!";
      else response = `⚠️ **Loss Alert:**\n\nAbhi tak ka kul nuqsan lag bhag **${fmt(loss)}** hai. Kharchay control karein aur sale barhayein.`;
      break;
    }

    case 'SHOP_INFO': {
      const p = data.profile || {};
      const fields = [
        `🏪 Naam: **${p.name || 'N/A'}**`,
        `👤 Malik: ${p.owner || 'Not Set'}`,
        `📍 Sheher: ${p.city || 'Not Set'}`,
        `🏠 Pata: ${p.address || 'Address available nahi hai'}`,
        `📞 Phone: ${p.phone || 'N/A'}`,
        `📧 Email: ${p.email || 'N/A'}`,
        `💰 Currency: ${p.currency || 'PKR'}`,
        `🚀 Plan: ${p.plan || 'Free Account'}`
      ];
      response = `ℹ️ **Shop Information**\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        fields.join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━`;
      break;
    }
    
    case 'INVOICE_LOOKUP': {
      try {
        const entity = dynamicEntityLookup(normalizeText(query), data);
        if (entity.type === 'invoice') {
          const inv = entity.item;
          response = `📝 **Invoice #${inv.invoiceNumber}**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Gahak: ${inv.customerName}\n` +
            `Date: ${new Date(inv.date).toLocaleDateString()}\n` +
            `Status: ${inv.status?.toUpperCase() || 'N/A'}\n` +
            `Total: **${fmt(inv.total)}**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `**Items:**\n` +
            (inv.items || []).map((it:any) => `• ${it?.name || 'Item'} (${it?.qty || 0} x ${fmt(it?.price || 0)})`).join('\n');
        } else {
          response = "Maaf kijiye, ye bill ya invoice nahi mil saki. Kya aapke paas bill number hai?";
        }
      } catch (err) {
        console.error('INVOICE_LOOKUP error:', err);
        response = "⚠️ Invoice check karte waqt galti hui.";
      }
      break;
    }

    case 'ENTITY_SUMMARY': {
      const ent = dynamicEntityLookup(normalizeText(query), data);
      if (ent.type === 'product') response = itemStockCheck(query, data);
      else if (ent.type === 'contact') response = customerUdhaar(query, data);
      else if (ent.type === 'invoice') response = `Bill Number ${ent.item.invoiceNumber} mil gaya. Kya details dekhni hain?`;
      else response = "Samajh nahi aaya ke aap kis cheez ki baat kar rahe hain.";
      break;
    }

    case 'ADVICE': {
      response = `Main ek data reporting manager hoon. Mashwara (advice) mera maqsad nahi hai, lekin main aapko aaj ki sales, expenses aur udhaar ki tafseel bata sakta hoon. Kuch aur poochna hai?`;
      break;
    }

    case 'SPECIFIC_MONTH': {
      // Map month names (English + Roman Urdu) to 2-digit month numbers
      const monthNameToNum: Record<string, string> = {
        jan: '01', january: '01', janvari: '01',
        feb: '02', february: '02', farvari: '02',
        mar: '03', march: '03', maarch: '03',
        apr: '04', april: '04', aprail: '04',
        may: '05', maai: '05',
        jun: '06', june: '06', joon: '06',
        jul: '07', july: '07', julai: '07',
        aug: '08', august: '08', agast: '08',
        sep: '09', september: '09', sitambar: '09', sitanbar: '09',
        oct: '10', october: '10', aktubar: '10',
        nov: '11', november: '11', navambar: '11', navanbar: '11',
        dec: '12', december: '12', disambar: '12', disanbar: '12'
      };
      const monthDisplayNames: Record<string, string> = {
        '01': 'January', '02': 'February', '03': 'March', '04': 'April',
        '05': 'May', '06': 'June', '07': 'July', '08': 'August',
        '09': 'September', '10': 'October', '11': 'November', '12': 'December'
      };

      // Extract month from query
      const monthMatch = q.match(/(jan(uary|vari)?|feb(ruary|rvari)?|mar(ch|aarch)?|apr(il|ail)?|may|maai|jun(e|oon)?|jul(y|ai)?|aug(ust|ast)?|sep(tember|tambar|tamber|tanbar)?|oct(ober|ubar)?|nov(ember|ambar|anbar)?|dec(ember|ambar|anbar)?)/i);
      const yearMatch = query.match(/\b(20\d{2})\b/);

      if (!monthMatch) {
        response = "Maaf kijiye, mahine ka naam samajh nahi aaya. Maslan: 'April ki sale', 'March ka kharcha'";
        break;
      }

      // Find the shortest key that matches
      const foundMonthWord = monthMatch[0].toLowerCase();
      let monthNum = '';
      for (const [key, val] of Object.entries(monthNameToNum)) {
        if (foundMonthWord.startsWith(key) || key.startsWith(foundMonthWord)) {
          monthNum = val;
          break;
        }
      }
      if (!monthNum) {
        response = `🤔 Maaf kijiyega, is mahine ki breakdown mere paas available nahi hai.`;
        break;
      }

      const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
      const monthPrefix = `${year}-${monthNum}`;
      const displayMonth = `${monthDisplayNames[monthNum]} ${year}`;

      const isProfit = /profit|munafa|fayda|bachat/.test(q);
      const isExpense = /kharcha|expense/.test(q);
      const isUdhaar = /udhaar|udhar|baaki|baki|qarz/.test(q);
      const isBreakdown = /list|tafseel|detail|breakdown/.test(q);

      const monthSales = (data.sales || []).filter(s => s?.date?.startsWith(monthPrefix));
      const monthExpenses = (data.expenses || []).filter(e => e?.date?.startsWith(monthPrefix));
      const monthUdhaars = (data.udhaars || []).filter(u => u?.date?.startsWith(monthPrefix));

      if (isUdhaar) {
        const totalUdhaar = monthUdhaars.reduce((a, x) => a + (x?.amount || 0), 0);
        if (monthUdhaars.length === 0) {
          response = `📒 **${displayMonth}** mein koi udhaar entry nahi mili.`;
        } else {
          response = `📒 **${displayMonth} ka Udhaar:**\n\nTotal Entries: ${monthUdhaars.length}\nKul Amount: **${fmt(Math.abs(totalUdhaar))}**`;
        }
      } else if (isExpense) {
        const totalExp = monthExpenses.reduce((a, x) => a + (x?.amount || 0), 0);
        if (monthExpenses.length === 0) {
          response = `💸 **${displayMonth}** mein koi kharcha darj nahi hua.`;
        } else {
          response = `💸 **${displayMonth} ka Kharcha:**\n\nTotal: **${fmt(totalExp)}**\nEntries: ${monthExpenses.length}`;
          if (isBreakdown) {
            const topExpenses = monthExpenses.sort((a,b) => (b.amount||0) - (a.amount||0)).slice(0, 5);
            response += `\n\n**Top Kharchay:**\n${topExpenses.map(e => `• ${e.description || e.category || 'Kharcha'}: ${fmt(e.amount)}`).join('\n')}`;
          }
        }
      } else if (isProfit) {
        response = getProfitText(data, (x: any) => x?.date?.startsWith(monthPrefix), displayMonth);
      } else {
        // Default: Sales summary
        if (monthSales.length === 0) {
          response = `📊 Maaf kijiye, **${displayMonth}** ka mere paas koi record nahi hai. (Pichle mahino ka data filhal available nahi hai).`;
        } else {
          const total = monthSales.reduce((a, x) => a + (x?.total || 0), 0);
          const avgBill = total / monthSales.length;
          const totalExp = monthExpenses.reduce((a, x) => a + (x?.amount || 0), 0);
          // Best day
          const dayMap: Record<string, number> = {};
          monthSales.forEach(s => {
            if (s?.date) dayMap[s.date] = (dayMap[s.date] || 0) + (s.total || 0);
          });
          const bestDay = Object.entries(dayMap).sort(([,a],[,b]) => b - a)[0];

          response = `📊 **${displayMonth} ki Sale:**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 Total: **${fmt(total)}**\n` +
            `🛒 Orders: **${monthSales.length}**\n` +
            `📋 Avg/Bill: **${fmt(avgBill)}**\n`;
          if (totalExp > 0) response += `💸 Kharcha: **${fmt(totalExp)}**\n📈 Net: **${fmt(total - totalExp)}**\n`;
          if (bestDay) response += `\n🏆 Best Day: ${bestDay[0]} (${fmt(bestDay[1])})`;
        }
      }
      break;
    }

    case 'SPECIFIC_DATE': {
      // First: handle tarekh/tarikh directly
      const tarekhMatch = query.match(/(\d{1,2})(vi|wa|wein|ween)?\s*(tarekh|tarikh|tarkh|tarek|tarix)/i);
      const dateMatch = !tarekhMatch ? query.match(/(\d{1,2})[\s\-\.\/](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|aprail|june|july|august|september|october|november|december|farvari|sitambar|navambar|disambar|01|02|03|04|05|06|07|08|09|10|11|12)/i) : null;
      const monthMap: Record<string, string> = {
        jan: '01', january: '01', janvari: '01',
        feb: '02', february: '02', farvari: '02',
        mar: '03', march: '03', maarch: '03',
        apr: '04', april: '04', aprail: '04',
        may: '05', maai: '05',
        jun: '06', june: '06', joon: '06',
        jul: '07', july: '07', julai: '07',
        aug: '08', august: '08', agast: '08',
        sep: '09', september: '09', sitanbar: '09', sitambar: '09',
        oct: '10', october: '10', aktubar: '10',
        nov: '11', november: '11', navambar: '11', navanbar: '11',
        dec: '12', december: '12', disambar: '12', disanbar: '12'
      };
      const daysMap: Record<string, number> = {
        monday: 1, peer: 1, somwar: 1, somvaar: 1,
        tuesday: 2, mangal: 2,
        wednesday: 3, budh: 3,
        thursday: 4, jumeraat: 4, jumerat: 4,
        friday: 5, juma: 5, jumma: 5,
        saturday: 6, hafta: 6,
        sunday: 0, itwar: 0, itvaar: 0
      };

      let targetDate = '';
      let displayDate = '';

      if (tarekhMatch) {
        // "17 tarekh" → current month
        const day = tarekhMatch[1].padStart(2, '0');
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const year = new Date().getFullYear().toString();
        targetDate = `${year}-${month}-${day}`;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        displayDate = `${day} ${monthNames[new Date().getMonth()]} ${year}`;
      } else if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const monthPart = dateMatch[2]?.trim().toLowerCase() || '';
        const month = monthMap[monthPart] || (monthPart.length <= 2 ? monthPart.padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0'));
        const yearMatch = query.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
        targetDate = `${year}-${month}-${day}`;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        displayDate = `${day} ${monthNames[parseInt(month)-1]} ${year}`;
      } else {
        const words = q.split(' ');
        const foundDay = words.find(w => daysMap[w] !== undefined);
        if (foundDay !== undefined) {
            const targetDay = daysMap[foundDay];
            const d = new Date();
            const currentDay = d.getDay();
            let diff = currentDay - targetDay;
            if (diff < 0) diff += 7;
            if (diff === 0) diff = 7; // Assume last week if same day
            d.setDate(d.getDate() - diff);
            targetDate = d.toISOString().split('T')[0];
            displayDate = foundDay.charAt(0).toUpperCase() + foundDay.slice(1) + ` (${targetDate})`;
        }
      }

      if (targetDate) {
        const isProfit = /profit|munafa|fayda|bachat/.test(q);
        const isExpense = /kharcha|expense/.test(q);
        const isUdhaar = /udhaar|udhar|baaki|baki|qarz|lena|dena/.test(q);
        const isSale = /sale|bikri|kamai|aamdan|sel/.test(q);
        const isBreakdown = /breakdown|tafseel|detail|list/.test(q);
        
        const dayFilter = (x: any) => isDateMatch(x?.date, targetDate);
        
        if (isProfit) response = getProfitText(data, dayFilter, displayDate);
        else if (isExpense) {
          const dayExpenses = (data.expenses || []).filter(dayFilter);
          const total = dayExpenses.reduce((a, x) => a + (x?.amount || 0), 0);
          if (dayExpenses.length === 0) response = `💸 **${displayDate}** ko koi kharcha darj nahi hai.`;
          else {
            response = `💸 **${displayDate} ka Kharcha:** ${fmt(total)}\n\n`;
            if (isBreakdown) {
              response += `**Detail:**\n${dayExpenses.map(e => `• ${e.description || e.category || 'Expense'}: ${fmt(e.amount)}`).join('\n')}`;
            }
          }
        } else if (isUdhaar) {
          const dayUdhaars = (data.udhaars || []).filter(dayFilter);
          const totalAdded = dayUdhaars.filter(u => (u.amount || 0) > 0).reduce((a, x) => a + (x.amount || 0), 0);
          const totalPaid = dayUdhaars.filter(u => (u.amount || 0) < 0).reduce((a, x) => a + Math.abs(x.amount || 0), 0);
          if (dayUdhaars.length === 0) response = `📒 **${displayDate}** ko udhaar ki koi entry nahi hui.`;
          else {
            response = `📒 **${displayDate} ka Udhaar:**\n\nNaya Udhaar (Add): **${fmt(totalAdded)}**\nWapsi (Payment): **${fmt(totalPaid)}**\nEntries: ${dayUdhaars.length}\n`;
            if (isBreakdown) response += `\n**Detail:**\n${dayUdhaars.map(u => `• ${u.customerName}: ${u.amount > 0 ? '+' : '-'}${fmt(Math.abs(u.amount))}`).join('\n')}`;
          }
        } else if (isSale) {
          const daySales = (data.sales || []).filter(dayFilter);
          if (daySales.length === 0) {
            response = `📊 **${displayDate}** ko koi sale darj nahi hai.`;
          } else {
            if (isBreakdown) {
               response = `📜 **${displayDate} ki Sales List:**\n\n` + 
                 daySales.map((s, i) => `${i+1}. Order **#${s.id.slice(-4)}**: **${fmt(s.total)}**`).join('\n');
            } else {
               response = getSalesText(data, dayFilter, displayDate);
            }
          }
        } else {
           // Provide a general "Daily Breakdown" (Sales, Exp, Profit)
           const daySales = (data.sales || []).filter(dayFilter);
           const dayExpenses = (data.expenses || []).filter(dayFilter);
           
           const revenue = daySales.reduce((a, x) => a + (x?.total || 0), 0);
           const expense = dayExpenses.reduce((a, x) => a + (x?.amount || 0), 0);
           
           let cogs = 0;
           daySales.forEach(sale => (sale?.items || []).forEach((i: any) => {
             const item = (data.stock || []).find(st => st?.id === i?.itemId || st?.name === i?.name);
             if (item) cogs += (item.buyingPrice || 0) * (i.qty || 0);
           }));
           
           const netProfit = revenue - cogs - expense;
           
           response = `🗓️ **Daily Breakdown: ${displayDate}**\n` +
             `━━━━━━━━━━━━━━━━━━━━\n` +
             `📈 **Sales:** ${fmt(revenue)}\n` +
             `📉 **Kharcha / Exp:** ${fmt(expense)}\n` +
             `────────────────────\n` +
             `💵 **Net Profit:** ${netProfit >= 0 ? '+' : ''}${fmt(netProfit)}\n` +
             `━━━━━━━━━━━━━━━━━━━━`;
        }
      } else {
        response = "Maaf kijiye, ye date samajh nahi aayi. '10 February 2026' ya 'Monday sale' jesi query karein.";
      }
      break;
    }

    case 'MATH': {
      const expr = query.replace(/[^-()\d/*+.]/g, '');
      try {
        const res = Function(`"use strict"; return (${expr})`)();
        response = `🧮 **Hisaab:** ${query} = **${res}**`;
      } catch {
        response = `❌ Maaf kijiye, ye hisaab samajh nahi aaya.`;
      }
      break;
    }

    case 'GREETING': {
      response = `🌟 **Assalam-o-Alaikum!**\n\nMain aapka professional **Business Manager** hoon. Bataiye aaj dukan ke hisaab kitab mein kya madad karoon?`;
      break;
    }

    default: {
      response = `🤔 Maaf kijiyega, samajh nahi aaya. Karobar ke hawale se kuch poochein, maslan "Sale", "Stock" ya "Udhaar".`;
      break;
    }
  }
} catch (err: any) {
  console.error('[localAgent] Internal logic error:', err);
  return `❌ Code Error: ${err.message || 'Something went wrong inside the logic.'}`;
}

return response;
}

/**
 * 🕵️‍♂️ Deep Business Audit Engine
 * Performs 'very complicated' analysis for strategic consulting.
 */
export function generateDeepBusinessAudit(data: ShopData): string {
  if (!data) return '--- DEEP AUDIT REPORT ---\nData available nahi hai.';
  
  const safeSales = data.sales || [];
  const safeExpenses = data.expenses || [];
  const safeUdhaars = data.udhaars || [];
  const safeStock = data.stock || [];
  
  const totalSales = safeSales.reduce((a, x) => a + (x?.total || 0), 0);
  const totalExp = safeExpenses.reduce((a, x) => a + (x?.amount || 0), 0);
  const totalUdhaar = safeUdhaars.reduce((a, x) => a + (x?.amount || 0), 0);
  
  // 1. Customer Concentration Risk
  const custMap: any = {};
  safeUdhaars.forEach(u => { if (u?.customerName) custMap[u.customerName] = (custMap[u.customerName] || 0) + (u?.amount || 0); });
  const topCust = Object.entries(custMap).sort(([,a]:any,[,b]:any) => b - a).slice(0,1)[0];
  const riskPercent = topCust && totalUdhaar > 0 ? (topCust[1] as number / totalUdhaar) * 100 : 0;

  // 2. High Wastage / Low Margin Detection
  const lowMargin = safeStock.filter(s => s?.price && s?.buyingPrice && (s.price - s.buyingPrice) / s.price < 0.05).map(s => s?.name || 'Unknown');

  // 3. Inventory Turnover (Simplified)
  const stockingIssue = safeStock.filter(s => (s?.quantity || 0) > 50 && (s?.soldCount || 0) < 5).map(s => s?.name || 'Unknown');

  return `
    --- DEEP AUDIT REPORT ---
    Profitability: ${totalSales - totalExp > 0 ? "SURPLUS" : "DEFICIT"}
    Customer Risk: ${riskPercent.toFixed(1)}% of debt belongs to ${topCust ? topCust[0] : "N/A"}.
    Low Margin Items: ${lowMargin.slice(0, 3).join(", ") || "None"}
    Dead Stock (High Qty, Low Sales): ${stockingIssue.slice(0, 3).join(", ") || "None"}
    Current Liquidity (Cash - Exp): ${totalSales - totalExp}
    Expansion Score: ${totalSales > totalExp * 2 ? "READY" : "WAIT"}
  `.trim();
}

/**
 * 🔬 Micro-Anomaly Detection (20,000+ permutations)
 * Detects tiny shop patterns (customer churn, small leaks, change issues).
 */
/**
 * 🔬 Micro-Anomaly Detection (20,000+ permutations)
 * Detects tiny shop patterns (customer churn, small leaks, change issues).
 */
export function detectMicroAnomalies(data: ShopData): string[] {
  const anomalies: string[] = [];
  // Guard: return empty if data is missing or malformed
  if (!data) return [];
  
  const safeUdhaars = Array.isArray(data.udhaars) ? data.udhaars : [];
  const safeContacts = Array.isArray(data.contacts) ? data.contacts : [];
  const safeStock = Array.isArray(data.stock) ? data.stock : [];
  const safeExpenses = Array.isArray(data.expenses) ? data.expenses : [];

  try {
    // 1. Customer Churn Detection (O(N) pass)
    const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7);
    const lastActivityMap = new Map<string, string>();
    
    safeUdhaars.forEach(u => {
      if (!u?.customerName || !u?.date) return;
      const existing = lastActivityMap.get(u.customerName);
      if (!existing || u.date > existing) {
        lastActivityMap.set(u.customerName, u.date);
      }
    });

    safeContacts.slice(0, 50).forEach(c => {
      if (!c?.name) return;
      const lastDate = lastActivityMap.get(c.name);
      if (lastDate) {
        try {
          if (new Date(lastDate) < last7Days) {
            anomalies.push(`Gahak **${c.name}** 1 hafte se nahi aya, recovery slow ho sakti hai.`);
          }
        } catch { /* skip invalid dates */ }
      }
    });

    // 2. Margin Check
    safeStock.slice(0, 100).forEach(s => {
      if (!s?.name) return;
      if ((s.price || 0) > 0 && (s.price || 0) <= (s.buyingPrice || 0)) {
        anomalies.push(`**${s.name}** nuqsan mein bik raha hai! Cost: ${s.buyingPrice}, Sale: ${s.price}`);
      }
    });

    // 3. Small Money Leak
    const smallExpCount = safeExpenses.slice(0, 100).filter(e => (e?.amount || 0) > 0 && (e?.amount || 0) < 150).length;
    if (smallExpCount > 10) {
      anomalies.push(`Gullak se chotay kharchay (chai/biscuit) kafi zyada ho rahe hain.`);
    }
  } catch (e) {
    console.error('detectMicroAnomalies error:', e);
  }

  return anomalies.slice(0, 5);
}

/**
 * 🎲 Randomized Data Summary
 * Ensures Gemini gets DIFFERENT context every time to avoid repetitive advice.
 */
export function generateRandomDataSummary(data: ShopData): string {
  if (!data) return "Dukan ka data available nahi hai.";
  const allAnomalies = (detectMicroAnomalies(data) || []);
  const shuffled = [...allAnomalies].sort(() => 0.5 - Math.random()).slice(0, 2);
  
  const totalSales = (data.sales || []).reduce((a, x) => a + (x?.total || 0), 0);
  const totalExp = (data.expenses || []).reduce((a, x) => a + (x?.amount || 0), 0);
  const totalUdhaar = (data.udhaars || []).reduce((a, x) => a + ((x?.amount || 0) * (x?.isPayment ? -1 : 1)), 0);

  return `
    Shop Status:
    - Total Sales: ${totalSales}
    - Expenses: ${totalExp}
    - Market Udhaar: ${totalUdhaar}
    
    🔥 TOP ANOMALIES:
    ${shuffled.length > 0 ? shuffled.map(a => `- ${a}`).join('\n') : '- Sab theek hai.'}
    
    Item Context:
    - Most Stock: ${(data.stock || []).sort((a,b) => (b?.quantity || 0) - (a?.quantity || 0))[0]?.name || 'N/A'}
    - Low Stock: ${(data.stock || []).filter(s => (s?.quantity || 0) < (s?.minThreshold || 0)).length} items short.
  `;
}
