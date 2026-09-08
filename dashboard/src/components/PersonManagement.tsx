'use client';

import { useState, useEffect } from 'react';
import { Persona, Sala, RolMujer, RolHombre } from '@/types';
import { Plus, Search, Trash2, ChevronDown, ChevronUp, Calendar, User, Clock, MessageSquare, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPersona, updatePersona, deletePersona } from '@/app/actions';
import { useRouter } from 'next/navigation';
import WednesdayPicker from './WednesdayPicker';

interface PersonManagementProps {
  title: string;
  initialData: Persona[];
  roleOptions: (RolMujer | RolHombre)[];
  tipo: 'MUJER' | 'HOMBRE';
}

export default function PersonManagement({ title, initialData, roleOptions, tipo }: PersonManagementProps) {
  const [data, setData] = useState<Persona[]>(initialData);
  const [editingPerson, setEditingPerson] = useState<Persona | null>(null); // Track editing state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'fecha-antigua' | 'fecha-reciente'>('nombre');
  const [filterRole, setFilterRole] = useState<string>('Todos');
  const router = useRouter();

  const emptyForm: Persona = {
    id: '',
    nombre: '',
    apellido: '',
    fechaUltimaAsignacion: new Date().toISOString().split('T')[0],
    sala: 'A',
    rol: roleOptions[0],
    frecuencia: '',
    observacion: '',
    ultimoDiscurso5Min: '',
    salaUltimoDiscurso: undefined
  };

  const filteredData = data
    .filter(person => {
      const matchesSearch = person.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            person.apellido.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesRole = true;
      if (filterRole === 'Todos') {
        matchesRole = true;
      } else if (filterRole === 'Discurso') {
        // Mostrar si tiene el rol 'Discurso' O si tiene fecha en ultimoDiscurso5Min
        matchesRole = person.rol === 'Discurso' || (!!person.ultimoDiscurso5Min && person.ultimoDiscurso5Min.trim() !== '');
      } else {
        matchesRole = person.rol === filterRole;
      }

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      // Si estamos filtrando por Discurso, ordenar por fecha de último discurso por defecto
      if (filterRole === 'Discurso') {
        const dateA = a.ultimoDiscurso5Min ? new Date(a.ultimoDiscurso5Min).getTime() : 0;
        const dateB = b.ultimoDiscurso5Min ? new Date(b.ultimoDiscurso5Min).getTime() : 0;
        return dateA - dateB; // Más antiguo primero
      }

      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'fecha-antigua':
          return new Date(a.fechaUltimaAsignacion).getTime() - new Date(b.fechaUltimaAsignacion).getTime();
        case 'fecha-reciente':
          return new Date(b.fechaUltimaAsignacion).getTime() - new Date(a.fechaUltimaAsignacion).getTime();
        default:
          return 0;
      }
    });

  const handleCreateNew = async () => {
    try {
      await createPersona(emptyForm, tipo);
      router.refresh();
    } catch (error) {
      console.error('Error creating:', error);
      alert('Error al crear registro');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await deletePersona(id);
        setData(data.filter(p => p.id !== id));
        router.refresh();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Error al eliminar');
      }
    }
  };

  // Helper function to safely parse date strings
  const parseDateString = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();
    
    // If it's already in YYYY-MM-DD format from input[type="date"]
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  };

  // Helper to abbreviate role
  const abbreviateRole = (role: string) => {
    switch (role) {
      case 'Publicador': return 'Pub.';
      case 'Publicadora': return 'Pub.';
      case 'Acompañante': return 'Acom.';
      case 'Discurso': return 'Disc.';
      case 'Lectura Bíblica': return 'Lec. B.';
      default: return role.substring(0, 4) + '.';
    }
  };

  // Handle field changes without saving (just update editing state)
  const handleFieldChange = (person: Persona, field: keyof Persona, value: any) => {
    setEditingPerson({
      ...person,
      [field]: value
    });
  };

  // Handle select changes with immediate save
  const handleSelectChange = async (person: Persona, field: keyof Persona, value: any) => {
    const updatedPerson = {
      ...person,
      [field]: value
    };
    
    // Update local state immediately for instant UI feedback
    setData(data.map(p => p.id === person.id ? updatedPerson : p));
    
    try {
      await updatePersona(updatedPerson);
      router.refresh();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error al actualizar');
      // Revert local state on error
      router.refresh();
    }
  };

  // Save changes (without loading animation)
  const saveChanges = async (person: Persona) => {
    const personToSave = editingPerson && editingPerson.id === person.id ? editingPerson : person;
    
    try {
      await updatePersona(personToSave);
      setEditingPerson(null); // Clear editing state
      router.refresh();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error al actualizar');
    }
  };

  // Save changes when Enter is pressed
  const handleSaveOnEnter = (e: React.KeyboardEvent, person: Persona) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges(person);
    }
  };

  // Save changes when clicking outside (onBlur) - only if there are changes
  const handleSaveOnBlur = (person: Persona) => {
    // Check if there are actual changes
    if (editingPerson && editingPerson.id === person.id) {
      saveChanges(person);
    }
  };

  // Get the current value for a person (from editing state or original data)
  const getCurrentPerson = (person: Persona): Persona => {
    return editingPerson && editingPerson.id === person.id ? editingPerson : person;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="glass" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '0.85rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--secondary)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="input"
              style={{ 
                paddingLeft: '2.5rem', 
                width: '100%', 
                borderRadius: '8px',
                background: 'var(--muted-bg)',
                border: '1px solid var(--card-border)',
                height: '42px',
                fontSize: '0.95rem'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: '1 1 120px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '600' }}>
                Rol:
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="select"
                style={{ 
                  padding: '0.45rem 1.75rem 0.45rem 0.6rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  height: '42px',
                  width: '100%'
                }}
              >
                <option value="Todos">Todos</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: '1 1 150px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '600' }}>
                Orden:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="select"
                style={{ 
                  padding: '0.45rem 1.75rem 0.45rem 0.6rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  height: '42px',
                  width: '100%'
                }}
              >
                <option value="nombre">Nombre (A-Z)</option>
                <option value="fecha-antigua">Fecha más antigua</option>
                <option value="fecha-reciente">Fecha más reciente</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCreateNew} 
            className="btn btn-primary" 
            style={{ 
              height: '42px', 
              padding: '0 1rem', 
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
              marginLeft: 'auto'
            }}
          >
            <Plus size={18} />
            <span>Nuevo</span>
          </button>
        </div>
        
        <div style={{ 
          marginTop: '0.85rem',
          padding: '0.6rem 0.85rem', 
          background: 'rgba(138, 28, 46, 0.08)', 
          borderLeft: '3px solid var(--primary)',
          borderRadius: '4px',
          fontSize: '0.825rem',
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>💡 <strong>Tip:</strong> Puedes editar directamente los campos. Se guardan solos al pulsar <kbd style={{ padding: '2px 4px', background: 'var(--muted-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '3px', fontSize: '0.8em' }}>Enter</kbd> o cambiar de campo.</span>
        </div>
      </div>

      {/* =========================================================================
          VISTA MÓVIL (TARJETAS TOUCH-FRIENDLY)
          ========================================================================= */}
      <div className="mobile-cards-container">
        {filteredData.length === 0 ? (
          <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)', borderRadius: '12px' }}>
            No se encontraron registros. Pulsa "+ Nuevo" para agregar uno.
          </div>
        ) : (
          filteredData.map((person) => {
            const currentPerson = getCurrentPerson(person);
            const isExpanded = !!expandedCards[person.id];

            return (
              <div key={person.id} className="mobile-person-card">
                {/* Cabecera de la tarjeta: Nombres y Botón Eliminar */}
                <div className="mobile-person-card-header">
                  <div className="mobile-card-title-group">
                    <div className="mobile-name-input-group">
                      <input
                        type="text"
                        value={currentPerson.nombre}
                        placeholder="Nombre"
                        onChange={(e) => handleFieldChange(person, 'nombre', e.target.value)}
                        onKeyDown={(e) => handleSaveOnEnter(e, person)}
                        onBlur={() => handleSaveOnBlur(person)}
                        className="mobile-inline-input"
                        style={{ fontSize: '1rem' }}
                      />
                      <input
                        type="text"
                        value={currentPerson.apellido}
                        placeholder="Apellido"
                        onChange={(e) => handleFieldChange(person, 'apellido', e.target.value)}
                        onKeyDown={(e) => handleSaveOnEnter(e, person)}
                        onBlur={() => handleSaveOnBlur(person)}
                        className="mobile-inline-input"
                        style={{ fontSize: '1rem' }}
                      />
                    </div>

                    {/* Fila de Insignias: Rol y Selector Sala A/B */}
                    <div className="mobile-badge-row">
                      {/* Selector de Rol */}
                      <select
                        value={currentPerson.rol}
                        onChange={(e) => handleSelectChange(person, 'rol', e.target.value as any)}
                        style={{
                          background: 'var(--muted-bg)',
                          border: '1px solid var(--card-border)',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          color: 'var(--foreground)'
                        }}
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>

                      {/* Selector de Sala A/B con botones tipo pill */}
                      <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectChange(person, 'sala', 'A')}
                          style={{
                            padding: '0.35rem 0.65rem',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            background: currentPerson.sala === 'A' ? '#1d4ed8' : 'var(--muted-bg)',
                            color: currentPerson.sala === 'A' ? 'white' : 'var(--secondary)',
                            transition: 'all 0.15s'
                          }}
                        >
                          Sala A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectChange(person, 'sala', 'B')}
                          style={{
                            padding: '0.35rem 0.65rem',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            background: currentPerson.sala === 'B' ? '#6d28d9' : 'var(--muted-bg)',
                            color: currentPerson.sala === 'B' ? 'white' : 'var(--secondary)',
                            transition: 'all 0.15s'
                          }}
                        >
                          Sala B
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botón Borrar */}
                  <button 
                    onClick={() => handleDelete(person.id)} 
                    className="btn btn-danger" 
                    style={{ padding: '0.5rem', borderRadius: '8px', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Fecha de Asignación Principal (siempre visible para control rápido) */}
                <div style={{ marginTop: '0.6rem' }}>
                  <span className="mobile-field-label">Última Asignación</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <WednesdayPicker
                      value={currentPerson.fechaUltimaAsignacion}
                      onChange={(date) => handleSelectChange(person, 'fechaUltimaAsignacion', date)}
                    />
                  </div>
                </div>

                {/* Botón para expandir/colapsar detalles adicionales */}
                <button
                  type="button"
                  onClick={() => toggleExpand(person.id)}
                  className="mobile-expand-btn"
                >
                  {isExpanded ? (
                    <>
                      <span>Menos detalles</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Más detalles (Frecuencia, Observaciones{tipo === 'HOMBRE' ? ', Discurso' : ''})</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>

                {/* Área expandible con los campos complementarios */}
                {isExpanded && (
                  <div className="mobile-field-grid">
                    {/* Frecuencia */}
                    <div className="mobile-field-item">
                      <span className="mobile-field-label">Frecuencia</span>
                      <input
                        type="text"
                        value={currentPerson.frecuencia}
                        placeholder="Ej. Cada mes, cada 2 semanas..."
                        onChange={(e) => handleFieldChange(person, 'frecuencia', e.target.value)}
                        onKeyDown={(e) => handleSaveOnEnter(e, person)}
                        onBlur={() => handleSaveOnBlur(person)}
                        className="mobile-inline-input"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>

                    {/* Observaciones */}
                    <div className="mobile-field-item">
                      <span className="mobile-field-label">Observación</span>
                      <textarea
                        value={currentPerson.observacion}
                        placeholder="Notas u observaciones sobre la persona..."
                        onChange={(e) => handleFieldChange(person, 'observacion', e.target.value)}
                        onKeyDown={(e) => handleSaveOnEnter(e, person)}
                        onBlur={() => handleSaveOnBlur(person)}
                        rows={2}
                        className="mobile-inline-input"
                        style={{ 
                          fontSize: '0.9rem', 
                          resize: 'vertical', 
                          minHeight: '44px',
                          lineHeight: '1.3' 
                        }}
                      />
                    </div>

                    {/* Campos extras de Discurso para Hombres */}
                    {tipo === 'HOMBRE' && (
                      <div style={{ background: 'var(--muted-bg)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--card-border)', marginTop: '0.25rem' }}>
                        <span className="mobile-field-label" style={{ color: 'var(--secondary)' }}>Último Discurso de 5 Min</span>
                        <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <WednesdayPicker
                            value={currentPerson.ultimoDiscurso5Min || ''}
                            onChange={(date) => handleSelectChange(person, 'ultimoDiscurso5Min', date || undefined)}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '600' }}>Sala Discurso:</span>
                            <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                              <button
                                type="button"
                                onClick={() => handleSelectChange(person, 'salaUltimoDiscurso', undefined)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  background: !currentPerson.salaUltimoDiscurso ? 'var(--secondary)' : 'var(--card-bg)',
                                  color: !currentPerson.salaUltimoDiscurso ? 'white' : 'var(--secondary)'
                                }}
                              >
                                Ninguna
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectChange(person, 'salaUltimoDiscurso', 'A')}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  background: currentPerson.salaUltimoDiscurso === 'A' ? '#1d4ed8' : 'var(--card-bg)',
                                  color: currentPerson.salaUltimoDiscurso === 'A' ? 'white' : 'var(--secondary)'
                                }}
                              >
                                Sala A
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectChange(person, 'salaUltimoDiscurso', 'B')}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  background: currentPerson.salaUltimoDiscurso === 'B' ? '#6d28d9' : 'var(--card-bg)',
                                  color: currentPerson.salaUltimoDiscurso === 'B' ? 'white' : 'var(--secondary)'
                                }}
                              >
                                Sala B
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VISTA ESCRITORIO (TABLA CLÁSICA COMPLETA)
          ========================================================================= */}
      <div className="glass table-container table-desktop-container" style={{ position: 'relative' }}>
        <table>
          <thead>
            <tr>
              <th className="col-nombre">
                <span className="desktop-view">Nombre</span>
                <span className="mobile-view">Nom.</span>
              </th>
              <th className="col-apellido">
                <span className="desktop-view">Apellido</span>
                <span className="mobile-view">Ape.</span>
              </th>
              <th className="col-fecha">
                <span className="desktop-view">Fecha Asignación</span>
                <span className="mobile-view">Fecha</span>
              </th>
              <th className="col-sala">Sala</th>
              <th className="col-rol">Rol</th>
              <th className="col-frec">
                <span className="desktop-view">Frecuencia</span>
                <span className="mobile-view">Frec.</span>
              </th>
              <th className="col-obs">
                <span className="desktop-view">Observación</span>
                <span className="mobile-view">Obs.</span>
              </th>
              {tipo === 'HOMBRE' && (
                <th className="col-extra">
                  <span className="desktop-view">Ultimo Discurso</span>
                  <span className="mobile-view">Ult. Disc.</span>
                </th>
              )}
              {tipo === 'HOMBRE' && <th className="col-sala-extra">Sala</th>}
              <th className="col-actions" style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((person) => {
              const currentPerson = getCurrentPerson(person);
              return (
              <tr key={person.id}>
                <td>
                  <input
                    type="text"
                    value={currentPerson.nombre}
                    placeholder="Nombre"
                    onChange={(e) => handleFieldChange(person, 'nombre', e.target.value)}
                    onKeyDown={(e) => handleSaveOnEnter(e, person)}
                    onBlur={() => handleSaveOnBlur(person)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      padding: '4px',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                      fontSize: '0.95rem'
                    }}
                  />
                </td>
                <td>
                  <div className="desktop-view">
                    <input
                      type="text"
                      value={currentPerson.apellido}
                      placeholder="Apellido"
                      onChange={(e) => handleFieldChange(person, 'apellido', e.target.value)}
                      onKeyDown={(e) => handleSaveOnEnter(e, person)}
                      onBlur={() => handleSaveOnBlur(person)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        width: '100%',
                        padding: '4px',
                        borderRadius: 'var(--radius)',
                        color: 'var(--foreground)',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <div className="mobile-view" style={{ fontWeight: '500' }}>
                    {currentPerson.apellido ? `${currentPerson.apellido.charAt(0)}.` : ''}
                  </div>
                </td>
                <td>
                  <WednesdayPicker
                    value={currentPerson.fechaUltimaAsignacion}
                    onChange={(date) => handleSelectChange(person, 'fechaUltimaAsignacion', date)}
                  />
                </td>
                <td>
                  <select
                    value={currentPerson.sala}
                    onChange={(e) => handleSelectChange(person, 'sala', e.target.value as Sala)}
                    style={{
                      color: currentPerson.sala === 'A' ? '#1d4ed8' : '#7c3aed',
                      background: currentPerson.sala === 'A' ? 'rgba(29, 78, 216, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      padding: '4px 2px',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </td>
                <td>
                  <div className="desktop-view">
                    <select
                      value={currentPerson.rol}
                      onChange={(e) => handleSelectChange(person, 'rol', e.target.value as any)}
                      style={{
                        background: 'var(--muted-bg)',
                        border: '1px solid var(--card-border)',
                        width: '100%',
                        minWidth: '100px',
                        padding: '8px 4px',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        fontWeight: '500',
                        appearance: 'auto',
                        WebkitAppearance: 'menulist',
                        MozAppearance: 'menulist'
                      }}
                    >
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mobile-view">
                    <select
                      value={currentPerson.rol}
                      onChange={(e) => handleSelectChange(person, 'rol', e.target.value as any)}
                      style={{
                        background: 'var(--muted-bg)',
                        border: 'none',
                        width: '100%',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        appearance: 'auto'
                      }}
                    >
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{abbreviateRole(role)}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    value={currentPerson.frecuencia}
                    placeholder="Frecuencia"
                    onChange={(e) => handleFieldChange(person, 'frecuencia', e.target.value)}
                    onKeyDown={(e) => handleSaveOnEnter(e, person)}
                    onBlur={() => handleSaveOnBlur(person)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      padding: '4px',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                      fontSize: '0.95rem'
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={currentPerson.observacion}
                    placeholder="..."
                    onChange={(e) => {
                      handleFieldChange(person, 'observacion', e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => handleSaveOnEnter(e, person)}
                    onBlur={() => handleSaveOnBlur(person)}
                    rows={2}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      padding: '4px',
                      borderRadius: 'var(--radius)',
                      resize: 'vertical',
                      minHeight: '40px',
                      minWidth: '80px',
                      color: 'var(--foreground)',
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}
                  />
                </td>

                {tipo === 'HOMBRE' && (
                  <td>
                    <WednesdayPicker
                      value={currentPerson.ultimoDiscurso5Min || ''}
                      onChange={(date) => handleSelectChange(person, 'ultimoDiscurso5Min', date || undefined)}
                    />
                  </td>
                )}

                {tipo === 'HOMBRE' && (
                  <td>
                    <select
                      value={currentPerson.salaUltimoDiscurso || ''}
                      onChange={(e) => handleSelectChange(person, 'salaUltimoDiscurso', e.target.value || undefined)}
                      style={{
                        color: !currentPerson.salaUltimoDiscurso ? 'var(--secondary)' : 'var(--foreground)',
                        background: !currentPerson.salaUltimoDiscurso ? 'var(--muted-bg)' :
                                   currentPerson.salaUltimoDiscurso === 'A' ? 'rgba(29, 78, 216, 0.15)' : 'rgba(109, 40, 217, 0.15)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        padding: '4px 2px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">None</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </td>
                )}

                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => handleDelete(person.id)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
                  No se encontraron registros. Pulsa "Nuevo Registro" para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
