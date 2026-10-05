import type { StatusOrcamento } from '@/types'

const map: Record<StatusOrcamento, { label: string; cls: string }> = {
  enviado:  { label: 'Enviado',  cls: 'badge-enviado' },
  aprovado: { label: 'Aprovado', cls: 'badge-aprovado' },
  perdido:  { label: 'Perdido',  cls: 'badge-perdido' },
}

export default function StatusBadge({ status }: { status: StatusOrcamento }) {
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
