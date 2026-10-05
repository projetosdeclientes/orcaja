'use client'
import { formatarTelefone } from '@/lib/formatters'
import type { DadosCliente } from './NovoOrcamentoWizard'
import { User, Phone, MapPin, ArrowRight } from 'lucide-react'

interface Props {
  dados: DadosCliente
  onChange: (d: DadosCliente) => void
  onNext: () => void
}

export default function Passo1Cliente({ dados, onChange, onNext }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Dados do Cliente
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Informe o nome e o WhatsApp do cliente para identificação e envio rápido da proposta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nome do cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="cliente-nome"
                required
                type="text"
                value={dados.nome}
                onChange={e => onChange({ ...dados, nome: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:border-transparent transition-all"
                placeholder="Ex.: Maria Souza"
                autoFocus
              />
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              WhatsApp do cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="cliente-telefone"
                required
                type="tel"
                inputMode="numeric"
                value={dados.telefone}
                onChange={e => onChange({ ...dados, telefone: formatarTelefone(e.target.value) })}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:border-transparent transition-all"
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Endereço da Obra / Entrega <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <div className="relative">
            <input
              id="cliente-endereco"
              type="text"
              value={dados.endereco}
              onChange={e => onChange({ ...dados, endereco: e.target.value })}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] focus:border-transparent transition-all"
              placeholder="Rua, número, bairro, condomínio ou cidade"
            />
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            id="btn-continuar-p1"
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-[0.99] transition-all"
            style={{ background: 'var(--cor-primaria)' }}
          >
            <span>Avançar para Escolha de Itens</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
