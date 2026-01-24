import { Persona } from '@/types';

export const initialMujeres: Persona[] = [
  {
    id: '1',
    nombre: 'Maria',
    apellido: 'Gonzalez',
    fechaUltimaAsignacion: '2023-10-15',
    sala: 'A',
    rol: 'Publicadora',
    frecuencia: 'Mensual',
    observacion: 'Muy buena lectura'
  },
  {
    id: '2',
    nombre: 'Ana',
    apellido: 'Lopez',
    fechaUltimaAsignacion: '2023-11-01',
    sala: 'B',
    rol: 'Acompañante',
    frecuencia: 'Bimensual',
    observacion: 'Necesita ayuda con el microfono'
  }
];

export const initialHombres: Persona[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Perez',
    fechaUltimaAsignacion: '2023-10-20',
    sala: 'A',
    rol: 'Publicador',
    frecuencia: 'Mensual',
    observacion: 'Excelente discurso'
  }
];
