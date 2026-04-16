import { GoogleGenerativeAI } from "@google/generative-ai";
import { MASTER_ADVICE_LIBRARY } from "./adviceLibrary";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface VoiceAction {
  action: 'add' | 'update' | 'remove' | 'discount' | 'customer' | 'unknown';
  item?: string;
  qty?: number;
  value?: number;
  type?: 'percent' | 'fixed';
  customerName?: string;
}
export const parseVoiceCommand = async (transcript: string, stockNames: string[]): Promise<VoiceAction[]> => {
  if (!genAI) {
    throw new Error("Gemini API Key missing (Business Manager AI disabled)");
  }
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
  if (!genAI) return { name: "", category: "Grocery" };
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
You are the **"Professional Business Manager"** for 'KiryanaBook'. 
You are a domain-specific financial agent, NOT a general chatbot.

### 📜 STRICT OPERATIONAL RULES:
1. **Domain Focus**: Only assist with shop cashbook data, financial summaries, transactions, and shopkeeper operations.
2. **Intent Classification**: You must internalize the intent before responding:
   - GREETING/ACK: (Hi, Hello, ok, thanks, ji, theek hai) -> Brief friendly response + stay ready for next business task.
   - FINANCIAL_OPERATION: (Sales, Expenses, Profit, Udhaar, Stock) -> Accurate data-driven response.
   - REPORT_SUMMARY: (Audit, Performance, Week/Month summaries) -> Focused summary.
   - INVALID_REQUEST: (Jokes, weather, or completely unrelated long talk) -> "Maazrat, main sirf aapke shop cashbook aur accounts me madad kar sakta hoon. Business ke hawale se poochein."
3. **Redirection**: If the request is unrelated, gracefully bring focus back to the business.
4. **Output Format**: Concise, professional, and helpful. 
5. **No Hallucination**: If data is missing in the context, say "Data available nahi hai". Do NOT guess numbers.
6. **Cultural Tone**: Be a helpful Professional Manager. Use "Masha'Allah", "Insha'Allah", "Bhai", "Sahib". Use Roman Urdu/English hybrid.

### 📝 RESPONSE STRUCTURE:
1. **Classify**: (Internal step, do not print the category name unless asked, just align response style).
2. **Context**: Use specific figures from provided Shop Data.
3. **Action**: Suggest a specific business action based on data.
`;

export const analyzeBusinessQuery = async (queryText: string): Promise<string> => {
  if (!genAI) return 'HEALTH_CHECK';
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
  if (!genAI) return "Pehlay AI key lagayen App settings me (Business Manager AI disabled)";
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
