'use client'
import { Check, MessageSquare, Save, ArrowLeft, Percent, DollarSign, Calendar, User, Phone, MapPin, Sparkles } from 'lucide-react'
import type { Adicional, ItemRascunho } from '@/types'
import type { DadosCliente } from './NovoOrcamentoWizard'
import { toBRL, toDateBR, addDias } from '@/lib/formatters'

interface Props {
  dadosCliente: DadosCliente
  itens: ItemRascunho[]
  adicionais: Adicional[]
  marcados: Record<string, boolean>
  onMarcadosChange: (marcados: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void
  descontoTipo: 'valor' | 'percentual'
  descontoValor: number
  onDescontoTipoChange: (t: 'valor' | 'percentual') => void
  onDescontoValorChange: (v: number) => void
  observacoes: string
  onObservacoesChange: (obs: string) => void
  subtotal: number
  adicionaisTotal: number
  descontoTotal: number
  total: number
  validadeDias: number
  temTelefone: boolean
  saving: boolean
  onBack: () => void
  onSalvar: () => void
  onEnviarWhats: () => void
  onPrevia: () => void
}

export default function Passo3Resumo({
  dadosCliente,
  itens,
  adicionais,
  marcados,
  onMarcadosChange,
  descontoTipo,
  descontoValor,
  onDescontoTipoChange,
  onDescontoValorChange,
  observacoes,
  onObservacoesChange,
  subtotal,
  adicionaisTotal,
  descontoTotal,
  total,
  validadeDias,
  temTelefone,
  saving,
  onBack,
  onSalvar,
  onEnviarWhats,
  onPrevia,
}: Props) {
  const dataValidade = addDias(validadeDias)

  function toggleAdicional(id: string) {
    onMarcadosChange(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna 1 (Desktop 7 cols): Detalhamento do Pedido */}
      <div className="lg:col-span-7 space-y-4">
        {/* Card Cliente */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dados do Cliente
            </span>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Editar
            </button>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900">{dadosCliente.nome}</span>
            </div>
            {dadosCliente.telefone && (
              <div className="flex items-center gap-2 text-slate-600 text-xs">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <span className="font-semibold">{dadosCliente.telefone}</span>
              </div>
            )}
            {dadosCliente.endereco && (
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <MapPin size={15} className="text-slate-400 shrink-0" />
                <span>{dadosCliente.endereco}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Itens do Orçamento */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itens Orçados ({itens.length})
            </span>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Alterar itens
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {itens.map(item => (
              <div key={item.tempId} className="py-3 flex justify-between items-start text-sm">
                <div className="pr-3">
                  <span className="font-bold text-slate-900 block">
                    {item.quantidade}x {item.produto_nome}
                  </span>
                  {item.largura_cm && item.altura_cm && (
                    <span className="text-xs text-slate-500 font-medium block">
                      Dimensões: {item.largura_cm} × {item.altura_cm} cm
                      {item.area_m2 ? ` (${item.area_m2} m²)` : ''}
                    </span>
                  )}
                  {item.descricao && (
                    <span className="text-xs text-slate-400 block mt-0.5">{item.descricao}</span>
                  )}
                </div>
                <span className="font-bold text-slate-900 shrink-0 text-base">
                  {toBRL(item.valor_total)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>Subtotal dos itens</span>
            <span className="text-sm text-slate-800">{toBRL(subtotal)}</span>
          </div>
        </div>

        {/* Card Adicionais / Serviços */}
        {adicionais.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Serviços & Taxas Adicionais
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Marque os opcionais inclusos nesta proposta comercial.
              </p>
            </div>

            <div className="space-y-2">
              {adicionais.map(ad => {
                const isChecked = marcados[ad.id] ?? ad.marcado_por_padrao
                const valorTexto =
                  ad.tipo === 'fixo'
                    ? `+ ${toBRL(ad.valor)}`
                    : `+ ${ad.valor}% (+ ${toBRL((ad.valor / 100) * subtotal)})`

                return (
                  <label
                    key={ad.id}
                    onClick={() => toggleAdicional(ad.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'border-blue-500/50 bg-blue-50/40 text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-[var(--cor-primaria)] border-transparent text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{ad.nome}</span>
                    </div>
                    <span className={`text-xs font-bold ${isChecked ? 'text-blue-700' : 'text-slate-400'}`}>
                      {valorTexto}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Observações / Condições no Orçamento
          </label>
          <textarea
            id="observacoes-orcamento"
            rows={3}
            value={observacoes}
            onChange={e => onObservacoesChange(e.target.value)}
            placeholder="Ex.: Prazo de entrega de 10 dias úteis. Condição de pagamento: 50% de entrada e restante na conclusão..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
          />
        </div>
      </div>

      {/* Coluna 2 (Desktop 5 cols): Fechamento, Desconto, Total & Ações */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        {/* Card Desconto */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aplicar Desconto
            </span>
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => onDescontoTipoChange('percentual')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  descontoTipo === 'percentual'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                % Porcentagem
              </button>
              <button
                type="button"
                onClick={() => onDescontoTipoChange('valor')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  descontoTipo === 'valor'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                R$ Valor
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                id="input-desconto"
                type="number"
                inputMode="decimal"
                min="0"
                value={descontoValor || ''}
                onChange={e => onDescontoValorChange(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                placeholder="0"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {descontoTipo === 'percentual' ? <Percent size={16} /> : <DollarSign size={16} />}
              </div>
            </div>
            {descontoTotal > 0 && (
              <div className="bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-2xl text-xs font-bold border border-emerald-200/60 shrink-0">
                - {toBRL(descontoTotal)}
              </div>
            )}
          </div>
        </div>

        {/* Card Total Destaque */}
        <div
          className="rounded-3xl p-6 text-white shadow-xl space-y-3"
          style={{
            background: 'linear-gradient(135deg, var(--cor-primaria) 0%, #1e40af 100%)',
          }}
        >
          <div className="flex justify-between items-center text-blue-100 text-xs">
            <span>Subtotal + Adicionais</span>
            <span className="font-semibold">{toBRL(subtotal + adicionaisTotal)}</span>
          </div>

          {descontoTotal > 0 && (
            <div className="flex justify-between items-center text-emerald-200 text-xs">
              <span>Desconto especial</span>
              <span className="font-semibold">- {toBRL(descontoTotal)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-white/20 flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
                Valor Total da Proposta
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight">{toBRL(total)}</span>
            </div>
            <div className="text-right text-xs text-blue-200">
              <span className="flex items-center gap-1 font-medium">
                <Calendar size={13} />
                Válido até {toDateBR(dataValidade)}
              </span>
            </div>
          </div>
        </div>

        {/* Ações de Salvamento */}
        <div className="space-y-2.5 pt-1">
          {temTelefone && (
            <button
              id="btn-salvar-whats"
              type="button"
              disabled={saving}
              onClick={onEnviarWhats}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60 bg-emerald-600"
            >
              <MessageSquare size={20} />
              <span>{saving ? 'Gravando proposta...' : 'Salvar e Enviar no WhatsApp'}</span>
            </button>
          )}

          <button
            id="btn-apenas-salvar"
            type="button"
            disabled={saving}
            onClick={onSalvar}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
            style={{ background: 'var(--cor-primaria)' }}
          >
            <Save size={18} />
            <span>{saving ? 'Gravando proposta...' : 'Salvar Orçamento'}</span>
          </button>

          <button
            id="btn-voltar-resumo"
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-800 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Voltar para edição de itens</span>
          </button>
        </div>
      </div>
    </div>
  )
}
