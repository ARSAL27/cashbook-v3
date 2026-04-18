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
    dashboard_title: 'Assalam-o-Alaikum',
    today_balance: 'Aaj Ka Balance',
    cash_in: 'Cash In',
    cash_out: 'Cash Out',
    udhaar: 'Udhaar',
    customers: 'Gahak',
    quick_actions: 'Tez Kaam',
    weekly_hisaab: 'Hafte-war Hisaab',
    urgent_udhaar: 'Zaroori Udhaar',
    recent_activity: 'Aaj Ki Sargarmi',
    settings: 'Settings',
    dark_mode: 'Dark Mode',
    language: 'Zuban',
    sync_now: 'Sync Karein',
    change_pin: 'PIN Badlein',
    biometric_login: 'Biometric Login',
    delete_protection: 'Delete Hifazat',
    delete_account: 'Account Khatam Karein',
    auto_lock_timer: 'Auto-Lock Time',
    help_support: 'Madad aur Support',
    my_shop: 'Meri Dukan',
    search: 'Talash Karein',
    save: 'Mehfooz Karein',
    cancel: 'Chorein',
    amount: 'Raqam',
    customer_name: 'Gahak Ka Naam',
    add_sale: 'Naqad Sale',
    add_expense: 'Kharcha Likhein',
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
