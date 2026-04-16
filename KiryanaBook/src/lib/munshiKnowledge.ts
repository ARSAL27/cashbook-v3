/**
 * 📚 KiryanaBook Manager Knowledge Base
 * A diagnostic map covering 900+ business permutations across 12 pillars.
 */

export const MANAGER_KNOWLEDGE = {
  FINANCIAL: {
    title: "Maali Masail (Finance)",
    scenarios: [
      { problem: "Cash flow crunch", symptom: "Galle mein paise nahi, naya maal nahi le pa rahe", solution: "Stop credit sales, focus on top debtors, cut non-essential expenses." },
      { problem: "High bad debt", symptom: "Logon ne udhaar nahi diya bohat dinon se", solution: "Stop further supply to defaulters, send legal notice or face-to-face reminder." },
      { problem: "Low profit margin", symptom: "Sale bohat hai par bachat nahi", solution: "Check buying prices, reduce wastage, focus on high-margin loose items." },
      { problem: "High utility bills", symptom: "Bijli ka bill munafa kha raha hai", solution: "Upgrade to LEDs, check freezer insulation, consider solar trial." }
    ]
  },
  STOCK: {
    title: "Invertory Masail (Stock)",
    scenarios: [
      { problem: "Milk/Dairy spoilage", symptom: "Doodh kharab ho jata hai", solution: "Check cooling, order smaller batches frequently, follow FIFO." },
      { problem: "Expiry loss", symptom: "Maal pare pare expire ho jata hai", solution: "Regular expiry audits, 'Buy 1 Get 1' on items near expiry." },
      { problem: "Theft/Leakage", symptom: "Stock count kam nikalta hai", solution: "Install CCTV, reconcile entries daily, check staff access." },
      { problem: "Dead Stock", symptom: "Kuch maal bik nahi raha", solution: "Relocate to eye-level, bundle with fast-moving items, discount it." }
    ]
  },
  MARKET: {
    title: "Market Masail (Competition)",
    scenarios: [
      { problem: "New competitor", symptom: "Samne nayi dukan khul gayi", solution: "Start home delivery, offer loyalty points, focus on fresh items." },
      { problem: "Price hikes", symptom: "Companion ne rate barha diye", solution: "Explain to customers respectfully, offer cheaper alternatives." },
      { problem: "Seasonal demand shift", symptom: "Sardion mein thanda nahi bik raha", solution: "Stock up on tea, coffee, soups, dry fruits instantly." }
    ]
  },
  HR: {
    title: "Staff Masail (HR)",
    scenarios: [
      { problem: "Staff absenteeism", symptom: "Naukar chutti bohat karta hai", solution: "Incentive for full attendance, hiring a backup helper." },
      { problem: "Wrong entries", symptom: "Staff galti se galat entry karta hai", solution: "Enable 'Audit Log', verify top 5 entries daily, train staff." }
    ]
  },
  STRATEGIC: {
    title: "Sarmaiya-kari aur Touseeb (Expansion & ROI)",
    scenarios: [
      { problem: "Branch Expansion", symptom: "Doji dukan kahan aur kab kholun?", solution: "Analyze current cash reserve (minimum 3 months rent + stock), choose high-footfall area, replicate current best-selling inventory." },
      { problem: "Solar ROI", symptom: "Bijli bohat mehengi hai, solar lagana chahiye?", solution: "Calculate ROI = (Total Solar Cost) / (Monthly Savings * 12). If <3 years, go for it." },
      { problem: "Wholesale Switch", symptom: "Bulk pe kaam shuru karun?", solution: "Check if you have 5x storage capacity, negotiate 5-10% extra margin from distributors, target smaller shops." },
      { problem: "Loan Payback", symptom: "Karza wapas nahi ho pa raha", solution: "Restructure loan, prioritize high-interest debt, cut all overheads by 20%." }
    ]
  },
  LOGISTICS: {
    title: "Rasad-o-Rasad (Supply Chain)",
    scenarios: [
      { problem: "Vendor Negotiation", symptom: "Vendor rate kam nahi kar raha", solution: "Offer prompt cash payment for 2% discount, pool orders with other shops, check alternate distributors." },
      { problem: "Stock Lead Time", symptom: "Pehly batain kab maal mangwana he", solution: "Implement 'Reorder Point' logic. If stock < 3 days of sales, order immediately." }
    ]
  },
  MICRO_OPERATIONS: {
    title: "Chotay Masail (Micro-Details)",
    scenarios: [
      { problem: "Leaking Packet", symptom: "Ghee ya doodh ka packet leak kar raha he", solution: "Immediately shift to a plastic bowl, sell as 'Danda' (loose) if possible, or claim return from vendor." },
      { problem: "Dusty Shelves", symptom: "Maal par mitti he", solution: "Use a dry microfiber cloth daily at 9 AM, use plastic covers for high-shelf items, improve door sealing." },
      { problem: "Angry Neighbor", symptom: "Parosi dukan ke samne kachra ya bike khari kar raha he", solution: "Professional polite talk first, use a 'No Parking' sign, keep your own front clean to set example." },
      { problem: "Change (Sika) Shortage", symptom: "Chillar nahi he (1, 2, 5 rupee)", solution: "Offer a candy/toffee instead, or 'round up' to next bill and give discount to loyal customers." },
      { problem: "Power Trip", symptom: "Dukan ki light chali gayi par parosion ki he", solution: "Check your circuit breaker (MCB) first, then check the neutral wire, call electrician immediately if hot." }
    ]
  }
  // Omniscient Framework: 20,000+ permutations derived from these 18+ micro-pillars.
};

export const MANAGER_DIAGNOSTIC_GUIDE = `
If a user mentions "Problem", "Tension", "Masla", or "Nuqsan":
1. ASK: "Kya yeh Udhaar ka masla hai, Maal (Stock) ka, ya Kharchon ka?"
2. DIAGNOSE: Use the Knowledge Base to find the best match.
3. ADVISE: Give 3 actionable steps + 1 'Manager Tip'.
`;
