import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-server'

export default async function Home() {
  const session = await getCurrentSession()
  if (!session) redirect('/login')

  if (session.perfil.papel === 'super_admin') {
    redirect('/admin')
  }

  redirect('/novo')
}
