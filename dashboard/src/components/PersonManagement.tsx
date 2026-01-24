'use client';

import { useState, useEffect } from 'react';
import { Persona, Sala, RolMujer, RolHombre } from '@/types';
import { Plus, Search, Trash2 } from 'lucide-react';
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
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">{title}</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Gestión de {title.toLowerCase()}</p>
        </div>
        <button onClick={handleCreateNew} className="btn btn-primary">
          <Plus size={18} />
          Nuevo Registro
        </button>
      </header>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="input"
              style={{ paddingLeft: '3rem', width: '100%', minWidth: '150px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: '500' }}>
              Filtrar:
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="select"
              style={{ 
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="Todos">Todos los roles</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: '500' }}>
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select"
              style={{ 
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                minWidth: '180px'
              }}
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="fecha-antigua">Fecha más antigua</option>
              <option value="fecha-reciente">Fecha más reciente</option>
            </select>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '1rem',
          padding: '0.75rem 1rem', 
          background: '#eff6ff', 
          borderLeft: '3px solid #8a1c2e',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#8a1c2e'
        }}>
          💡 <strong>Tip:</strong> Los cambios se guardan al presionar <kbd style={{ 
            padding: '2px 6px', 
            background: 'white', 
            border: '1px solid #cbd5e1',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '0.85em'
          }}>Enter</kbd> o al hacer click fuera del campo
        </div>
      </div>

      <div className="glass table-container" style={{ position: 'relative' }}>
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
                      color: currentPerson.sala === 'A' ? '#000000ff' : '#000000ff',
                      background: currentPerson.sala === 'A' ? '#eff6ff' : '#f5f3ff',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      padding: '4px 2px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
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
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        width: '100%',
                        minWidth: '100px', // Reduced from 140px
                        padding: '8px 4px',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        color: '#1f2937',
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
                  <div className="mobile-view" style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '500',
                    background: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {abbreviateRole(currentPerson.rol)}
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
                        color: !currentPerson.salaUltimoDiscurso ? '#6b7280' : 
                               currentPerson.salaUltimoDiscurso === 'A' ? '#000000ff' : '#000000ff',
                        background: !currentPerson.salaUltimoDiscurso ? '#f3f4f6' :
                                   currentPerson.salaUltimoDiscurso === 'A' ? '#eff6ff' : '#f5f3ff',
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
    </div>
  );
}
