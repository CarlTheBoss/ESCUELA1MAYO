'use client';

import { useState, useEffect } from 'react';

interface WednesdayPickerProps {
  value: string;
  onChange: (date: string) => void;
  style?: React.CSSProperties;
}

export default function WednesdayPicker({ value, onChange, style }: WednesdayPickerProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear] = useState<number>(2026);
  const [isOpen, setIsOpen] = useState(false);

  // Función para obtener todos los miércoles de un mes específico
  const getWednesdaysOfMonth = (year: number, month: number): Date[] => {
    const wednesdays: Date[] = [];
    const date = new Date(year, month, 1);
    
    // Encontrar el primer miércoles del mes
    while (date.getDay() !== 3) { // 3 = miércoles
      date.setDate(date.getDate() + 1);
    }
    
    // Agregar todos los miércoles del mes
    while (date.getMonth() === month) {
      wednesdays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    
    return wednesdays;
  };

  const wednesdays = getWednesdaysOfMonth(selectedYear, selectedMonth);
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSelectDate = (date: Date) => {
    // Send date in YYYY-MM-DD format to match database format
    onChange(formatDateISO(date));
    setIsOpen(false);
  };

  // Handle both ISO string and YYYY-MM-DD format
  const getDisplayDate = (): string => {
    if (!value) return 'Seleccionar...';
    try {
      // Extract just the date part if it's an ISO string
      const dateStr = value.includes('T') ? value.split('T')[0] : value;
      const date = new Date(dateStr + 'T00:00:00');
      return formatDate(date);
    } catch {
      return 'Seleccionar...';
    }
  };

  const displayValue = getDisplayDate();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...style,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: '6px',
          border: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#9a7609';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
        }}
      >
        <span style={{ fontSize: '0.875rem' }}>{displayValue}</span>
        <span style={{ fontSize: '0.7rem', marginLeft: '8px' }}>▼</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(0,0,0,0.1)',
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown - Responsive */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              border: '2px solid var(--accent)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              zIndex: 1000,
              width: 'calc(100vw - 2rem)',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Selector de mes */}
            <div style={{ 
              padding: '1.25rem',
              borderBottom: '2px solid #e5e7eb',
              background: 'linear-gradient(135deg, var(--accent) 0%, #9a7609 100%)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                  disabled={selectedMonth === 0}
                  style={{
                    padding: '0.75rem',
                    background: selectedMonth === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                    color: selectedMonth === 0 ? 'rgba(255,255,255,0.5)' : 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedMonth === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    minWidth: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMonth !== 0) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMonth !== 0) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  ◀
                </button>
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {monthNames[selectedMonth]} {selectedYear}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}
                  disabled={selectedMonth === 11}
                  style={{
                    padding: '0.75rem',
                    background: selectedMonth === 11 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
                    color: selectedMonth === 11 ? 'rgba(255,255,255,0.5)' : 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedMonth === 11 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    minWidth: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMonth !== 11) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMonth !== 11) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Lista de miércoles - Scrollable */}
            <div style={{ 
              padding: '1rem',
              overflowY: 'auto',
              flex: 1,
            }}>
              {wednesdays.length === 0 ? (
                <div style={{ 
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '0.95rem',
                }}>
                  No hay miércoles en este mes
                </div>
              ) : (
                wednesdays.map((wednesday, index) => {
                  // Compare dates properly - extract YYYY-MM-DD from both
                  const wednesdayISO = formatDateISO(wednesday);
                  const valueDate = value ? (value.includes('T') ? value.split('T')[0] : value) : '';
                  const isSelected = wednesdayISO === valueDate;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDate(wednesday)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        textAlign: 'left',
                        background: isSelected 
                          ? 'linear-gradient(135deg, var(--accent) 0%, #9a7609 100%)' 
                          : '#f9fafb',
                        color: isSelected ? 'white' : '#1f2937',
                        border: isSelected ? '2px solid #9a7609' : '2px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                        fontWeight: isSelected ? '700' : '500',
                        transition: 'all 0.2s',
                        marginBottom: '0.75rem',
                        boxShadow: isSelected 
                          ? '0 4px 12px rgba(184, 139, 11, 0.3)' 
                          : '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#fffbeb'; // Light orange/yellow bg
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 139, 11, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f9fafb';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                        }
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ fontWeight: '700' }}>{formatDate(wednesday)}</span>
                        <span style={{ 
                          fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                          opacity: isSelected ? 0.9 : 0.6,
                          fontWeight: '600',
                          background: isSelected ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                        }}>
                          Miércoles
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
