import { getAllPersonas } from '@/app/actions';
import AsignacionesGeneratorClient from '@/components/AsignacionesGeneratorClient';

export const dynamic = 'force-dynamic';

export default async function AsignacionesPage() {
  const personas = await getAllPersonas();

  return <AsignacionesGeneratorClient initialPersonas={personas} />;
}
