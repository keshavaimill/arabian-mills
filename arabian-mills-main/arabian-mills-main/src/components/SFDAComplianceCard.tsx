import { useLocale } from "@/hooks/use-locale";

const complianceConfigs = [
  {
    label: { en: "Certificate renewals", ar: "تجديد الشهادات" },
    status: { en: "On track", ar: "على المسار" },
    detail: { en: "12 / 12 plants cleared", ar: "١٢ من ١٢ مصنعاً معتمدًا" },
    statusColor: "text-green-600",
  },
  {
    label: { en: "Batch traceability", ar: "تتبع الدُفعات" },
    status: { en: "Green", ar: "ممتاز" },
    detail: { en: "98.5% lot linkage captured", ar: "٩٨٫٥٪ من الربط متحقق" },
    statusColor: "text-green-600",
  },
  {
    label: { en: "Temperature excursions", ar: "انحرافات الحرارة" },
    status: { en: "2 alerts", ar: "إنذاران" },
    detail: { en: "Medina cold chain flagged", ar: "تنبيه في سلسلة تبريد المدينة" },
    statusColor: "text-amber-600",
  },
  {
    label: { en: "Write-off ratio", ar: "نسبة الإتلاف" },
    status: { en: "0.8%", ar: "٠٫٨٪" },
    detail: { en: "Below SFDA guidance of 1.5%", ar: "أقل من توجيه الهيئة ١٫٥٪" },
    statusColor: "text-green-600",
  },
];

export const SFDAComplianceCard = () => {
  const { localized } = useLocale();

  return (
    <div className="section-shell p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">SFDA</p>
        <h3 className="text-xl font-semibold mt-1">
          {localized("Food & Drug Authority readiness", "جاهزية هيئة الغذاء والدواء")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {localized(
            "Compliance telemetry for batch hygiene, documentation and write-offs",
            "مؤشرات الامتثال لنظافة الدُفعات والتوثيق ونسب الإتلاف"
          )}
        </p>
      </div>
      <div className="space-y-3">
        {complianceConfigs.map((item) => (
          <div
            key={item.label.en}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/80 px-4 py-3 hover:shadow-card transition-all duration-200 hover-lift transform-gpu"
            style={{ willChange: "transform" }}
          >
            <div>
              <p className="text-sm font-semibold">{localized(item.label.en, item.label.ar)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {localized(item.detail.en, item.detail.ar)}
              </p>
            </div>
            <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${item.statusColor}`}>
              {localized(item.status.en, item.status.ar)}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-border/60">
        <p className="text-xs text-muted-foreground text-center">
          🇸🇦 {localized("Vision 2030 · National Industrial Strategy aligned", "رؤية ٢٠٣٠ · متوافق مع الاستراتيجية الصناعية الوطنية")}
        </p>
      </div>
    </div>
  );
};

