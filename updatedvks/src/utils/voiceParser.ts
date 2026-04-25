export interface ParsedProduct {
  name?: string;
  category?: string;
  unit?: string;
  packSize?: string;
  openingStock?: string;
  buyingPrice?: string;
  sellingPrice?: string;
  minThreshold?: string | "off";
  categoryWarning?: boolean;
}

// Map text to numbers for common mixed usage
const parseHybridNumber = (text: string): number | null => {
  let cleaned = text.toLowerCase()
    .replace(/k/g, '000 ')
    .replace(/sow|sau|so/g, '*100 ')
    .replace(/hazaar|hazar/g, '*1000 ');
    
  const numWords: Record<string, number> = {
    "ek": 1, "aik": 1, "hik": 1, "yo": 1, "one": 1, "do": 2, "du": 2, "two": 2, "teen": 3, "tre": 3, "tr": 3, "three": 3, 
    "char": 4, "chaar": 4, "four": 4, "paanch": 5, "panch": 5, "panj": 5, "five": 5, "che": 6, "chay": 6, "six": 6, 
    "saat": 7, "sath": 7, "seven": 7, "aath": 8, "ath": 8, "eight": 8, "nau": 9, "nao": 9, "nine": 9, "das": 10, "des": 10, "ten": 10,
    "gyara": 11, "giara": 11, "yara": 11, "bara": 12, "twel": 12, "bis": 20, "bees": 20, "beas": 20, "twenty": 20,
    "tees": 30, "thirty": 30, "chalis": 40, "chales": 40, "forty": 40, "forti": 40, "pachas": 50, "pachash": 50, "fifty": 50,
    "saath": 60, "sixty": 60, "sattar": 70, "seventy": 70, "assi": 80, "eighty": 80, "nabbe": 90, "nabbay": 90, "ninety": 90,
    "so": 100, "sau": 100, "sow": 100, "hundred": 100, "hazar": 1000, "hazaar": 1000, "thousand": 1000, "lac": 100000, "lakh": 100000
  };

  // Convert known words to numbers
  Object.keys(numWords).forEach(word => {
    const rx = new RegExp(`\\b${word}\\b`, 'g');
    cleaned = cleaned.replace(rx, numWords[word].toString() + " ");
  });

  // Now we have something like "3 50" (teen fifty), "1 *1000 8 *100" (ek hazaar aath sau)
  // Let's do a simple evaluated sum for valid patterns
  let sum = 0;
  let currentGroup = 0;

  const parts = cleaned.trim().split(/\s+/);
  
  let hasNumber = false;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.startsWith('*')) {
      const mult = parseInt(p.substring(1));
      if (!isNaN(mult)) {
        if (currentGroup === 0) currentGroup = 1; // e.g. "hazar"
        currentGroup *= mult;
        sum += currentGroup;
        currentGroup = 0;
      }
    } else {
      const v = parseInt(p);
      if (!isNaN(v)) {
        hasNumber = true;
        
        // Handle "teen fifty" (3 then 50) -> if currentGroup > 0 and v < currentGroup (like 100 then 50), add. 
        // Or if we see a solitary digit then a 50 (like "3 50"), it means 350.
        // Chrome might return '350', which is directly parsed.
        if (currentGroup > 0 && currentGroup < 10 && v >= 10) {
            // "3 50" -> 350
            currentGroup = currentGroup * 100 + v; 
            sum += currentGroup;
            currentGroup = 0;
        } else {
            sum += currentGroup;
            currentGroup = v;
        }
      }
    }
  }
  sum += currentGroup;
  
  return hasNumber ? sum : null;
};

// Extracts closest number following a keyword
const extractValueAfter = (text: string, regex: RegExp): string | null => {
  const match = text.match(regex);
  if (!match) return null;
  // Look at text after the match
  const afterText = text.substring(match.index! + match[0].length);
  // Match the first number-like chunk
  // E.g. "ek hazaar aath sau", "150", "200 kar do"
  // Let's just grab the next 3-4 words or until next keyword
  const nextWordsMatch = afterText.match(/^([a-z0-9\s]+?)(?:buying|selling|price|stock|alert|category|unit|\b(?:karo|kar do|hai)\b|$)/i);
  let snippet = afterText;
  if (nextWordsMatch) {
    snippet = nextWordsMatch[1];
  }
  
  const val = parseHybridNumber(snippet);
  if (val !== null) return val.toString();
  
  // fallback simple digit check in the immediate string
  const directDig = afterText.match(/\d+(\.\d+)?(k)?/i);
  if (directDig) {
      if (directDig[2]?.toLowerCase() === 'k') return (parseFloat(directDig[1]) * 1000).toString();
      return directDig[1];
  }
  return null;
};

