'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Users, UserCircle, LayoutDashboard, Settings, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Publicadoras', href: '/mujeres' },
  { icon: UserCircle, label: 'Publicadores', href: '/hombres' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  // Sincronizar tema con localStorage y atributo html
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setIsDark(currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LayoutDashboard color="white" size={18} />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--foreground)' }}>Escuela</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--foreground)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#64748b" />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--foreground)' }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LayoutDashboard color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
            Escuela
          </h1>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    color: isActive ? 'var(--primary)' : 'var(--secondary)',
                    background: isActive ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      style={{ background: '#eff6ff', position: 'absolute', inset: 0, borderRadius: 'var(--radius)', zIndex: -1 }}
                    />
                  )}
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div 
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--secondary)',
              padding: '10px 12px',
              cursor: 'pointer',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
            className="glass-hover"
          >
            {isDark ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} />}
            <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </div>

          <div 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--secondary)',
              padding: '10px 12px',
              cursor: 'pointer',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--secondary)';
            }}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>
    </>
  );
}
