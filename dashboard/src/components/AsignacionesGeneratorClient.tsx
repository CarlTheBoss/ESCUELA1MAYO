'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Persona } from '@/types';
import { FileText, RefreshCw, Sparkles, User, UserPlus, Calendar, MapPin, CheckCircle2, X, Share2, Check, BookOpen } from 'lucide-react';
import WednesdayPicker from './WednesdayPicker';

interface AsignacionesGeneratorProps {
  initialPersonas: Persona[];
}

type SalaTipo = 'principal' | 'auxiliar1' | '';

type PersonaOption = Persona & { nombreCompleto: string };

export default function AsignacionesGeneratorClient({ initialPersonas }: AsignacionesGeneratorProps) {
  // Datos principales de la plantilla
  const [selectedPublicador, setSelectedPublicador] = useState<PersonaOption | null>(null);
  const [selectedAyudante, setSelectedAyudante] = useState<PersonaOption | null>(null);
  
  // Textos en los inputs de búsqueda
  const [publicadorSearch, setPublicadorSearch] = useState<string>('');
  const [ayudanteSearch, setAyudanteSearch] = useState<string>('');
  
  // Control de apertura de listas desplegables
  const [isPublicadorOpen, setIsPublicadorOpen] = useState(false);
  const [isAyudanteOpen, setIsAyudanteOpen] = useState(false);

  // Campos adicionales según la plantilla
  const [fecha, setFecha] = useState<string>('');
  const [numeroIntervencion, setNumeroIntervencion] = useState<string>('');
  const [detalleIntervencion, setDetalleIntervencion] = useState<string>('');
  const [sala, setSala] = useState<SalaTipo>('principal');
  
  // Estados para compartir
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const publicadorRef = useRef<HTMLDivElement>(null);
  const ayudanteRef = useRef<HTMLDivElement>(null);

  // Cerrar desplegables al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (publicadorRef.current && !publicadorRef.current.contains(event.target as Node)) {
        setIsPublicadorOpen(false);
      }
      if (ayudanteRef.current && !ayudanteRef.current.contains(event.target as Node)) {
        setIsAyudanteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lista normalizada de personas existentes
  const personasOptions = useMemo(() => {
    return initialPersonas.map(p => ({
      ...p,
      nombreCompleto: `${p.nombre} ${p.apellido}`.trim(),
    }));
  }, [initialPersonas]);

  // Filtro reactivo para Publicador
  const filteredPublicadores = useMemo(() => {
    if (!publicadorSearch.trim()) return personasOptions;
    const q = publicadorSearch.toLowerCase();
    return personasOptions.filter(p =>
      p.nombreCompleto.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q)
    );
  }, [publicadorSearch, personasOptions]);

  // Filtro reactivo para Ayudante
  const filteredAyudantes = useMemo(() => {
    if (!ayudanteSearch.trim()) return personasOptions;
    const q = ayudanteSearch.toLowerCase();
    return personasOptions.filter(p =>
      p.nombreCompleto.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q)
    );
  }, [ayudanteSearch, personasOptions]);

  // Seleccionar Publicador: AUTOCOMPLETA fecha y sala según el publicador
  const handleSelectPublicador = (person: Persona & { nombreCompleto: string }) => {
    setSelectedPublicador(person);
    setPublicadorSearch(person.nombreCompleto);
    setIsPublicadorOpen(false);

    // Conectar fecha asignada
    if (person.fechaUltimaAsignacion) {
      setFecha(person.fechaUltimaAsignacion);
    }

    // Conectar sala (Sala A = Sala principal, Sala B = Sala auxiliar núm. 1)
    if (person.sala === 'A') {
      setSala('principal');
    } else if (person.sala === 'B') {
      setSala('auxiliar1');
    }
  };

  // Seleccionar Ayudante: SOLO autocompleta el nombre del acompañante
  const handleSelectAyudante = (person: Persona & { nombreCompleto: string }) => {
    setSelectedAyudante(person);
    setAyudanteSearch(person.nombreCompleto);
    setIsAyudanteOpen(false);
  };

  const handlePublicadorBlur = () => {
    setTimeout(() => {
      if (selectedPublicador && selectedPublicador.nombreCompleto === publicadorSearch) {
        return;
      }
      const exactMatch = personasOptions.find(
        p => p.nombreCompleto.toLowerCase() === publicadorSearch.trim().toLowerCase()
      );
      if (exactMatch) {
        handleSelectPublicador(exactMatch);
      } else {
        if (selectedPublicador) {
          setPublicadorSearch(selectedPublicador.nombreCompleto);
        } else {
          setPublicadorSearch('');
        }
      }
    }, 200);
  };

  const handleAyudanteBlur = () => {
    setTimeout(() => {
      if (selectedAyudante && selectedAyudante.nombreCompleto === ayudanteSearch) {
        return;
      }
      const exactMatch = personasOptions.find(
        p => p.nombreCompleto.toLowerCase() === ayudanteSearch.trim().toLowerCase()
      );
      if (exactMatch) {
        handleSelectAyudante(exactMatch);
      } else {
        if (selectedAyudante) {
          setAyudanteSearch(selectedAyudante.nombreCompleto);
        } else {
          setAyudanteSearch('');
        }
      }
    }, 200);
  };

  const clearPublicador = () => {
    setSelectedPublicador(null);
    setPublicadorSearch('');
    setIsPublicadorOpen(false);
  };

  const clearAyudante = () => {
    setSelectedAyudante(null);
    setAyudanteSearch('');
    setIsAyudanteOpen(false);
  };

  const handleReset = () => {
    clearPublicador();
    clearAyudante();
    setFecha('');
    setNumeroIntervencion('');
    setDetalleIntervencion('');
    setSala('principal');
  };

  // Texto consolidado para "Número de intervención" ej: 4 (Lectura de la Biblia)
  const displayIntervencion = useMemo(() => {
    const num = numeroIntervencion.trim();
    const det = detalleIntervencion.trim();
    if (num && det) return `${num} (${det})`;
    if (num) return num;
    if (det) return `(${det})`;
    return '';
  }, [numeroIntervencion, detalleIntervencion]);

  // Formato visual dd/mm/aaaa
  const formattedDate = useMemo(() => {
    if (!fecha) return '';
    try {
      const parts = fecha.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return fecha;
    } catch {
      return fecha;
    }
  }, [fecha]);

  // Generador nativo de imagen PNG nítida fiel a la plantilla de la imagen (S-89-S 10/15)
  const generateImageBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const scale = 2; // Alta resolución
      const width = 520;
      const height = 560;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.scale(scale, scale);

      // Fondo blanco puro
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Borde sutil
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // Título exactamente como en la imagen
      ctx.fillStyle = '#000000';
      ctx.font = '800 21px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASIGNACIÓN PARA LA REUNIÓN', width / 2, 42);
      ctx.fillText('VIDA Y MINISTERIO CRISTIANOS', width / 2, 68);
      ctx.textAlign = 'left';

      // Función para dibujar campo con línea punteada
      const drawField = (label: string, value: string, y: number) => {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial, Helvetica, sans-serif';
        ctx.fillText(label, 28, y);

        const labelWidth = ctx.measureText(label).width;
        const lineStartX = 28 + labelWidth + 10;
        const lineEndX = width - 28;

        if (value) {
          ctx.font = 'bold 16px Georgia, serif';
          ctx.fillText(value, lineStartX + 4, y - 2);
        }

        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.moveTo(lineStartX, y + 3);
        ctx.lineTo(lineEndX, y + 3);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      const pubName = selectedPublicador ? selectedPublicador.nombreCompleto : '';
      const ayudName = selectedAyudante ? selectedAyudante.nombreCompleto : '';

      drawField('Nombre:', pubName, 122);
      drawField('Ayudante:', ayudName, 168);
      drawField('Fecha:', formattedDate, 214);
      drawField('Número de intervención:', displayIntervencion, 260);

      // Sección: Se presentará en (Centrado/Alineado limpiamente)
      const startSectionY = 320;

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px Arial, Helvetica, sans-serif';
      ctx.fillText('Se presentará en:', 28, startSectionY);

      // Helper para casillas de verificación
      const drawCheckbox = (x: number, y: number, text: string, isChecked: boolean) => {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(x, y - 13, 15, 15);
        
        if (isChecked) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + 3, y - 10, 9, 9);
        }

        ctx.fillStyle = '#111111';
        ctx.font = '14px Arial, Helvetica, sans-serif';
        ctx.fillText(text, x + 24, y);
      };

      // Opciones Se presentará en: horizontal o vertical limpias
      drawCheckbox(36, startSectionY + 28, 'Sala principal', sala === 'principal');
      drawCheckbox(260, startSectionY + 28, 'Sala auxiliar núm. 1', sala === 'auxiliar1');

      // Nota al estudiante exactamente como en la imagen
      const noteY = 410;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial, Helvetica, sans-serif';
      ctx.fillText('Nota al estudiante:', 28, noteY);
      
      const notePrefixW = ctx.measureText('Nota al estudiante: ').width;
      ctx.font = '12px Arial, Helvetica, sans-serif';
      ctx.fillText('En la Guía de actividades encontrará la', 28 + notePrefixW, noteY);
      ctx.fillText('información que necesita para su intervención. Prepare con la', 28, noteY + 17);
      
      ctx.fillText('ayuda del libro ', 28, noteY + 34);
      const benW = ctx.measureText('ayuda del libro ').width;
      ctx.font = 'italic 12px Georgia, serif';
      ctx.fillText('Benefíciese', 28 + benW, noteY + 34);
      const benWordW = ctx.measureText('Benefíciese ').width;
      ctx.font = '12px Arial, Helvetica, sans-serif';
      ctx.fillText('el aspecto de la oratoria que se le', 28 + benW + benWordW, noteY + 34);
      
      ctx.fillText('indica en esta hoja. ', 28, noteY + 51);
      const indW = ctx.measureText('indica en esta hoja. ').width;
      ctx.font = 'bold 12px Arial, Helvetica, sans-serif';
      ctx.fillText('No olvide llevar su libro a la reunión', 28 + indW, noteY + 51);
      ctx.fillText('Vida y Ministerio.', 28, noteY + 68);

      // Pie de página exacto de la imagen
      ctx.font = '12px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#333333';
      ctx.fillText('S-89-S    10/15', 28, 520);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  // Compartir vía WhatsApp la imagen
  const handleShareWhatsApp = async () => {
    setIsGenerating(true);
    setShareSuccess(false);

    try {
      const blob = await generateImageBlob();
      if (!blob) {
        alert('No se pudo generar la imagen');
        setIsGenerating(false);
        return;
      }

      const fileName = `asignacion-${selectedPublicador ? selectedPublicador.nombre : 'estudiante'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const pubName = selectedPublicador ? selectedPublicador.nombreCompleto : 'el estudiante';
      const salaLabel = sala === 'principal' ? 'Sala Principal' : sala === 'auxiliar1' ? 'Sala auxiliar 1' : 'Sala';
      const textMsg = `Hola ${pubName}, te comparto tu hoja de asignación para la reunión del ${formattedDate || 'miércoles'} (${salaLabel}).`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Asignación Vida y Ministerio',
          text: textMsg,
          files: [file]
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg + ' (Imagen de asignación descargada en tu dispositivo)')}`;
        window.open(waUrl, '_blank');

        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir:', err);
        alert('Ocurrió un inconveniente al compartir.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabecera */}
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText color="var(--primary)" />
            Generar Plantilla de Asignación S-89
          </h1>
          <p style={{ color: 'var(--secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Rellena la hoja oficial y compártela directamente por WhatsApp en su tamaño de imagen.
          </p>
        </div>
      </header>

      {/* Contenedor en 2 columnas: Formulario reactivo y Previsualización oficial */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* PANEL DE CONTROL / FORMULARIO */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--accent)" />
              Datos de la Asignación
            </h2>
            <button 
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', height: '32px' }}
              title="Limpiar campos"
            >
              <RefreshCw size={14} />
              Limpiar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Campo 1: Buscador de Publicador con Autocompletado */}
            <div ref={publicadorRef} style={{ position: 'relative' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                  <User size={16} color="var(--primary)" />
                  1. Nombre:
                </span>
                {selectedPublicador ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}>
                    <CheckCircle2 size={13} /> Registrado
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                    (Escribe para filtrar)
                  </span>
                )}
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={publicadorSearch}
                  onChange={(e) => {
                    setPublicadorSearch(e.target.value);
                    setIsPublicadorOpen(true);
                    if (selectedPublicador && selectedPublicador.nombreCompleto !== e.target.value) {
                      setSelectedPublicador(null);
                    }
                  }}
                  onFocus={() => setIsPublicadorOpen(true)}
                  onBlur={handlePublicadorBlur}
                  placeholder="Escribe para buscar... ej. Carlos, María..."
                  className="input"
                  style={{
                    height: '44px',
                    paddingRight: publicadorSearch ? '2.5rem' : '0.75rem',
                    border: selectedPublicador ? '2px solid var(--success)' : '1px solid var(--card-border)',
                    background: 'var(--card-bg)'
                  }}
                />
                {publicadorSearch && (
                  <button
                    type="button"
                    onClick={clearPublicador}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Menú flotante de coincidencias para Publicador */}
              {isPublicadorOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  marginTop: '4px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {filteredPublicadores.length === 0 ? (
                    <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--secondary)', textAlign: 'center' }}>
                      No existe ninguna persona con ese nombre.
                    </div>
                  ) : (
                    filteredPublicadores.map((person) => (
                      <div
                        key={person.id}
                        onMouseDown={() => handleSelectPublicador(person)}
                        style={{
                          padding: '0.6rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--card-border)',
                          transition: 'background 0.15s',
                        }}
                        className="glass-hover"
                      >
                        <div>
                          <strong style={{ color: 'var(--foreground)' }}>{person.nombreCompleto}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                            ({person.tipo === 'HOMBRE' ? 'Hermano' : 'Hermana'})
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: person.sala === 'A' ? 'rgba(29, 78, 216, 0.15)' : 'rgba(109, 40, 217, 0.15)',
                          color: person.sala === 'A' ? '#3b82f6' : '#a855f7',
                          fontWeight: '600'
                        }}>
                          Sala {person.sala}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Campo 2: Buscador de Ayudante */}
            <div ref={ayudanteRef} style={{ position: 'relative' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                  <UserPlus size={16} color="var(--secondary)" />
                  2. Ayudante:
                </span>
                {selectedAyudante && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600' }}>
                    <CheckCircle2 size={13} /> Registrado
                  </span>
                )}
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={ayudanteSearch}
                  onChange={(e) => {
                    setAyudanteSearch(e.target.value);
                    setIsAyudanteOpen(true);
                    if (selectedAyudante && selectedAyudante.nombreCompleto !== e.target.value) {
                      setSelectedAyudante(null);
                    }
                  }}
                  onFocus={() => setIsAyudanteOpen(true)}
                  onBlur={handleAyudanteBlur}
                  placeholder="Escribe para buscar ayudante existente..."
                  className="input"
                  style={{
                    height: '44px',
                    paddingRight: ayudanteSearch ? '2.5rem' : '0.75rem',
                    border: selectedAyudante ? '2px solid var(--success)' : '1px solid var(--card-border)',
                    background: 'var(--card-bg)'
                  }}
                />
                {ayudanteSearch && (
                  <button
                    type="button"
                    onClick={clearAyudante}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Menú flotante de coincidencias para Ayudante */}
              {isAyudanteOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  marginTop: '4px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredAyudantes.length === 0 ? (
                    <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--secondary)', textAlign: 'center' }}>
                      No existe ninguna persona con ese nombre.
                    </div>
                  ) : (
                    filteredAyudantes.map((person) => (
                      <div
                        key={person.id}
                        onMouseDown={() => handleSelectAyudante(person)}
                        style={{
                          padding: '0.6rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--card-border)',
                          transition: 'background 0.15s',
                        }}
                        className="glass-hover"
                      >
                        <div>
                          <strong style={{ color: 'var(--foreground)' }}>{person.nombreCompleto}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                            ({person.tipo === 'HOMBRE' ? 'Hermano' : 'Hermana'})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Campo 3: Fecha */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                <Calendar size={16} color="var(--accent)" />
                <span>3. Fecha:</span>
              </label>
              <WednesdayPicker
                value={fecha}
                onChange={(newDate) => setFecha(newDate)}
                style={{ height: '42px' }}
              />
            </div>

            {/* Campo 4: Número de intervención y Detalle opcional */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                <BookOpen size={16} color="var(--primary)" />
                <span>4. Número de intervención:</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={numeroIntervencion}
                  onChange={(e) => setNumeroIntervencion(e.target.value)}
                  placeholder="Ej: 4"
                  className="input"
                  style={{ height: '42px', textAlign: 'center', fontWeight: '600' }}
                />
                <input
                  type="text"
                  value={detalleIntervencion}
                  onChange={(e) => setDetalleIntervencion(e.target.value)}
                  placeholder="Detalle opcional (ej: Lectura de la Biblia)"
                  className="input"
                  style={{ height: '42px' }}
                />
              </div>
              {displayIntervencion && (
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  Aparecerá como: <strong>{displayIntervencion}</strong>
                </div>
              )}
            </div>

            {/* Campo 5: Se presentará en */}
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                <MapPin size={16} color="var(--success)" />
                <span>5. Se presentará en:</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                {[
                  { id: 'principal', label: 'Sala principal (A)', color: '#1d4ed8' },
                  { id: 'auxiliar1', label: 'Sala auxiliar núm. 1 (B)', color: '#6d28d9' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSala(s.id as SalaTipo)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: sala === s.id ? `2px solid ${s.color}` : '1px solid var(--card-border)',
                      background: sala === s.id ? 'rgba(0,0,0,0.06)' : 'var(--muted-bg)',
                      color: sala === s.id ? s.color : 'var(--foreground)',
                      fontWeight: sala === s.id ? '700' : '500',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Compartir por WhatsApp */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                disabled={isGenerating}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  height: '48px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  background: '#25D366',
                  color: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  cursor: isGenerating ? 'wait' : 'pointer'
                }}
              >
                {isGenerating ? (
                  <span>Generando imagen...</span>
                ) : shareSuccess ? (
                  <>
                    <Check size={20} />
                    <span>¡Listo para enviar por WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={20} />
                    <span>Compartir imagen vía WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PREVISUALIZACIÓN DE LA PLANTILLA OFICIAL EXACTA */}
        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vista Previa (Plantilla Oficial S-89)
            </span>
          </div>

          {/* Tarjeta con el diseño exacto de la imagen */}
          <div 
            style={{
              background: '#ffffff',
              color: '#111111',
              padding: '28px 24px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #d1d5db',
              fontFamily: "Arial, Helvetica, sans-serif",
              maxWidth: '520px',
              width: '100%',
              margin: '0 auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Título en dos líneas centrado */}
            <div style={{
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '18px',
              lineHeight: 1.3,
              marginBottom: '26px',
              color: '#000000',
              letterSpacing: '0.2px'
            }}>
              ASIGNACIÓN PARA LA REUNIÓN<br />VIDA Y MINISTERIO CRISTIANOS
            </div>

            {/* Nombre */}
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', color: '#000' }}>
                Nombre:
              </span>
              <div style={{ borderBottom: '1px dotted #333', flex: 1, minHeight: '20px', paddingLeft: '6px', fontWeight: 700, fontSize: '15px', color: '#000', fontFamily: "Georgia, serif" }}>
                {selectedPublicador ? selectedPublicador.nombreCompleto : ''}
              </div>
            </div>

            {/* Ayudante */}
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', color: '#000' }}>
                Ayudante:
              </span>
              <div style={{ borderBottom: '1px dotted #333', flex: 1, minHeight: '20px', paddingLeft: '6px', fontWeight: 700, fontSize: '15px', color: '#000', fontFamily: "Georgia, serif" }}>
                {selectedAyudante ? selectedAyudante.nombreCompleto : ''}
              </div>
            </div>

            {/* Fecha */}
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', color: '#000' }}>
                Fecha:
              </span>
              <div style={{ borderBottom: '1px dotted #333', flex: 1, minHeight: '20px', paddingLeft: '6px', fontWeight: 700, fontSize: '15px', color: '#000', fontFamily: "Georgia, serif" }}>
                {formattedDate}
              </div>
            </div>

            {/* Número de intervención */}
            <div style={{ marginBottom: '26px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', color: '#000' }}>
                Número de intervención:
              </span>
              <div style={{ borderBottom: '1px dotted #333', flex: 1, minHeight: '20px', paddingLeft: '6px', fontWeight: 700, fontSize: '15px', color: '#000', fontFamily: "Georgia, serif" }}>
                {displayIntervencion}
              </div>
            </div>

            {/* Se presentará en */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#000' }}>
                Se presentará en:
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#000', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sala === 'principal'}
                    onChange={() => setSala(sala === 'principal' ? '' : 'principal')}
                    style={{ width: '16px', height: '16px', accentColor: '#000', margin: 0 }}
                  />
                  <span>Sala principal</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#000', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sala === 'auxiliar1'}
                    onChange={() => setSala(sala === 'auxiliar1' ? '' : 'auxiliar1')}
                    style={{ width: '16px', height: '16px', accentColor: '#000', margin: 0 }}
                  />
                  <span>Sala auxiliar núm. 1</span>
                </label>
              </div>
            </div>

            {/* Nota al estudiante */}
            <div style={{ fontSize: '11px', lineHeight: 1.45, color: '#111', marginTop: '14px' }}>
              <strong>Nota al estudiante:</strong> En la <em>Guía de actividades</em> encontrará la información que necesita para su intervención. Prepare con la ayuda del libro <em>Benefíciese</em> el aspecto de la oratoria que se le indica en esta hoja. <strong>No olvide llevar su libro a la reunión Vida y Ministerio.</strong>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '22px', fontSize: '11px', color: '#333' }}>
              S-89-S&nbsp;&nbsp;&nbsp;&nbsp;10/15
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
