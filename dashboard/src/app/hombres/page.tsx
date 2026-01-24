import PersonManagement from '@/components/PersonManagement';
import { getPersonas } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function HombresPage() {
  const data = await getPersonas('HOMBRE');

  return (
    <PersonManagement 
      title="Publicadores" 
      initialData={data}
      roleOptions={['Publicador', 'Acompañante', 'Discurso', 'Lectura Bíblica']}
      tipo="HOMBRE"
    />
  );
}
