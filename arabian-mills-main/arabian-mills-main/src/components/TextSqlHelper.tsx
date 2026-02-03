import { Lightbulb, Sparkles } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

interface TextSqlHelperProps {
  title?: string;
  examples: string[];
}

export const TextSqlHelper = ({ title = "Text-to-SQL Assistant", examples }: TextSqlHelperProps) => (
  <HelperContent title={title} examples={examples} />
);

const HelperContent = ({ title, examples }: TextSqlHelperProps) => {
  const { localized } = useLocale();

  return (
    <div className="section-shell px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 max-w-8xl mx-auto">
      <div className="flex items-center gap-2">
        <div
          className="rounded-xl sm:rounded-2xl bg-primary/10 p-1.5 sm:p-2 transition-transform duration-200 hover:scale-105 flex-shrink-0"
          style={{ willChange: 'transform' }}
        >
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground">
            {localized("Text-to-SQL", "الاستعلام النصي")}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{title}</p>
        </div>
      </div>
      <ul className="space-y-1.5 sm:space-y-2">
        {examples.map((example) => (
          <li
            key={example}
            className="group rounded-full border border-slate-100 bg-white/70 px-3 sm:px-4 py-1.5 sm:py-2 leading-relaxed text-[11px] sm:text-xs md:text-sm text-muted-foreground hover:border-primary/40 hover:bg-white hover:text-foreground transition-all duration-200 hover-lift transform-gpu cursor-pointer"
            style={{ willChange: 'transform' }}
          >
            <span className="text-primary/70 group-hover:text-primary break-words">{example}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

