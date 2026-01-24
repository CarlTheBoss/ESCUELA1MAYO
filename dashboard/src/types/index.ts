export type Sala = 'A' | 'B';
export type RolMujer = 'Acompañante' | 'Publicadora';
export type RolHombre = 'Acompañante' | 'Publicador' | 'Discurso' | 'Lectura Bíblica';

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  fechaUltimaAsignacion: string; // ISO Date string
  sala: Sala;
  rol: RolMujer | RolHombre;
  frecuencia: string;
  observacion: string;
  ultimoDiscurso5Min?: string; // ISO Date string
  salaUltimoDiscurso?: Sala; // Sala del último discurso de 5 min
}
