import { cookies } from 'next/headers'
import { localStore, isSupabaseConfigured } from './store'
import type { Empresa, Perfil } from '@/types'

export interface CurrentSession {
  user: {
    id: string
    email: string
  }
  perfil: Perfil
  empresa: Empresa | null
}

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('orcaja_session')

  if (sessionCookie?.value) {
    try {
      const data = JSON.parse(decodeURIComponent(sessionCookie.value))
      const empresa = localStore.getEmpresa()
      return {
        user: {
          id: data.id || 'user-luigi-001',
          email: data.email || 'lpaulinoperfetti@gmail.com',
        },
        perfil: {
          id: data.id || 'user-luigi-001',
          nome: data.nome || 'Luigi Perfetti',
          papel: data.papel || 'dono',
          empresa_id: data.empresa_id || empresa.id,
        },
        empresa,
      }
    } catch {
      // Ignora erro de parse
    }
  }

  // Se o Supabase estiver configurado
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('id, papel, empresa_id, nome')
          .eq('id', user.id)
          .single()

        let empresa = null
        if (perfil?.empresa_id) {
          const { data: empData } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', perfil.empresa_id)
            .single()
          empresa = empData
        }

        return {
          user: { id: user.id, email: user.email ?? '' },
          perfil: perfil
            ? { id: user.id, nome: perfil.nome, papel: perfil.papel, empresa_id: perfil.empresa_id }
            : {
                id: user.id,
                nome: user.email?.split('@')[0] ?? 'Usuário',
                papel: 'dono' as const,
                empresa_id: empresa?.id ?? null,
              },
          empresa,
        }
      }
    } catch {
      // Falha de rede com supabase
    }
  }

  return null
}
