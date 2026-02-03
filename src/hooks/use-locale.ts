import { useTranslation } from "react-i18next";

export const useLocale = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const localized = <T,>(en: T, ar: T): T => (isArabic ? ar : en);
  return { i18n, isArabic, localized };
};

