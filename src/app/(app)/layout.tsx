import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-server'
import NavBottom from '@/components/shared/NavBottom'
import Header from '@/components/shared/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession()
  if (!session) redirect('/login')

  const { perfil, empresa } = session

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Header empresa={empresa} perfil={perfil} userEmail={session.user.email} />
      <main className="flex-1 pb-24 md:pb-12 pt-16 md:pt-20">
        {children}
      </main>
      <NavBottom papel={perfil.papel} />
    </div>
  )
}
