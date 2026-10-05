// Testes do motor de cálculo - execute com: node src/lib/calculos.test.mjs
// (Requer ts-node ou versão compilada; aqui usamos JS equivalente)

import { calcularItem, calcularOrcamento, r2 } from './calculos.js'

let passou = 0
let falhou = 0

function assert(desc, esperado, obtido) {
  if (Math.abs(esperado - obtido) < 0.001) {
    console.log(`  ✅ ${desc}: R$ ${obtido}`)
    passou++
  } else {
    console.error(`  ❌ ${desc}: esperado R$ ${esperado}, obtido R$ ${obtido}`)
    falhou++
  }
}

console.log('\n=== Testes do Motor de Cálculo OrçaJá ===\n')

// Produto Box de correr: por m², R$650/m², área_minima 1.5
const boxCorrer = { tipo_cobranca: 'area', preco_base: 650, area_minima: 1.5, valor_minimo: 0 }
const espelho = { tipo_cobranca: 'area', preco_base: 320, area_minima: 0.5, valor_minimo: 0 }

// Teste 1: Box 120x190, Incolor (fixo 0), Ferragem Branca (fixo 0) → R$ 1.482
const t1 = calcularItem({
  produto: boxCorrer,
  largura_cm: 120, altura_cm: 190, quantidade: 1,
  opcoesSelecionadas: [
    { tipo_acrescimo: 'fixo', valor: 0 },
    { tipo_acrescimo: 'fixo', valor: 0 },
  ]
})
assert('Box 120x190 Incolor+Branca (área 2.28m²)', 1482.00, t1.valor_total)

// Teste 2: Box 100x150 (área 1.5m², limite mínimo), Fumê (+60/m²), Preta (+120 fixo) → R$ 1.185
const t2 = calcularItem({
  produto: boxCorrer,
  largura_cm: 100, altura_cm: 150, quantidade: 1,
  opcoesSelecionadas: [
    { tipo_acrescimo: 'por_m2', valor: 60 },
    { tipo_acrescimo: 'fixo', valor: 120 },
  ]
})
assert('Box 100x150 Fumê+Preta (área mínima 1.5m²)', 1185.00, t2.valor_total)

// Teste 3: Espelho 40x50 (área 0.2m², abaixo mínimo 0.5m²) → R$ 160
const t3 = calcularItem({
  produto: espelho,
  largura_cm: 40, altura_cm: 50, quantidade: 1,
  opcoesSelecionadas: []
})
assert('Espelho 40x50 (área mínima 0.5m²)', 160.00, t3.valor_total)

// Teste 4: Orçamento com 2 itens + adicional + desconto 5%
const t4 = calcularOrcamento({
  itens: [{ valor_total: 1482 }, { valor_total: 384 }],
  adicionais: [
    { tipo: 'fixo', valor: 250, marcado: true },
    { tipo: 'fixo', valor: 80, marcado: false },
  ],
  desconto_tipo: 'percentual',
  desconto_valor: 5
})
// subtotal=1866, adicional=250, base=2116, desconto=5%=105.80, total=2010.20
assert('Subtotal 2 itens', 1866.00, t4.subtotal)
assert('Total com adicional e 5% desconto', 2010.20, t4.total)

console.log(`\n${passou} testes passaram, ${falhou} falharam.\n`)
if (falhou > 0) process.exit(1)
