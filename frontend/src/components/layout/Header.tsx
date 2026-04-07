'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';

import { useSiteConfig } from '@/lib/SiteConfigContext';
import { toPhoneHref } from '@/lib/phone';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    href: '/catalog',
    label: 'Collections',
    children: [
      { href: '/catalog/products', label: 'All Products' },
      { href: '/catalog/artscut-zero', label: 'Artscut Zero' },
      { href: '/catalog/portofino-porcelain', label: 'Portofino Porcelain' },
      { href: '/catalog/ultra-thin-surfaces', label: 'Ultra Thin Surfaces' },
    ],
  },
  { href: '/projects', label: 'Projects' },
  { href: '/showroom', label: 'Showroom' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const config = useSiteConfig();

  const transparentRoutes = new Set([
    '/',
    '/about',
    '/catalog',
    '/projects',
    '/showroom',
    '/blog',
    '/contact',
  ]);
  const pathSegments = pathname.split('/').filter(Boolean);
  const isCatalogRoute = pathSegments[0] === 'catalog';
  const isCatalogProductRoute = isCatalogRoute && pathSegments.length >= 4;
  const allowTransparentHeader =
    !isCatalogProductRoute &&
    (transparentRoutes.has(pathname) || pathname.startsWith('/catalog'));
  const useSolidHeader = isScrolled || !allowTransparentHeader;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          useSolidHeader
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-stone-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20 lg:h-22">
            {/* Logo */}
            <Link href="/" prefetch className="relative z-10 flex items-center gap-3 flex-shrink-0 min-w-0 max-w-[200px] sm:max-w-none">
              <div className="flex flex-col min-w-0">
                <span className={`font-display text-lg sm:text-2xl font-bold tracking-tight transition-colors duration-300 truncate ${
                  useSolidHeader ? 'text-stone-900' : 'text-white'
                }`}>
                  {config.companyName}
                </span>
                <span className={`text-[9px] sm:text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${
                  useSolidHeader ? 'text-stone-500' : 'text-white/70'
                }`}>
                  Premium Benchtops
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    prefetch
                    className={`px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 flex items-center gap-1 ${
                      useSolidHeader
                        ? 'text-stone-700 hover:text-stone-900'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>

                  {/* Dropdown */}
                  {link.children && (
                    <AnimatePresence>
                      {activeDropdown === link.href && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 pt-2"
                        >
                          <div className="bg-white rounded-lg shadow-xl shadow-stone-900/10 border border-stone-100 py-2 min-w-[200px]">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                prefetch
                                className="block px-5 py-2.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={toPhoneHref(config.phone)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                  useSolidHeader ? 'text-stone-700 hover:text-accent-gold' : 'text-white/90 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                {config.phone}
              </a>
              <Link href="/contact" prefetch className="btn-primary !py-2.5 !px-6 !text-xs">
                Get a Quote
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`lg:hidden relative z-10 p-2 transition-colors ${
                isMobileOpen ? 'text-stone-900' : useSolidHeader ? 'text-stone-900' : 'text-white'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-white">
              <div className="flex flex-col pt-24 pb-8 px-6 h-full overflow-y-auto">
                {navLinks.map((link) => (
                  <div key={link.href} className="border-b border-stone-100">
                    <Link
                      href={link.href}
                      prefetch
                      className="block py-4 text-lg font-medium text-stone-900 hover:text-accent-gold transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 pb-3">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            prefetch
                            className="block py-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-auto pt-8 space-y-4">
                  <a href={toPhoneHref(config.phone)} className="btn-secondary w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call {config.phone}
                  </a>
                  <Link
                    href="/contact"
                    prefetch
                    className="btn-primary w-full"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
