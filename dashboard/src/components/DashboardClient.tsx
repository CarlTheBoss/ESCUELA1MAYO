'use client';

import { motion } from 'framer-motion';
import { Users, Calendar } from 'lucide-react';

interface DashboardStats {
  totalMujeres: number;
  totalHombres: number;
  recentAssignments: number;
}

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const statItems = [
    { label: 'Total Mujeres', value: stats.totalMujeres, icon: Users, color: 'var(--primary)' },
    { label: 'Total Publicadores', value: stats.totalHombres, icon: Users, color: 'var(--accent)' },
    { label: 'Asignaciones esta semana', value: stats.recentAssignments, icon: Calendar, color: 'var(--success)' },
  ];

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">Panel Principal</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Bienvenido al sistema de gestión de la escuela</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {statItems.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass glass-hover"
            style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'default' }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius)',
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color
            }}>
              <stat.icon size={30} />
            </div>
            <div>
              <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{stat.label}</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--foreground)' }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Actividad Reciente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '2rem', color: 'var(--secondary)', textAlign: 'center', fontSize: '0.95rem' }}>
            No hay actividad reciente para mostrar
          </div>
        </div>
      </div>
    </div>
  );
}
