import { getStats } from '@/app/actions';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await getStats();

  return <DashboardClient stats={stats} />;
}
