import PersonManagement from '@/components/PersonManagement';
import { getPersonas } from '@/app/actions';
//adsd
export const dynamic = 'force-dynamic';

export default async function MujeresPage() {
  const data = await getPersonas('MUJER');

  return (
    <PersonManagement 
      title="Mujeres Publicadoras" 
      initialData={data}
      roleOptions={['Publicadora', 'Acompañante']}
      tipo="MUJER"
    />
  );
}
