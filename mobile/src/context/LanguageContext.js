import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await AsyncStorage.getItem('user-locale');
      if (savedLocale) {
        i18n.locale = savedLocale;
        setLocale(savedLocale);
      }
    };
    loadLocale();
  }, []);

  const changeLanguage = async (newLocale) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
    await AsyncStorage.setItem('user-locale', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t: (key) => i18n.t(key) }}>
      {children}
    </LanguageContext.Provider>
  );
};
