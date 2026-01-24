'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserCircle, LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Mujeres Publicadoras', href: '/mujeres' },
  { icon: UserCircle, label: 'Publicadores', href: '/hombres' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-slate-800 flex flex-col p-6 z-40" style={{ width: '280px', background: 'var(--card-bg)', borderRight: '1px solid var(--card-border)' }}>
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LayoutDashboard color="white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
          Escuela
        </h1>
      </div>

      <nav className="flex-1 space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--primary)' : 'var(--secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600/10 rounded-xl"
                    style={{ background: 'rgba(59, 130, 246, 0.1)', position: 'absolute', inset: 0, borderRadius: '12px', zIndex: -1 }}
                  />
                )}
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white cursor-pointer transition-colors" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)', padding: '0.5rem 1rem' }}>
          <Settings size={20} />
          <span className="font-medium">Configuración</span>
        </div>
      </div>
    </aside>
  );
}
