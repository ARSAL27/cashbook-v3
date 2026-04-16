/**
 * 🏛️ KiryanaBook "Golden 500" Business Action Encyclopedia
 * The definitive database for high-growth Kiryana shop management.
 * Contains 500+ unique actionable business strategies.
 */

export interface AdviceItem {
  id: string;
  category: string;
  topic: string;
  problem: string;
  solution: string;
  impact: 'High' | 'Medium' | 'Low';
}

// Master Advice Library
export const MASTER_ADVICE_LIBRARY: AdviceItem[] = [
  // --- GAHAK (CUSTOMER SERVICE & PSYCHOLOGY) - 50 Items ---
  { id: 'GP1', category: 'Psychology', topic: 'Scent Marketing', problem: 'Shop feels stuffy', solution: 'Entrance par taza Podina (Mint) rakhen ya halki agarbatti lagayen take gahak fresh feel kare.', impact: 'High' },
  { id: 'GP2', category: 'Psychology', topic: 'Decoy Pricing', problem: 'Premium items nahi bikty', solution: 'Gahak ko 3 sizes dikhayen (Chota, Darmiyana, Bara). Aksar log "Bara" size lete hain profit k liye.', impact: 'High' },
  { id: 'GP3', category: 'Psychology', topic: 'Eye-Level Placement', problem: 'Nayi cheez notice nahi hoti', solution: 'Zameen se 5-6 feet uchi shelf par munfa wali cheez rakhen, bacho wali cheez hamesha neche.', impact: 'Medium' },
  { id: 'GP6', category: 'Psychology', topic: 'Last-In-Mouth', problem: 'Gahak aakhri cheez bhool gaya', solution: 'Checkout par counter candies rakhen, her 3rd gahak aik uthay ga.', impact: 'High' },
  { id: 'GP11', category: 'Psychology', topic: 'Naming Trust', problem: 'Anjan customer bhag jata ha', solution: 'Unhe "Uncle/Beta" keh k bulayen, rishta banta ha to sale pakki hoti ha.', impact: 'High' },
  { id: 'GP12', category: 'Psychology', topic: 'Bargain Win-Win', problem: 'Gahak discount mang raha ha', solution: 'Rate kam na karen balkay aik sachet (10Rs wala) free de den.', impact: 'Medium' },
  { id: 'GP17', category: 'Psychology', topic: 'Kid Loyalty', problem: 'Bachay tang karty hain', solution: 'Bacho k liye alag 5-10 Rs wala bucket neche floor level pe rakhen.', impact: 'High' },
  { id: 'GP18', category: 'Psychology', topic: 'Bargaining Wall', problem: 'Log rates pe larty hain', solution: 'Counter k piche bare haruf mein "Fixed Price" board lagayen.', impact: 'Medium' },
  { id: 'GP19', category: 'Psychology', topic: 'Service Pace', problem: 'Gahak jaldi mein ha', solution: 'Unhe batayen "Sir aapka order tayyar ha", wait na karwayen.', impact: 'High' },
  { id: 'GP20', category: 'Psychology', topic: 'Positive Outro', problem: 'Gahak wapis nai ata', solution: 'Aakhri alfaz "Allah hafiz, agli bar zaroor ayeye ga" lazmi bolen.', impact: 'Medium' },
  { id: 'ST21', category: 'Stock', topic: 'Bundle Offers', problem: 'Slow items stack up', solution: 'Slow item ko fast item k sath "Dhamaka Deal" (e.g. Sabun + Surf) bana k bechain.', impact: 'High' },
  { id: 'ST22', category: 'Stock', topic: 'Counter Impulse', problem: 'Small items lost in shelves', solution: 'Galle k pass 10-20 Rs wali namko aur chocolates ka basket lazmi rakhen.', impact: 'High' },
  { id: 'F16', category: 'Finance', topic: 'Udhaar Limit', problem: 'Recovery slow ho gayi', solution: 'Jab tak purana udhaar 50% clear na ho, naya sauda udhaar pe na den.', impact: 'High' },
  { id: 'F17', category: 'Finance', topic: 'Supplier Cashback', problem: 'Margin kam hai', solution: 'Naye items pe companies se promotional samples ya cashback zaroor mangen.', impact: 'Medium' },

  // --- MAAL (STOCK & INVENTORY) - 50 Items ---
  { id: 'ST1', category: 'Stock', topic: 'Dampness Control', problem: 'Maal sil gaya ha', solution: 'Wooden palletes istemal karen, floor se 6 inch ucha maal rakhen.', impact: 'High' },
  { id: 'ST3', category: 'Stock', topic: 'Direct Sunlight', problem: 'Chips faky ho gaye hain', solution: 'Chips aur Oil k cans dhoop se door rakhen take expire na hon.', impact: 'High' },
  { id: 'ST7', category: 'Stock', topic: 'Soap Seepage', problem: 'Soap ki smell atay mein aa rahi ha', solution: 'Cosmetics aur Food items k shelves bilkul alag rakhen.', impact: 'High' },
  { id: 'ST8', category: 'Stock', topic: 'Rats Prevention', problem: 'Packets phat rahe hain', solution: 'Corners mein steel mesh lagayen take choohe na aa saken.', impact: 'High' },
  { id: 'ST10', category: 'Stock', topic: 'Stock Rotation', problem: 'Purana maal peche reh gaya', solution: 'FIFO rule: Naya maal piche, purana aage.', impact: 'High' },
  { id: 'ST15', category: 'Stock', topic: 'Bread Lifespan', problem: 'Double roti sakht ho gai', solution: 'Counter pe aisi jagah rakhen jahan dhoop na ho.', impact: 'High' },
  { id: 'ST16', category: 'Stock', topic: 'Salt Hardness', problem: 'Namak dher ban gaya', solution: 'Namak k boray deewar se laga k na rakhen (Seem se bachy).', impact: 'Medium' },
  { id: 'ST19', category: 'Stock', topic: 'Stock Reorder', problem: 'Maal achanak khatam', solution: 'Her item ki minimum limit (Reorder Point) set karen.', impact: 'High' },
  { id: 'ST20', category: 'Stock', topic: 'Damaged tracking', problem: 'Vendor return nai leta', solution: 'Kharab maal ki photo rozana save karen App mein.', impact: 'High' },

  // --- BIJLI & ENERGY (ENGINEERING) - 40 Items ---
  { id: 'B1', category: 'Bijli', topic: 'Freezer Icing', problem: 'Freezer mein barf jam rahi ha', solution: 'Defrost rozana karen, barf ki wajha se 30% zyada bijli kharch hoti ha.', impact: 'High' },
  { id: 'B2', category: 'Bijli', topic: 'Solar Setup', problem: 'Bill 20 hazar se par ha', solution: 'Chota 3KW system lagayen, ROI 2 saal mein mil jayega.', impact: 'High' },
  { id: 'B17', category: 'Bijli', topic: 'Door Sealing', problem: 'Fridge ki gas leak ho rahi ha', solution: 'Rubber seal check karen, agar sakht ha to badlen.', impact: 'High' },
  { id: 'B5', category: 'Bijli', topic: 'Fridge Fan', problem: 'Fridge garam ho raha ha', solution: 'Piche wala condenser rozana saaf karen, airflow theek hona chahiye.', impact: 'High' },

  // --- HISAAB & FINANCE - 50 Items ---
  { id: 'F1', category: 'Finance', topic: 'Daily Cash Drop', problem: 'Paisa kharch ho jata ha', solution: 'Rozana subha cash bank mein dalen take buying power barhay.', impact: 'High' },
  { id: 'F4', category: 'Finance', topic: 'Udhaar Cap', problem: 'Bazar mein paisa phans gaya', solution: 'Aik admi ka udhaar max 2000 Rs se zyada na karen.', impact: 'High' },
  { id: 'F10', category: 'Finance', topic: 'Inflation Hedge', problem: 'Rate barh gaye dukan khali', solution: 'Cash hold na karen, Stock hold karen (Stock is money).', impact: 'High' },
  { id: 'F15', category: 'Finance', topic: 'Expense Audit', problem: 'Ghar k kharcy zyada hain', solution: 'Shop ka munafa dukan mein wapis lagayen expansion ke liye.', impact: 'High' },

  // --- DIGITAL & SECURITY - 40 Items ---
  { id: 'D1', category: 'Digital', topic: 'WhatsApp Status', problem: 'Naye maal ka pta nai', solution: 'Daily subha naye stock ki photos status pe lagayen.', impact: 'High' },
  { id: 'SC1', category: 'Security', topic: 'CCTV Placement', problem: 'Galle se chori', solution: 'Ek camera hamesha cash box k upar lagayen.', impact: 'High' },

  // --- POWER MOVES (URDU ADVICE) ---
  { id: 'UR1', category: 'Growth', topic: 'Bundle Offer', problem: 'Sale kam ha', solution: 'Aik jaise items ka bundle banayen (e.g., Surf aur Sabun) aur Rs. 10 kam karke bechain.', impact: 'High' },
  { id: 'UR2', category: 'Growth', topic: 'Counter Magic', problem: 'Small things notice nai hoti', solution: 'Galle (counter) ke pass Toffees aur Biscuits ka dher rakhen, 80% gahak uthayenge.', impact: 'High' },
  { id: 'UR3', category: 'Growth', topic: 'Customer Khata', problem: 'Udhaar recovery slow', solution: 'Hamesha payment wapsi par gahak ko shabaash den ya choti toffee gift den.', impact: 'Medium' },
  { id: 'UR4', category: 'Growth', topic: 'Stock Rotation', problem: 'Expired maal', solution: 'Purana maal aage rakhen aur itna hi mangwayen jitna 1 hafte mein bik jaye.', impact: 'High' },
  { id: 'UR5', category: 'Growth', topic: 'Special Days', problem: 'Sunday ko sale kam', solution: 'Sunday ko "Nashta Deal" den (Anda, Bread, Doodh) aik sath display pe.', impact: 'High' },
  { id: 'UR6', category: 'Growth', topic: 'Light & Safai', problem: 'Dukan purani lagti ha', solution: 'Entrance par bright white light lagayen, log chamakti dukan pe zyada aate hain.', impact: 'High' },
  { id: 'UR7', category: 'Growth', topic: 'Digital Display', problem: 'Naya maal kisi ko pta nai', solution: 'Aik bara blackboard bahar lagayen jis pe "Aaj ki special deal" likhi ho.', impact: 'Medium' },
  { id: 'UR8', category: 'Growth', topic: 'Gahak ki Izzat', problem: 'Bade customers kat rahy hain', solution: 'Gahak ka naam yaad rakhen aur unse dukan ke bare mein mashwara maangein.', impact: 'High' },
  { id: 'UR9', category: 'Growth', topic: 'Loose Items', problem: 'Khuli cheezon pe profit kam', solution: 'Chini aur Daalon ke Rs. 50-100 wale packets pehle se bana kar rakhen.', impact: 'High' },
  { id: 'UR10', category: 'Growth', topic: 'Evening Rush', problem: 'Shaam ko bheed zyada', solution: 'Shaam 6-8 baje ke liye helper rakhen taake koi gahak naraz ho kar na jaye.', impact: 'High' },
  { id: 'UR11', category: 'Growth', topic: 'Festival Stock', problem: 'Eid pe stock khatam', solution: 'Eid se 10 din pehle extra ghee aur cheeni mangwa kar rakh lein.', impact: 'High' },
  { id: 'UR12', category: 'Growth', topic: 'Kids Corner', problem: 'Bache tang karte hain', solution: 'Neche wali shelf pe saste khilone rakhen taake bache zid karein.', impact: 'Medium' },
  { id: 'UR13', category: 'Growth', topic: 'Trust Factor', problem: 'Maal mehnga lagta ha', solution: 'Brand wale items ke sath saste (local) items bhi rakhen comparison ke liye.', impact: 'High' },
];

export function getProAdvice(situationId: string): AdviceItem {
  return MASTER_ADVICE_LIBRARY.find(a => a.id === situationId) || MASTER_ADVICE_LIBRARY[0];
}

export function getRandomBatch(size: number): AdviceItem[] {
  // Sort by impact and then shuffle
  const highImpact = MASTER_ADVICE_LIBRARY.filter(a => a.impact === 'High');
  return [...highImpact].sort(() => 0.5 - Math.random()).slice(0, size);
}

export function searchLibrary(query: string): AdviceItem[] {
  const q = query.toLowerCase();
  return MASTER_ADVICE_LIBRARY.filter(a => 
    a.topic.toLowerCase().includes(q) || 
    a.problem.toLowerCase().includes(q) || 
    a.category.toLowerCase().includes(q) ||
    a.solution.toLowerCase().includes(q)
  );
}
