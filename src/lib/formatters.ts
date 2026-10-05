// ─── Moeda BRL ───────────────────────────────────────────────
export function toBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function toBRLSimples(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Datas ───────────────────────────────────────────────────
export function toDateBR(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function toRelativo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const min = Math.floor(diff / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  if (h < 24) return `há ${h}h`
  if (d === 1) return 'ontem'
  return `há ${d} dias`
}

// ─── Adiciona dias a hoje ─────────────────────────────────────
export function addDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

// ─── Hoje ISO ─────────────────────────────────────────────────
export function hoje(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Validação / formatação de telefone ──────────────────────
export function soDígitos(v: string): string {
  return v.replace(/\D/g, '')
}

export function formatarTelefone(v: string): string {
  const d = soDígitos(v)
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

// ─── WhatsApp link ────────────────────────────────────────────
export function waLink(numero: string, mensagem: string): string {
  const d = soDígitos(numero)
  const num = d.startsWith('55') ? d : `55${d}`
  return `https://wa.me/${num}?text=${encodeURIComponent(mensagem)}`
}

// ─── Numero de orçamento com zeros ────────────────────────────
export function formatarNumero(n: number): string {
  return String(n).padStart(4, '0')
}

// ─── Slug ─────────────────────────────────────────────────────
export function toSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Cor para CSS var ─────────────────────────────────────────
export function aplicarCorPrimaria(cor: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--cor-primaria', cor)
  }
}
