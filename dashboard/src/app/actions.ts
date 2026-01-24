'use server';

import { prisma } from '@/lib/db';
import { Persona } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getPersonas(tipo: 'MUJER' | 'HOMBRE') {
  const personas = await prisma.persona.findMany({
    where: { tipo },
    orderBy: { createdAt: 'desc' },
  });

  return personas.map(p => ({
    ...p,
    fechaUltimaAsignacion: p.fechaUltimaAsignacion.toISOString().split('T')[0],
    sala: p.sala as any,
    rol: p.rol as any,
    ultimoDiscurso5Min: p.ultimoDiscurso5Min ? p.ultimoDiscurso5Min.toISOString().split('T')[0] : undefined,
  }));
}

export async function createPersona(data: Persona, tipo: 'MUJER' | 'HOMBRE') {
  await prisma.persona.create({
    data: {
      tipo,
      nombre: data.nombre,
      apellido: data.apellido,
      fechaUltimaAsignacion: new Date(data.fechaUltimaAsignacion),
      sala: data.sala,
      rol: data.rol,
      frecuencia: data.frecuencia,
      observacion: data.observacion,
      ultimoDiscurso5Min: data.ultimoDiscurso5Min ? new Date(data.ultimoDiscurso5Min) : null,
    },
  });
  revalidatePath(tipo === 'MUJER' ? '/mujeres' : '/hombres');
}

export async function updatePersona(data: Persona) {
  await prisma.persona.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      fechaUltimaAsignacion: new Date(data.fechaUltimaAsignacion),
      sala: data.sala,
      rol: data.rol,
      frecuencia: data.frecuencia,
      observacion: data.observacion,
      ultimoDiscurso5Min: data.ultimoDiscurso5Min ? new Date(data.ultimoDiscurso5Min) : null,
    },
  });
  revalidatePath('/mujeres');
  revalidatePath('/hombres');
}

export async function updateSala(id: string, sala: 'A' | 'B') {
  await prisma.persona.update({
    where: { id },
    data: { sala },
  });
  revalidatePath('/mujeres');
  revalidatePath('/hombres');
}

export async function deletePersona(id: string) {
  await prisma.persona.delete({
    where: { id },
  });
  revalidatePath('/mujeres');
  revalidatePath('/hombres');
}

export async function getStats() {
  const totalMujeres = await prisma.persona.count({ where: { tipo: 'MUJER' } });
  const totalHombres = await prisma.persona.count({ where: { tipo: 'HOMBRE' } });
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentAssignments = await prisma.persona.count({
    where: {
      fechaUltimaAsignacion: {
        gte: oneWeekAgo
      }
    }
  });

  return {
    totalMujeres,
    totalHombres,
    recentAssignments
  };
}
