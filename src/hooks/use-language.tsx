import * as React from "react";
import { Language, translations, TranslationKeys, defaultLanguage } from "@/i18n/translations";

interface LanguageContextType {
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language is fixed to 'id'
  const language: Language = defaultLanguage;

  const t = React.useCallback((key: TranslationKeys, replacements: Record<string, string | number> = {}) => {
    let text = translations[language][key] || key;
    
    // Simple replacement logic
    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replace(`{${placeholder}}`, String(value));
    }
    
    return text;
  }, []); // Dependency array is empty as language is fixed

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};