export const parseProductVoice = (text: string): ParsedProduct => {
  const result: ParsedProduct = {};
  const t = text.toLowerCase();

  // Category Auto Match
  if (t.includes('grocery')) { result.category = 'Grocery'; }
  else if (t.includes('kapda') || t.includes('clothing') || t.includes('clothes')) { result.category = 'Clothing'; }
  else if (t.includes('dawai') || t.includes('medicine') || t.includes('medical')) { result.category = 'Medical'; }
  else if (t.includes('electronic') || t.includes('bijli')) { result.category = 'Electronics'; }
  else if (t.includes('beverage') || t.includes('peenay') || t.includes('drink')) { result.category = 'Beverages'; }
  
  // If keyword "category" is used and not matching above, maybe they said "category cosmetics"
  if (t.includes('category') && !result.category) {
      result.categoryWarning = true;
  }

  // Unit Auto Match
  if (/\b(kg|kilo|kilogram|kgm|kg s|killo)\b/i.test(t)) result.unit = 'kg';
  else if (/\b(piece|pcs|pis|piece|peece|pice|danay|dana)\b/i.test(t)) result.unit = 'pcs';
  else if (/\b(litre|liter|ltr|litr|liters)\b/i.test(t)) result.unit = 'ltr';
  else if (/\b(dozen|darjan|darjn|dozn)\b/i.test(t)) result.unit = 'dozen';
  else if (/\b(bori|bag|sack|pack|packs|thela|thali)\b/i.test(t)) result.unit = 'packs';
  else if (/\b(unit|units|unite|unt)\b/i.test(t)) result.unit = 'units';
  else if (/\b(gram|gr|gm|grams)\b/i.test(t)) result.unit = 'gram';

  // Pack Size
  // If it mentions like "5kg pack", "1 liter pack"
  const packMatch = t.match(/(\d+\s*(?:kg|l|liter|ml|g|gm|pcs))\s*(pack|size|wala)?/i);
  if (packMatch) {
      result.packSize = packMatch[1].replace(/\s+/g, '');
  }

  // Buying Price
  const bp = extractValueAfter(t, /\b(buying (price)?|kharid|khareed|leya|lia|liya|khred|kharidari)\b/i);
  if (bp) result.buyingPrice = bp;

  // Selling Price
  const sp = extractValueAfter(t, /\b(selling (price)?|bechne|farokht|sale price|becha|bechna|bechnay)\b/i);
  if (sp) result.sellingPrice = sp;

  // Opening Stock
  const stock = extractValueAfter(t, /\b(opening stock|stock|inventory|aaya|aya|shamil|dala|daalo)\b/i);
  if (stock) result.openingStock = stock;
  // Alternative: "50 kg aaya" -> stock = 50
  if (!result.openingStock) {
      const aayaMatch = t.match(/(\d+|\w+)\s+(?:kg|pcs|pack|units?)?\s*(?:aaya|aya|add)/i);
      if (aayaMatch) {
          const val = parseHybridNumber(aayaMatch[0]);
          if (val) result.openingStock = val.toString();
      }
  }

  // Low Stock Alert
  if (t.includes('low stock alert mat lagao') || t.includes('alert off')) {
      result.minThreshold = 'off';
  } else if (t.includes('low stock 5 percent') || t.includes('5 percent alert')) {
      if (result.openingStock) {
          result.minThreshold = Math.ceil(parseFloat(result.openingStock) * 0.05).toString();
      }
  } else {
      const alertMatch = extractValueAfter(t, /\b(low stock alert|alert|low stock)\b/i);
      if (alertMatch) result.minThreshold = alertMatch;
  }

  // Extract Name (everything before the first matched keyword)
  // Check for phrases like "naam badlo X"
  const nameOverride = t.match(/(?:naam badlo|name is|naam hai)\s+([a-zA-Z0-9\s]+?)(?:\b(?:category|unit|price|buying|selling|stock|alert|karo)\b|$)/i);
  if (nameOverride && nameOverride[1].trim()) {
      result.name = nameOverride[1].trim().replace(/\b\w/g, l => l.toUpperCase());
  } else {
      // Find the earliest index of any command keyword
      const kw = /\b(buying|selling|price|kharid|stock|alert|category|kg|piece|pcs|liter|dozen|bori|pack|karo|kar do)\b/i;
      const kwMatch = t.match(kw);
      let potentialName = t;
      if (kwMatch && kwMatch.index && kwMatch.index > 0) {
          potentialName = t.substring(0, kwMatch.index).trim();
      }
      
      // Remove trailing phrases like "karo", punctuation
      potentialName = potentialName.replace(/[,.]/g, '').trim();
      
      if (potentialName.length > 2) {
          // Capitalize Name
          result.name = potentialName.replace(/\b\w/g, l => l.toUpperCase());
      }
  }

  return result;
};
