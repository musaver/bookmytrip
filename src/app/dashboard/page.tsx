// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/register');
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to your Dashboard</h1>
      <p>Logged in as: <strong>{session.user?.email || session.user?.name}</strong></p>
    </main>
  );
}
