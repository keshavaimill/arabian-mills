import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {languages.map((language) => (
        <Button
          key={language.code}
          variant={i18n.language === language.code ? "default" : "outline"}
          size="sm"
          onClick={() => handleChange(language.code)}
          className="rounded-full border-border/70 bg-white/70 px-2.5 sm:px-4 text-xs sm:text-sm transition-all duration-200 hover:scale-105 h-8 sm:h-9"
          style={{ willChange: "transform" }}
        >
          {language.label}
        </Button>
      ))}
    </div>
  );
};

