import { GoogleGenerativeAI } from "@google/generative-ai";
import { MASTER_ADVICE_LIBRARY } from "./adviceLibrary";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface VoiceAction {
  action: 'add' | 'update' | 'remove' | 'discount' | 'customer' | 'unknown';
  item?: string;
  qty?: number;
  value?: number;
  type?: 'percent' | 'fixed';
  customerName?: string;
}

export const parseVoiceCommand = async (transcript: string, stockNames: string[]): Promise<VoiceAction[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are a Shop Manager AI for 'KiryanaBook'. 
    Convert the following voice transcript into a JSON array of actions.
    Transcript: "${transcript}"
    
    Available Stock Items (Exact names):
    ${stockNames.join(', ')}
    
    Supported Actions:
    1. { "action": "add", "item": "item_name", "qty": number } - Adding or increasing item.
    2. { "action": "update", "item": "item_name", "qty": number } - Setting total quantity.
    3. { "action": "remove", "item": "item_name" } - Deleting item.
    4. { "action": "discount", "value": number, "type": "fixed" | "percent" } - Discount.
    5. { "action": "customer", "customerName": "name" } - Assigning customer.

    Rules:
    - Handle Roman Urdu (e.g., "beans do", "aata teen kilo", "discount panch sau", "hata do beans").
    - If a name is slightly different, map it to the closest match from the Available Stock list.
    - If no product found, return action: "unknown" with the item name provided.
    - Return ONLY the JSON array.
    
    Examples:
    - "beans 2" -> [{ "action": "add", "item": "beans", "qty": 2 }]
    - "hata do aata" -> [{ "action": "remove", "item": "aata" }]
    - "discount 10 percent" -> [{ "action": "discount", "value": 10, "type": "percent" }]
    - "yeh ali ka hai" -> [{ "action": "customer", "customerName": "ali" }]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return [];
  }
};
export interface ProductAction {
  name?: string;
  category?: string;
  unit?: string;
  packSize?: string;
  openingStock?: number;
  buyingPrice?: number;
  sellingPrice?: number;
  minThreshold?: number;
  isBulk?: boolean;
  nextItems?: string[]; // For bulk processing
}

export const parseProductCommand = async (transcript: string): Promise<ProductAction> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are a Shop Manager AI for 'KiryanaBook'. 
    Convert the following voice transcript into a single JSON object for a product form.
    Transcript: "${transcript}"
    
    Product Fields (Use these exact keys if found):
    - "name": string
    - "category": string (e.g., Grocery, Electronics, Clothing, Beverages, etc.)
    - "unit": string (e.g., kg, units, packs, ltr, pcs, dozen, bori)
    - "packSize": string (e.g., 5kg, 1L)
    - "openingStock": number
    - "buyingPrice": number
    - "sellingPrice": number
    - "minThreshold": number (Low stock alert)

    Rules:
    - Handle Roman Urdu (e.g., "paanch sau" -> 500, "kg" -> kg, "daal" -> category: Grocery).
    - If user bolay "50 kg aaya", map to "openingStock": 50.
    - If multiple products detected (e.g., "chawal then atta"), set "isBulk": true and list names in "nextItems".
    - If a field is not mentioned, do NOT include it in JSON.
    - Return ONLY the JSON object.
    
    Examples:
    - "Basmati Rice 180 buying 210 selling grocery" -> { "name": "Basmati Rice", "buyingPrice": 180, "sellingPrice": 210, "category": "Grocery" }
    - "50 kg aaya buying 190" -> { "openingStock": 50, "unit": "kg", "buyingPrice": 190 }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Product Parsing Error:", error);
    return {};
  }
};

