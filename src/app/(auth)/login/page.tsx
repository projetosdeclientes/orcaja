'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
  Calculator,
  MessageSquare,
  FileText,
  Sparkles,
  HelpCircle,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('lpaulinoperfetti@gmail.com')
  const [senha, setSenha] = useState('123456')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e?: React.FormEvent, customEmail?: string, customSenha?: string) {
    if (e) e.preventDefault()
    setLoading(true)

    const loginEmail = customEmail || email
    const loginSenha = customSenha || senha

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginSenha }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'E-mail ou senha incorretos.')
        setLoading(false)
        return
      }

      toast.success('Login infinito ativado! Bem-vindo ao OrçaJá.')
      router.push('/novo')
      router.refresh()
    } catch {
      toast.error('Erro de conexão ao efetuar login.')
      setLoading(false)
    }
  }

  const suporte = process.env.NEXT_PUBLIC_SUPORTE_WHATSAPP ?? '5511999999999'

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-950">
      {/* ─── LADO ESQUERDO (Apenas Desktop): Showcase Visual da Plataforma ─── */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Glow de fundo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Topo: Logo & Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20"
            style={{ background: 'var(--cor-primaria)' }}
          >
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="24" height="28" rx="3" fill="white" fillOpacity=".2" stroke="white" strokeWidth="2"/>
              <rect x="8" y="10" width="16" height="2.5" rx="1" fill="white"/>
              <rect x="8" y="16" width="12" height="2.5" rx="1" fill="white"/>
              <rect x="8" y="22" width="14" height="2.5" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tight">OrçaJá</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                SaaS MVP v1.0
              </span>
            </div>
            <p className="text-xs text-blue-200/70">Orçamentos por medidas sob controle</p>
          </div>
        </div>

        {/* Centro: Mensagem Principal & Destaques */}
        <div className="relative z-10 my-10 space-y-8 max-w-xl">
          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Orçamentos profissionais na velocidade do WhatsApp.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Criado especialmente para vidraçarias, marmorarias e empresas de esquadrias gerarem propostas com medidas exatas na frente do cliente.
            </p>
          </div>

          {/* Destaques em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Calculator size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">Cálculo de m²</h4>
              <p className="text-xs text-slate-400">Regras de espessura, mínimos e opções em tempo real.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <MessageSquare size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">1-Click WhatsApp</h4>
              <p className="text-xs text-slate-400">Mensagem pré-formatada pronta para envio ao cliente.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">Proposta / PDF</h4>
              <p className="text-xs text-slate-400">Link interativo para aprovação e impressão limpa.</p>
            </div>
          </div>

          {/* Mini Card Simulação */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="font-bold text-white">#0001 · Carlos Eduardo Mendes</p>
                <p className="text-slate-400">Box de Vidro Fumê 8mm + Kit Preto</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-emerald-400">R$ 1.116,10</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Aprovado</span>
            </div>
          </div>
        </div>

        {/* Rodapé Esquerdo */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-white/10 pt-4">
          <span>Multi-tenant seguro · Configuração única por empresa</span>
          <span>© 2026 OrçaJá</span>
        </div>
      </div>

      {/* ─── LADO DIREITO (Desktop & Mobile): Formulário de Acesso ─── */}
      <div className="lg:col-span-5 bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 min-h-screen">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 flex flex-col gap-6 my-auto">
          {/* Header Mobile / Topo do Card */}
          <div className="text-center space-y-2">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-md text-white mb-1"
              style={{ background: 'var(--cor-primaria)' }}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="28" rx="3" fill="white" fillOpacity=".2" stroke="white" strokeWidth="2"/>
                <rect x="8" y="10" width="16" height="2.5" rx="1" fill="white"/>
                <rect x="8" y="16" width="12" height="2.5" rx="1" fill="white"/>
                <rect x="8" y="22" width="14" height="2.5" rx="1" fill="white"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Acesse o OrçaJá
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Entre com as credenciais autorizadas da sua conta.
            </p>
          </div>

          {/* Banner de Acesso com Login Infinito Solicitado */}
          <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-blue-900 block leading-tight">
                  Conta com Acesso Permanente
                </span>
                <span className="text-[11px] text-blue-700/80 font-medium">
                  Configurada com sessão de 10 anos
                </span>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 text-xs text-slate-700 border border-blue-100 flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">E-mail:</span>
                <strong className="text-slate-900 font-mono">lpaulinoperfetti@gmail.com</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Senha:</span>
                <strong className="text-slate-900 font-mono">123456</strong>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleLogin(undefined, 'lpaulinoperfetti@gmail.com', '123456')}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 bg-blue-600 hover:bg-blue-700"
            >
              <Zap size={14} />
              <span>Entrar com 1 Clique (Luigi)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ou digite seus dados
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Formulário de Login */}
          <form onSubmit={e => handleLogin(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] transition-all"
                  placeholder="seu@email.com"
                />
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] transition-all"
                  placeholder="••••••"
                />
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              id="btn-entrar"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 mt-1"
              style={{ background: 'var(--cor-primaria)' }}
            >
              <span>{loading ? 'Validando acesso...' : 'Entrar no OrçaJá'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Suporte e Rodapé */}
          <div className="pt-2 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              Dúvidas ou problemas no login?{' '}
              <a
                href={`https://wa.me/${suporte}?text=${encodeURIComponent('Olá! Preciso de ajuda com o acesso ao OrçaJá.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800 font-semibold"
              >
                Fale com o suporte
              </a>
            </p>

            <div className="flex justify-center items-center gap-3 text-xs text-slate-400">
              <Link href="/termos" className="hover:text-slate-600">Termos de uso</Link>
              <span>·</span>
              <Link href="/privacidade" className="hover:text-slate-600">Privacidade</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
