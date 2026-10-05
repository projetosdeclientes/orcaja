'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, FileText, Settings } from 'lucide-react'

interface NavBottomProps {
  papel: string
}

export default function NavBottom({ papel }: NavBottomProps) {
  const pathname = usePathname()

  const links = [
    { href: '/novo', label: 'Novo', icon: PlusCircle, roles: ['dono', 'vendedor', 'super_admin'] },
    { href: '/orcamentos', label: 'Orçamentos', icon: FileText, roles: ['dono', 'vendedor', 'super_admin'] },
    { href: '/config', label: 'Configurações', icon: Settings, roles: ['dono', 'super_admin'] },
  ]

  const visibleLinks = links.filter(l => l.roles.includes(papel))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg shadow-slate-900/10 safe-area-pb">
      <div className="flex items-stretch max-w-md mx-auto">
        {visibleLinks.map(link => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-bold transition-all
                ${active
                  ? 'text-[var(--cor-primaria)]'
                  : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-blue-50/80 scale-105' : ''}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="text-[11px] tracking-tight">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
