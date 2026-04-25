import { KIRYANA_CATEGORIES, KIRYANA_DATABASE, getBrandStyle } from '../data/kiryanaDatabase';

export interface ValidationFeedback {
  isValid: boolean;
  message: string;
  recommendedCategory?: string;
  recommendedBrand?: string;
}

// Map keywords to specific category IDs (The 10 approved categories)
const CATEGORY_MAP: Record<string, string[]> = {
  'groceries': ['atta', 'flour', 'rice', 'wheat', 'daal', 'lentil', 'chana', 'maida', 'suji', 'oil', 'ghee', 'cooking', 'sugar', 'cheeni', 'salt', 'namak', 'masala', 'mirch', 'haldi', 'dhaniya', 'kisan', 'dalda', 'habib', 'sufi'],
  'beverages': ['tea', 'chai', 'coffee', 'juice', 'cola', 'pepsi', 'drink', 'water', 'rooh afza', 'cold drink', '7up', 'sprite', 'dew', 'fanta', 'pakola', 'sting', 'nestle', 'haleeb', 'good milk'],
  'snacks': ['biscuit', 'cookies', 'cake', 'rusk', 'wafer', 'nimco', 'chips', 'lays', 'chocolate', 'candy', 'toffee', 'gum', 'mint', 'kurkure', 'cheetos', 'slanty', 'cocomo', 'principle'],
  'dairy': ['milk', 'doodh', 'yoghurt', 'dahi', 'butter', 'makhan', 'cheese', 'cream', 'olpers', 'milkpak', 'adams'],
  'personal_care': ['shampoo', 'soap', 'sabun', 'lotion', 'face', 'wash', 'cream', 'toothpaste', 'paste', 'brush', 'lux', 'safe-guard', 'dettol', 'lifebuoy'],
  'household': ['surf', 'detergent', 'cleaner', 'phool', 'mortein', 'harpic', 'vim', 'tissue', 'wiper', 'broom', 'mop', 'ariel', 'brite', 'bonus'],
  'baby_products': ['diaper', 'pampers', 'baby', 'cerelac', 'formula', 'wipes', 'feeder', 'nido'],
  'tobacco': ['cigarette', 'pan', 'supari', 'gutka', 'gold leaf', 'capstan', 'match', 'box'],
  'medicines': ['panadol', 'disprin', 'calpol', 'vicks', 'bandage', 'strepsils', 'medicine', 'tablet', 'syrup', 'paracetamol', 'panadol-extra'],
};

const UNIT_MAP: Record<string, string[]> = {
  'ltr': ['ltr', 'litre', 'bottle', 'pet', 'juice', 'cola', 'pepsi', 'drink', 'water', 'shrbat', 'sting', 'dew', '7up', 'sprite', 'shangrila'],
  'kg': ['kg', 'kilo', 'gram', 'atta', 'flour', 'rice', 'wheat', 'daal', 'sugar', 'salt', 'namak', 'ghee', 'oil', 'dalda', 'kisan', 'habib'],
  'dozen': ['dozen', 'eggs', 'ande'],
  'pcs': ['pcs', 'piece', 'unit', 'pack', 'packet', 'sachet', 'wrapper', 'chocolate', 'biscuit', 'soap', 'sabun', 'shampoo'],
};

/**
 * Predicts the category from the product name by analyzing keyword frequencies
 */
export const guessCategory = (name: string): string => {
  const words = name.toLowerCase().split(/\s+/);
  
  for (const [catId, keywords] of Object.entries(CATEGORY_MAP)) {
    if (words.some(w => keywords.some(k => w.includes(k)))) {
      const matchedCat = KIRYANA_CATEGORIES.find(c => c.id === catId);
      if (matchedCat) return matchedCat.name;
    }
  }

  // Backup dictionary check
  const existing = KIRYANA_DATABASE.find(item => item.name.toLowerCase().includes(name.toLowerCase()));
  if (existing && existing.category) {
      // make sure it fits the new 10 categories
      const match = KIRYANA_CATEGORIES.find(c => c.name === existing.category || c.id === existing.category);
      if (match) return match.name;
  }

  return 'Others'; // fallback to uncategorized Generic
};

/**
 * Predicts the Unit from the product name
 */
export const guessUnit = (name: string): any => {
  const words = name.toLowerCase().split(/\s+/);
  for (const [unit, keywords] of Object.entries(UNIT_MAP)) {
    if (words.some(w => keywords.some(k => w.includes(k)))) return unit;
  }
  return 'pcs';
};

/**
 * Standardizes Brand input. If completely unknown, normalizes to 'Generic' or preserves input
 */
export const standardizeBrand = (brandInput: string): string => {
  const bs = getBrandStyle(brandInput);
  if (bs.abbr === '??' && !brandInput.trim()) return 'Generic';
  return brandInput.trim() || 'Generic';
};

/**
 * Validates if the selected category fits the product name or the brand properly.
 * E.g., Dalda cannot be a Biscuit.
 */
export const validateProductEntry = (name: string, category: string, brand: string): ValidationFeedback => {
  const suggestedCategory = guessCategory(name);
  
  // Rule 1: Strong Brand Mismatches
  const lowerBrand = brand.toLowerCase();
  const lowerCat = category.toLowerCase();
  
  if (lowerBrand.includes('dalda') && lowerCat.includes('snack')) {
    return { isValid: false, message: 'Dalda brand mainly makes Groceries/Oil, not Snacks. Please double check.' };
  }
  if (lowerBrand.includes('shan') && lowerCat.includes('dairy')) {
    return { isValid: false, message: 'Shan Foods makes Groceries (Spices), not Dairy products. Are you sure?' };
  }
  
  // Rule 2: If the assigned category entirely misses the predicted one
  if (suggestedCategory !== 'Others' && suggestedCategory !== category) {
    if (category === 'Others' || category === 'Miscellaneous' || category === '') {
      return { 
        isValid: false, 
        message: `It seems like "${name}" belongs in "${suggestedCategory}".`, 
        recommendedCategory: suggestedCategory 
      };
    }
  }
  
  return { isValid: true, message: 'Looks good' };
};
