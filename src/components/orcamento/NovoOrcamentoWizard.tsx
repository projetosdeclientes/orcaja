'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Empresa, Produto, Adicional, ItemRascunho, AdicionalSnapshot } from '@/types'
import { calcularOrcamento, calcularAdicionaisSnapshot, r2 } from '@/lib/calculos'
import { addDias, soDígitos, waLink, formatarNumero, toDateBR, toBRL } from '@/lib/formatters'
import Passo1Cliente from './Passo1Cliente'
import Passo2Itens from './Passo2Itens'
import Passo3Resumo from './Passo3Resumo'
import { Check, User, Layers, FileCheck } from 'lucide-react'

interface Props {
  empresa: Empresa
  produtos: Produto[]
  adicionais: Adicional[]
  userId: string
}

export interface DadosCliente {
  nome: string
  telefone: string
  endereco: string
}

export default function NovoOrcamentoWizard({ empresa, produtos, adicionais, userId }: Props) {
  const router = useRouter()
  const [passo, setPasso] = useState(1)
  const [dadosCliente, setDadosCliente] = useState<DadosCliente>({ nome: '', telefone: '', endereco: '' })
  const [itens, setItens] = useState<ItemRascunho[]>([])
  const [marcados, setMarcados] = useState<Record<string, boolean>>(
    Object.fromEntries(adicionais.map(a => [a.id, a.marcado_por_padrao]))
  )
  const [descontoTipo, setDescontoTipo] = useState<'valor' | 'percentual'>('percentual')
  const [descontoValor, setDescontoValor] = useState(0)
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)

  // Cálculos finais
  const subtotal = r2(itens.reduce((acc, i) => acc + i.valor_total, 0))
  const adicionaisSnapshot: AdicionalSnapshot[] = calcularAdicionaisSnapshot(adicionais, subtotal, marcados)
  const { adicionais_total, desconto_total, total } = calcularOrcamento({
    itens,
    adicionais: adicionaisSnapshot,
    desconto_tipo: descontoTipo,
    desconto_valor: descontoValor,
  })

  async function salvar(enviarWhats = false) {
    if (itens.length === 0) {
      toast.error('Adicione ao menos um item ao orçamento.')
      return
    }
    setSaving(true)
    const validadeAte = addDias(empresa.validade_dias)

    try {
      const res = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: dadosCliente.nome,
          cliente_telefone: soDígitos(dadosCliente.telefone) || null,
          cliente_endereco: dadosCliente.endereco || null,
          subtotal,
          desconto_tipo: descontoValor > 0 ? descontoTipo : null,
          desconto_valor: descontoValor,
          desconto_total,
          adicionais_snapshot: adicionaisSnapshot,
          total,
          validade_ate: validadeAte,
          observacoes: observacoes || null,
          itens: itens.map(it => ({
            produto_nome: it.produto.nome,
            descricao: it.descricao,
            largura_cm: it.largura_cm,
            altura_cm: it.altura_cm,
            quantidade: it.quantidade,
            area_m2: it.area_m2,
            valor_unitario: it.valor_unitario,
            valor_total: it.valor_total,
            snapshot: it.snapshot,
          })),
        }),
      })

      const orc = await res.json()
      if (!res.ok || !orc.id) {
        toast.error(orc.error || 'Erro ao salvar orçamento.')
        setSaving(false)
        return
      }

      toast.success(`Orçamento #${formatarNumero(orc.numero)} gerado com sucesso!`)

      if (enviarWhats && dadosCliente.telefone) {
        const link = `${window.location.origin}/o/${orc.token_publico}`
        const msg = `Olá, ${dadosCliente.nome}! Segue seu orçamento nº ${formatarNumero(
          orc.numero
        )} da ${empresa.nome}. Total: ${toBRL(total)}, válido até ${toDateBR(
          validadeAte
        )}. Veja todos os detalhes aqui: ${link}`
        window.open(waLink(dadosCliente.telefone, msg), '_blank')
      }

      router.push(`/orcamentos/${orc.id}`)
      router.refresh()
    } catch {
      toast.error('Erro de conexão ao salvar orçamento.')
      setSaving(false)
    }
  }

  const steps = [
    { n: 1, label: 'Cliente', icon: User, desc: 'Identificação rápida' },
    { n: 2, label: 'Itens & Medidas', icon: Layers, desc: 'Produtos sob medida' },
    { n: 3, label: 'Resumo & Envio', icon: FileCheck, desc: 'Taxas, desconto e total' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Stepper Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon
            const isCompleted = passo > s.n
            const isCurrent = passo === s.n
            return (
              <div key={s.n} className="flex-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (s.n < passo) setPasso(s.n)
                  }}
                  disabled={s.n > passo}
                  className={`flex items-center gap-3 text-left transition-all ${
                    s.n <= passo ? 'cursor-pointer' : 'cursor-default opacity-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'text-white shadow-md'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                    style={isCurrent ? { background: 'var(--cor-primaria)' } : undefined}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : s.n}
                  </div>

                  <div className="hidden sm:block min-w-0">
                    <span
                      className={`text-xs font-bold block leading-tight truncate ${
                        isCurrent ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-none mt-0.5 truncate">
                      {s.desc}
                    </span>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`hidden md:block flex-1 h-1 rounded-full transition-colors mx-2 ${
                      passo > s.n ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Passo {passo} de 3: {steps[passo - 1].label}</span>
            <span className="text-slate-400">{Math.round((passo / 3) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(passo / 3) * 100}%`,
                background: 'var(--cor-primaria)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      {passo === 1 && (
        <Passo1Cliente
          dados={dadosCliente}
          onChange={setDadosCliente}
          onNext={() => setPasso(2)}
        />
      )}

      {passo === 2 && (
        <Passo2Itens
          produtos={produtos}
          itens={itens}
          onItensChange={setItens}
          onBack={() => setPasso(1)}
          onNext={() => setPasso(3)}
        />
      )}

      {passo === 3 && (
        <Passo3Resumo
          dadosCliente={dadosCliente}
          itens={itens}
          adicionais={adicionais}
          marcados={marcados}
          onMarcadosChange={setMarcados}
          descontoTipo={descontoTipo}
          descontoValor={descontoValor}
          onDescontoTipoChange={setDescontoTipo}
          onDescontoValorChange={setDescontoValor}
          observacoes={observacoes}
          onObservacoesChange={setObservacoes}
          subtotal={subtotal}
          adicionaisTotal={adicionais_total}
          descontoTotal={desconto_total}
          total={total}
          validadeDias={empresa.validade_dias}
          temTelefone={!!dadosCliente.telefone}
          saving={saving}
          onBack={() => setPasso(2)}
          onSalvar={() => salvar(false)}
          onEnviarWhats={() => salvar(true)}
          onPrevia={() => {
            toast.info('Salve o orçamento primeiro para abrir a prévia pública.')
          }}
        />
      )}
    </div>
  )
}