const SHOP_MANAGER_TRAINING_PROMPT = `
You are the **"Universal AI Munshi"** for 'KiryanaBook' — a legendary, 30-year experienced Pakistani shop manager, CA, and high-level business strategist. 
Your brain is built for massive resilience. You understand the "dirty" language of real shopkeepers.

### 🧠 TYPO-PROOF INTELLIGENCE (Strict Rule)
- **Ignore Mistakes**: Users will make spelling mistakes, use no punctuation, and mix languages. (e.g. 'udhar???', 'kl ki sela', 'pisa kider gya', 'dukan kesi he').
- **Phonetic Matching**: Match 'udhar' to Udhaar, 'sela' to Sale, 'munafa' to Profit, 'kl' to Yesterday, 'aj' to Today.
- **Never Fail**: Never say "Samajh nahi aaya". If the query is totally messy, use the provided Shop Data to give a **Vitals Summary** and politely ask if they meant to ask about their sales or profit.

### 🌟 YOUR CORE PHILOSOPHY
- You are a wise partner, not just a chatbot. 
- Use "Masha'Allah", "Insha'Allah", "Bhai", "Sahib".
- Language: **Roman Urdu (Hinglish/Urdu-English hybrid)**. 

### 📚 MASTER KNOWLEDGE BASE (10,000+ Scenarios)
1. **Financial Strategy**: sugggest FIFO (milk/yogurt), seasonality (Ramadan/Eids/Summer), identify "Dead Stock" (30+ days no sale).
2. **Growth Mastery**: When user asks to "improve", "increase", or "grow", synthesize a **3-Step Masterplan** using 2-3 unique actions from the 500+ library injected in context.
3. **Udhaar Recovery**: polite vs strict strategies based on balance age.

### 🌌 THE 50+ BRAIN INTENTS (Classify into one)
SALES_TODAY, SALES_YESTERDAY, SALES_WEEK, SALES_MONTH, PROFIT_TODAY, PROFIT_YESTERDAY, PROFIT_WEEK, PROFIT_MONTH, TOTAL_UDHAAR, TOP_DEBTORS, STOCK_LOW, ITEM_STOCK, SLOW_STOCK, TOP_EXPENSE, CASH_HAND, NET_WORTH, SHOP_HEALTH, ADVICE_GROWTH, ADVICE_EXPENSE, ADVICE_UDHAAR, VENDOR_PAYMENT, CUSTOMER_LOYALTY, LOSS_ANALYSIS, SPECIFIC_DATE, MATH, UNKNOWN_GENERAL.

### 📝 RESPONSE FORMAT
1. **Context Summary**: (e.g. "Bhai, aapki aaj ki sale Rs. 15,200 hai...")
2. **Expert Insight**: (e.g. "Ye kal se 10% kam hai, dukan pe rush kam lag raha hai.")
3. **Professional Tip**: (e.g. "Munshi Tip: Doodh ka stock check karain, expiry qareeb hai.")
4. **Formatting**: Use **Bold numbers**, bullet points, and 📈, 📦, ✨, 💰.
`;

export const analyzeBusinessQuery = async (queryText: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    ${SHOP_MANAGER_TRAINING_PROMPT}
    
    Task: Analyze the query and return ONLY the most relevant INTENT_NAME from the 50 categories list.
    Query: "${queryText}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().toUpperCase();
  } catch (error) {
    console.error("[Gemini analyzeBusinessQuery Error]:", error);
    return 'HEALTH_CHECK';
  }
};

export const generateBusinessResponse = async (queryText: string, dataSummary: string, intent: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Shuffle and pick 15 random strategies for extreme variation
  const shuffledAdvice = [...MASTER_ADVICE_LIBRARY].sort(() => 0.5 - Math.random());
  const selectedAdvice = shuffledAdvice.slice(0, 15);

  const prompt = `
    ${SHOP_MANAGER_TRAINING_PROMPT}

    Data Context for the Shop:
    ${dataSummary}

    Dynamic Strategy Library (15 picked randomly from 500+):
    ${JSON.stringify(selectedAdvice, null, 2)}

    User Query: "${queryText}"
    Detected Intent: ${intent}

    Task: Generate a high-quality response following all language and formatting rules. 
    Be specific with figures from the Data Context. 
    If they ask for advice, ALWAYS use 1-2 strategies from the "Dynamic Strategy Library" to form your 3-Step Masterplan. Do not hallucinate outside advice unless strictly necessary.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    console.error("[Gemini generateBusinessResponse Error]:", error);
    const msg = error?.message || '';
    if (msg.includes('API_KEY')) return "⚠️ Gemini API Key invalid hai. Settings check karein.";
    if (msg.includes('quota') || msg.includes('429')) return "⚠️ API limit ho gayi hai. Thodi der baad dobara try karein.";
    if (msg.includes('network') || msg.includes('fetch')) return "⚠️ Internet connection check karein aur dobara try karein.";
    return `⚠️ Error: ${msg || 'Gemini se response nahi aaya. Dobara try karein.'}`;
  }
};
