import { Navigation } from '@/components/Navigation';
import { StatsBar } from '@/components/StatsBar';
import { KPICard } from '@/components/KPICard';
import { RiskRadar } from '@/components/RiskRadar';
import { SeasonalityChart } from '@/components/SeasonalityChart';
import { AlertCard } from '@/components/AlertCard';
import { ImpactDashboard } from '@/components/ImpactDashboard';
import { TextSqlHelper } from '@/components/TextSqlHelper';
import { SFDAComplianceCard } from '@/components/SFDAComplianceCard';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Target,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Award
} from 'lucide-react';
import heroBackground from '@/assets/hero-bg.jpg';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import {
  computeKingdomWideStockoutRiskIndex,
  computeMAPE,
  getHighRiskMaterials,
  getAverageDaysCoverage,
  getInventoryHealthDistribution,
  getDeviationRatio
} from '@/lib/inventory-kpis';
import { getInventoryForecastRecords } from '@/lib/inventory-data';

const Index = () => {
  const { t } = useTranslation();
  const { isArabic, localized } = useLocale();

  const materials = getInventoryForecastRecords();

  const riskIndex = computeKingdomWideStockoutRiskIndex(materials);
  const { highRisk7d } = getHighRiskMaterials(materials);
  const avgCoverage = getAverageDaysCoverage(materials);
  const healthBuckets = getInventoryHealthDistribution(materials);

  const mape = computeMAPE(
    materials.map((m) => m.historical_daily_avg),
    materials.map((m) => m.implied_daily_avg)
  );
  const accuracy = Math.max(0, Math.min(100, 100 - mape));

  const avgDeviationRatio =
    materials.length > 0
      ? materials.reduce((acc, r) => acc + getDeviationRatio(r), 0) / materials.length
      : 0;

  const highRiskBucket = healthBuckets.find((b) => b.label === '4-7');

  const kpiConfigs = [
    {
      title: {
        en: 'Nationwide Stockout Risk Index',
        ar: 'مؤشر مخاطر نفاد المخزون على مستوى الوطن'
      },
      value: riskIndex.index.toFixed(1),
      subtitle: {
        en: `${highRisk7d.length} materials at high risk (7 days)`,
        ar: `${highRisk7d.length} مواد عالية المخاطر خلال ٧ أيام`
      },
      icon: AlertTriangle,
      status: 'warning' as const,
      trend: {
        en: `Avg coverage: ${avgCoverage.toFixed(1)} days`,
        ar: `متوسط التغطية: ${avgCoverage.toFixed(1)} يوم`,
        isPositive: false
      },
      sparklineData: [2.1, 2.3, 2.8, 3.0, 3.2, 3.5, 3.2]
    },
    {
      title: {
        en: 'Ramadan Forecast Accuracy',
        ar: 'دقة توقعات رمضان'
      },
      value: `${accuracy.toFixed(1)}%`,
      subtitle: {
        en: `Error (MAPE): ${mape.toFixed(1)}%`,
        ar: `معدل الخطأ (MAPE): ${mape.toFixed(1)}٪`
      },
      icon: Target,
      status: 'success' as const,
      trend: {
        en: `Demand deviation ~${avgDeviationRatio.toFixed(2)}×`,
        ar: `انحراف الطلب ~${avgDeviationRatio.toFixed(2)}×`,
        isPositive: avgDeviationRatio <= 1.1
      },
      sparklineData: [89, 90, 91, 92, 93, 93.5, 94.2]
    },
    {
      title: {
        en: 'Lost Sales (SAR)',
        ar: 'المبيعات المفقودة (ريال)'
      },
      value: '1.2M',
      subtitle: {
        en: 'Prevented this month',
        ar: 'تم تجنبها هذا الشهر'
      },
      icon: TrendingDown,
      status: 'danger' as const,
      trend: {
        en: '-35% vs last month',
        ar: '-٣٥٪ مقارنة بالشهر الماضي',
        isPositive: true
      },
      sparklineData: [2.5, 2.2, 1.9, 1.6, 1.4, 1.3, 1.2]
    },
    {
      title: {
        en: 'Emergency Procurement Cost',
        ar: 'تكلفة المشتريات الطارئة'
      },
      value: 'SAR 450K',
      subtitle: {
        en: 'Port delays: Dammam +7d',
        ar: 'تأخيرات الموانئ: الدمام +٧ أيام'
      },
      icon: DollarSign,
      status: 'warning' as const,
      trend: {
        en: '+12% port delays',
        ar: '+١٢٪ تأخير في الموانئ',
        isPositive: false
      },
      sparklineData: [380, 390, 410, 420, 430, 445, 450]
    },
    {
      title: {
        en: 'SFDA Compliance Score',
        ar: 'درجة امتثال هيئة الغذاء والدواء'
      },
      value: '98.5%',
      subtitle: {
        en: 'All certifications valid',
        ar: 'جميع الشهادات سارية'
      },
      icon: CheckCircle2,
      status: 'success' as const,
      trend: {
        en: '+0.3% this quarter',
        ar: '+٠٫٣٪ هذا الربع',
        isPositive: true
      },
      sparklineData: [97.8, 97.9, 98.0, 98.2, 98.3, 98.4, 98.5]
    },
    {
      title: {
        en: 'Vision 2030 Impact',
        ar: 'أثر رؤية ٢٠٣٠'
      },
      value: '8.4/10',
      subtitle: {
        en: 'Composite efficiency gauge',
        ar: 'مؤشر الكفاءة المركب'
      },
      icon: Award,
      status: 'success' as const,
      trend: {
        en: '+0.6 score increase',
        ar: '+٠٫٦ زيادة في المؤشر',
        isPositive: true
      },
      sparklineData: [7.2, 7.5, 7.8, 8.0, 8.1, 8.3, 8.4]
    }
  ];

  const kpiData = kpiConfigs.map((item) => ({
    title: localized(item.title.en, item.title.ar),
    titleAr: isArabic ? undefined : item.title.ar,
    value: item.value,
    subtitle: localized(item.subtitle.en, item.subtitle.ar),
    icon: item.icon,
    status: item.status,
    trend: item.trend
      ? { value: localized(item.trend.en, item.trend.ar), isPositive: item.trend.isPositive }
      : undefined,
    sparklineData: item.sparklineData
  }));

  const alerts = [
    {
      type: 'critical' as const,
      title: localized('Wheat Type A', 'قمح النوع أ'),
      location: localized('Riyadh Plant', 'مصنع الرياض'),
      details: localized(
        'Will stockout in 6 days. Customs delay at Dammam Port (Delay Index: High)',
        'سيتعرض للنفاد خلال ٦ أيام. تأخير جمركي في ميناء الدمام (مؤشر التأخير: مرتفع)'
      ),
      recommendation: localized('Advance PO by 2,400 tons', 'تقديم أمر الشراء بمقدار ٢٤٠٠ طن'),
      actions: [
        { label: localized('View Details', 'عرض التفاصيل'), variant: 'outline' as const },
        { label: localized('Create PO', 'إصدار أمر شراء'), variant: 'default' as const }
      ]
    },
    {
      type: 'opportunity' as const,
      title: localized('Western Region Demand Surge', 'ارتفاع الطلب في المنطقة الغربية'),
      location: localized('Jeddah & Makkah', 'جدة ومكة'),
      details: localized(
        'Umrah season spike predicted for next 14 days. +18% increase detected in Western Region.',
        'متوقع زيادة بسبب موسم العمرة خلال ١٤ يومًا. تم رصد زيادة ١٨٪ في المنطقة الغربية.'
      ),
      recommendation: localized('Increase production shift', 'زيادة وردية الإنتاج'),
      actions: [
        { label: localized('Adjust Forecast', 'تعديل التوقعات'), variant: 'default' as const }
      ]
    },
    {
      type: 'warning' as const,
      title: localized('SKU: 10kg Flour Under-Production', 'الصنف: دقيق ١٠ كجم أقل من الخطة'),
      location: localized('Jeddah Plant', 'مصنع جدة'),
      details: localized(
        'Production trailing plan by 14% with demand pivoting to Western DC.',
        'الإنتاج أقل من الخطة بنسبة ١٤٪ مع تحول الطلب إلى مركز توزيع الغرب.'
      ),
      recommendation: localized(
        'Activate overtime crew and re-route Riyadh surplus',
        'تشغيل فريق العمل الإضافي وإعادة توجيه فائض الرياض'
      ),
      actions: [
        { label: localized('Balance Plan', 'موازنة الخطة'), variant: 'outline' as const }
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full">
      <Navigation />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center px-4 sm:px-6 lg:px-10 xl:px-16 pt-6 sm:pt-10 pb-8 sm:pb-16"
      >
        <div className="section-shell relative overflow-hidden w-full max-w-[1700px] mx-auto">
          <div
            className="absolute inset-0 opacity-50 transition-opacity duration-500 ease-out"
            style={{
              backgroundImage: `url(${heroBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'opacity'
            }}
          />
          <div className="relative z-10 grid gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <div className="pill text-[10px] sm:text-[11px] px-3 sm:px-4 py-1">
                  <span>{localized('Vision 2030', 'رؤية ٢٠٣٠')}</span>
                  <span className="text-saudi-green font-bold">{localized('AI Ready', 'جاهز بالذكاء الاصطناعي')}</span>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground mb-3 sm:mb-4">
                  {localized('Operations OS', 'منصة العمليات')}
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-balance">
                  {t('hero_title')}
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {t('hero_subtitle')}
              </p>
            </div>
            <div className="surface-muted p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {localized('Updated 2 min ago', 'آخر تحديث منذ دقيقتين')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {kpiData.slice(0, 4).map((kpi, index) => (
                  <KPICard key={kpi.title} {...kpi} index={index} compact />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8 lg:py-12">
        <div className="w-full max-w-[1700px] mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
        <StatsBar />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={kpi.title} {...kpi} index={index} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          <RiskRadar />
          <SeasonalityChart />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <div className="lg:col-span-2 section-shell p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground mb-2">
                  {localized('Signals', 'إشعارات')}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  {localized('Early Warning Center', 'مركز الإنذار المبكر بالذكاء الاصطناعي — نسخة المملكة')}
                </h2>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {localized('Synced: 2 minutes ago', 'آخر مزامنة: قبل دقيقتين')}
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {alerts.map((alert, index) => (
                <AlertCard key={index} {...alert} index={index} />
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ImpactDashboard />
            {/* <SFDAComplianceCard /> */}
          </div>
        </section>

        <TextSqlHelper
          title={localized('Text-to-SQL · Executive Overview', 'مساعد الاستعلام النصي · النظرة التنفيذية')}
          examples={
            isArabic
              ? [
                  'أظهر المواد المعرضة للخطر بسبب تأخيرات الجمارك في ميناء الدمام',
                  'ما مؤشرات الأداء التي أثرت على مؤشر رؤية ٢٠٣٠ هذا الأسبوع؟',
                  'سجّل إجراءات امتثال هيئة الغذاء والدواء المطلوبة لمصنع جدة'
                ]
              : [
                  'Show materials at risk due to customs delays in Dammam Port',
                  'Which KPIs moved the Vision 2030 efficiency score this week?',
                  'List SFDA compliance actions required by Jeddah plant'
                ]
          }
        />
        </div>
      </div>
    </div>
  );
};

export default Index;
