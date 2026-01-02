import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const LANGUAGE_DETECTOR = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const language = await AsyncStorage.getItem("user-language");
      if (language) {
        return callback(language);
      }
      // Default to Arabic
      return callback("ar");
    } catch (error) {
      return callback("ar");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem("user-language", language);
    } catch (error) {
      console.error("Error saving language", error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Update RTL based on language
i18n.on("languageChanged", (lng) => {
  const isRTL = lng === "ar";
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
});

export default i18n;
