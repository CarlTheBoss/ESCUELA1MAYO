'use client';

import { motion } from 'framer-motion';
import { Users, Calendar, UserCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalMujeres: number;
  totalHombres: number;
  recentAssignments: number;
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const statItems = [
    { 
      label: 'Publicadoras', 
      subtitle: 'Hermanas registradas',
      value: stats.totalMujeres, 
      icon: Users, 
      color: 'var(--primary)',
      href: '/mujeres',
      actionLabel: 'Ver lista'
    },
    { 
      label: 'Publicadores', 
      subtitle: 'Hermanos registrados',
      value: stats.totalHombres, 
      icon: UserCheck, 
      color: 'var(--accent)',
      href: '/hombres',
      actionLabel: 'Ver lista'
    },
    { 
      label: 'Asignaciones Recientes', 
      subtitle: 'Últimos 7 días',
      value: stats.recentAssignments, 
      icon: Calendar, 
      color: 'var(--success)',
      href: null,
      actionLabel: null
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Panel Principal</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Gestión y seguimiento de la escuela
          </p>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        {statItems.map((stat, index) => {
          const content = (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'var(--muted-bg)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                flexShrink: 0
              }}>
                <stat.icon size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ 
                  color: 'var(--secondary)', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  fontWeight: '600' 
                }}>
                  {stat.label}
                </span>
                <p style={{ 
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', 
                  fontWeight: '800', 
                  color: 'var(--foreground)',
                  lineHeight: '1.1',
                  margin: '0.2rem 0'
                }}>
                  {stat.value}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{stat.subtitle}</span>
              </div>
              {stat.href && (
                <div style={{ 
                  color: 'var(--secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'var(--muted-bg)'
                }}>
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          );

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass glass-hover"
              style={{ 
                padding: '1.25rem', 
                borderRadius: '12px', 
                cursor: stat.href ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              {stat.href ? (
                <Link href={stat.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Accesos Rápidos para Móviles */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--foreground)' }}>
          Acceso Rápido
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Link 
            href="/mujeres" 
            className="btn btn-secondary" 
            style={{ justifyContent: 'space-between', padding: '0.85rem 1rem', width: '100%', fontSize: '0.95rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--primary)" />
              Gestionar Publicadoras
            </span>
            <ArrowRight size={16} />
          </Link>
          <Link 
            href="/hombres" 
            className="btn btn-secondary" 
            style={{ justifyContent: 'space-between', padding: '0.85rem 1rem', width: '100%', fontSize: '0.95rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--accent)" />
              Gestionar Publicadores
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Actividad / Estado */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--foreground)' }}>
          Información del Sistema
        </h2>
        <div style={{ padding: '1rem', background: 'var(--muted-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Las asignaciones se registran automáticamente para las reuniones de entre semana. Puedes actualizar o registrar nuevas asignaciones ingresando a cada sección.
        </div>
      </div>
    </div>
  );
}
