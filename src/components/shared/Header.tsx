'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { aplicarCorPrimaria } from '@/lib/formatters'
import { LogOut, Shield, PlusCircle, FileText, Settings, User } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  empresa: { id: string; nome: string; logo_url: string | null; cor_primaria: string; ativo: boolean } | null
  perfil: { papel: string; nome: string; empresa_id: string | null }
  userEmail?: string
}

export default function Header({ empresa, perfil, userEmail }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (empresa?.cor_primaria) {
      aplicarCorPrimaria(empresa.cor_primaria)
    }
  }, [empresa?.cor_primaria])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.info('Sessão encerrada com sucesso.')
      router.push('/login')
      router.refresh()
    } catch {
      router.push('/login')
    }
  }

  const navLinks = [
    { href: '/novo', label: 'Novo Orçamento', icon: PlusCircle },
    { href: '/orcamentos', label: 'Orçamentos', icon: FileText },
    { href: '/config', label: 'Configurações', icon: Settings },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/novo" className="flex items-center gap-3 shrink-0 group">
            {empresa?.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={empresa.nome}
                className="h-9 w-9 rounded-xl object-contain border border-slate-200"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform"
                style={{ background: 'var(--cor-primaria)' }}
              >
                {empresa?.nome?.[0] ?? 'O'}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight block truncate">
                {empresa?.nome ?? 'OrçaJá'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block leading-none truncate">
                {userEmail ?? 'lpaulinoperfetti@gmail.com'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-blue-50 text-[var(--cor-primaria)] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Painel Super Admin do Sistema"
          >
            <Shield size={14} className="text-amber-600" />
            <span className="hidden sm:inline">Super Admin</span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-100"
            title="Encerrar sessão"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{loggingOut ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
