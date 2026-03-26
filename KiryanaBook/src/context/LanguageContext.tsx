import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'English' | 'Urdu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  English: {
    dashboard_title: 'Assalam o Alaikum',
    today_balance: 'Today\'s Balance',
    cash_in: 'CASH IN',
    cash_out: 'CASH OUT',
    udhaar: 'Udhaar',
    customers: 'Customers',
    quick_actions: 'Quick Actions',
    weekly_hisaab: 'Weekly Hisaab',
    urgent_udhaar: 'Urgent Udhaar',
    recent_activity: 'Recent Activity',
    settings: 'Settings',
    dark_mode: 'Dark Mode',
    language: 'Language',
    sync_now: 'Sync Now',
    change_pin: 'Change PIN',
    biometric_login: 'Biometric Login',
    delete_protection: 'Delete Protection',
    delete_account: 'Delete Account',
    auto_lock_timer: 'Auto-Lock Timer',
    help_support: 'Help & Support',
    my_shop: 'MY SHOP',
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    amount: 'Amount',
    customer_name: 'Customer Name',
    add_sale: 'Add Cash Sale',
    add_expense: 'Add Expense',
    today_balance_label: 'Aaj Ka Balance'
  },
  Urdu: {
    dashboard_title: 'السلام وعلیکم',
    today_balance: 'آج کا بیلنس',
    cash_in: 'کیش ان',
    cash_out: 'کیش آؤٹ',
    udhaar: 'ادھار',
    customers: 'گاہک',
    quick_actions: 'تیز کام',
    weekly_hisaab: 'ہفتہ وار حساب',
    urgent_udhaar: 'ضروری ادھار',
    recent_activity: 'آج کی سرگرمی',
    settings: 'سیٹنگز',
    dark_mode: 'ڈارک موڈ',
    language: 'زبان',
    sync_now: 'سنک کریں',
    change_pin: 'پن تبدیل کریں',
    biometric_login: 'بائیومیٹرک لاگ ان',
    delete_protection: 'ڈیلیٹ پروٹیکشن',
    delete_account: 'اکاؤنٹ ڈیلیٹ کریں',
    auto_lock_timer: 'آٹو لاک ٹائمر',
    help_support: 'مدد اور سپورٹ',
    my_shop: 'میری دکان',
    search: 'تلاش کریں',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    amount: 'رقم',
    customer_name: 'گاہک کا نام',
    add_sale: 'نقد فروخت',
    add_expense: 'خرچہ لکھیں',
    today_balance_label: 'Aaj Ka Balance'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'English';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    // Set RTL for Urdu
    if (language === 'Urdu') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.lang = 'ur';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.lang = 'en';
    }
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
};
