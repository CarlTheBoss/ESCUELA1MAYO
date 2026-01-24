'use client';

import { useState, useTransition, useEffect } from 'react';
import { Persona, Sala, RolMujer, RolHombre } from '@/types';
import { Plus, Search, Edit2, Trash2, X, Save, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPersona, updatePersona, deletePersona, updateSala } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface PersonManagementProps {
  title: string;
  initialData: Persona[];
  roleOptions: (RolMujer | RolHombre)[];
  tipo: 'MUJER' | 'HOMBRE';
}

export default function PersonManagement({ title, initialData, roleOptions, tipo }: PersonManagementProps) {
  const [data, setData] = useState<Persona[]>(initialData);
  
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
    ultimoDiscurso5Min: ''
  };

  const [formData, setFormData] = useState<Persona>(emptyForm);

  const filteredData = data.filter(person => 
    person.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    startTransition(async () => {
      try {
        await createPersona(emptyForm, tipo);
        router.refresh();
      } catch (error) {
        console.error('Error creating:', error);
        alert('Error al crear registro');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      startTransition(async () => {
        try {
          await deletePersona(id);
          setData(data.filter(p => p.id !== id));
          router.refresh();
        } catch (error) {
          console.error('Error deleting:', error);
          alert('Error al eliminar');
        }
      });
    }
  };

  const handleUpdate = (updatedPerson: Persona) => {
    startTransition(async () => {
      try {
        await updatePersona(updatedPerson);
        setData(data.map(p => p.id === updatedPerson.id ? updatedPerson : p));
        router.refresh();
      } catch (error) {
        console.error('Error updating:', error);
        alert('Error al actualizar');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 className="title">{title}</h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>Gestión de {title.toLowerCase()}</p>
        </div>
        <button onClick={handleCreateNew} className="btn btn-primary" disabled={isPending}>
          <Plus size={18} />
          Nuevo Registro
        </button>
      </header>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            className="input"
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass table-container">
        {isPending && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <Loader2 className="animate-spin" />
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Fecha Asignación</th>
              <th>Sala</th>
              <th>Rol</th>
              <th>Frecuencia</th>
              <th>Observación</th>
              {tipo === 'HOMBRE' && <th>Ultimo Discurso 5 min</th>}
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((person) => (
              <tr key={person.id} className="hover:bg-slate-800/50 transition-colors">
                <td>
                  <input 
                    type="text" 
                    defaultValue={person.nombre}
                    placeholder="Nombre"
                    onBlur={(e) => handleUpdate({ ...person, nombre: e.target.value })}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 placeholder-slate-600"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    defaultValue={person.apellido}
                    placeholder="Apellido"
                    onBlur={(e) => handleUpdate({ ...person, apellido: e.target.value })}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 placeholder-slate-600"
                  />
                </td>
                <td>
                  <input 
                    type="date" 
                    defaultValue={person.fechaUltimaAsignacion}
                    onChange={(e) => handleUpdate({ ...person, fechaUltimaAsignacion: e.target.value })}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm"
                  />
                </td>
                <td>
                  <select 
                    value={person.sala}
                    onChange={(e) => handleUpdate({ ...person, sala: e.target.value as Sala })}
                    className="bg-transparent border-none rounded px-1 py-1 text-sm font-semibold cursor-pointer"
                    style={{ 
                      color: person.sala === 'A' ? '#60a5fa' : '#a78bfa',
                      background: person.sala === 'A' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                    }}
                  >
                    <option value="A" className="bg-slate-800 text-white">A</option>
                    <option value="B" className="bg-slate-800 text-white">B</option>
                  </select>
                </td>
                <td>
                  <select 
                    value={person.rol}
                    onChange={(e) => handleUpdate({ ...person, rol: e.target.value as any })}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm cursor-pointer"
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role} className="bg-slate-800 text-white">{role}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="text" 
                    defaultValue={person.frecuencia}
                    placeholder="Frecuencia"
                    onBlur={(e) => handleUpdate({ ...person, frecuencia: e.target.value })}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 placeholder-slate-600"
                  />
                </td>
                <td>
                  <textarea 
                    defaultValue={person.observacion}
                    placeholder="..."
                    onBlur={(e) => handleUpdate({ ...person, observacion: e.target.value })}
                    rows={1}
                    className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 resize-none overflow-hidden placeholder-slate-600"
                    style={{ minWidth: '150px' }}
                  />
                </td>
                
                {tipo === 'HOMBRE' && (
                  <td>
                    <input 
                      type="date" 
                      defaultValue={person.ultimoDiscurso5Min || ''}
                      onChange={(e) => handleUpdate({ ...person, ultimoDiscurso5Min: e.target.value })}
                      className="bg-transparent border-none w-full focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm"
                    />
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
            ))}
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
