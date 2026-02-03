import { useMemo, useState } from 'react';
import { Clock, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from './NavLink';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLocale } from '@/hooks/use-locale';

export const Navigation = () => {
  const { localized } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: localized('Executive', 'التنفيذي'), to: '/' },
    { label: localized('Raw Materials', 'المواد الخام'), to: '/materials' },
    { label: localized('Finished Goods', 'المنتجات النهائية'), to: '/finished-goods' }
  ];

  const currentTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/80"
    >
      <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-2">
        <div className="section-shell px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border border-border/70 bg-white/70 flex items-center justify-center shadow-card overflow-hidden transition-transform duration-200 hover:scale-105 flex-shrink-0" style={{ willChange: 'transform' }}>
              <img 
                src="/SA.jpg" 
                alt="Saudi Arabia Flag" 
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ willChange: 'opacity' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] text-muted-foreground truncate">{localized('Arabian Mills', 'المطاحن العربية')}</p>
              <h1 className="text-sm sm:text-lg font-semibold truncate">{localized('Command Center', 'مركز القيادة')}</h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-muted-foreground transition-all duration-200 hover:bg-white/70 hover:text-foreground hover:scale-105"
                activeClassName="bg-foreground text-white shadow-card font-medium"
                style={{ willChange: 'transform' }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80 font-mono">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">AST {currentTime}</span>
            </div>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Button className="hidden sm:inline-flex rounded-full bg-foreground text-white px-4 sm:px-6 text-xs sm:text-sm">
              {localized('Talk to Us', 'تواصل معنا')}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="section-shell mt-2 px-4 py-4 space-y-3">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-mono">
                    <Clock className="w-4 h-4" />
                    <span>AST {currentTime}</span>
                  </div>
                  <LanguageSwitcher />
                </div>
                
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-white/70 hover:text-foreground"
                      activeClassName="bg-foreground text-white shadow-card font-medium"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                <Button className="w-full rounded-xl bg-foreground text-white py-3 mt-3">
                  {localized('Talk to Us', 'تواصل معنا')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
