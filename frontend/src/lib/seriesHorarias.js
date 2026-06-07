/**
 * Helpers de agregação dos relatos pros gráficos do painel (US06).
 *
 * Roda no client a partir da mesma lista que alimenta o mapa, evitando
 * uma chamada extra de API. Funções puras — todos os horários usam o
 * fuso do navegador (que pra o operador da Defesa Civil é Recife).
 */

import { ROTULOS_NIVEL } from './relatos'

const NIVEIS = ['baixo', 'medio', 'alto']

/**
 * Bucketiza relatos em janelas de 1h, do passado pro presente.
 * Cada bucket conta separadamente cada nível (pra empilhar no gráfico).
 */
export function gerarSerieHoraria(relatos, horas = 24) {
  const agora = new Date()
  const buckets = []

  for (let i = horas - 1; i >= 0; i--) {
    const t = new Date(agora.getTime() - i * 3600_000)
    buckets.push({
      hora: `${String(t.getHours()).padStart(2, '0')}h`,
      baixo: 0,
      medio: 0,
      alto: 0,
    })
  }

  for (const r of relatos) {
    const t = new Date(r.created_at)
    const horasAtras = Math.floor((agora - t) / 3600_000)
    if (horasAtras < 0 || horasAtras >= horas) continue
    const idx = horas - 1 - horasAtras
    const bucket = buckets[idx]
    if (!bucket || !NIVEIS.includes(r.nivel)) continue
    bucket[r.nivel]++
  }

  return buckets
}

/**
 * Conta relatos por nível e devolve só os níveis com pelo menos 1 ocorrência
 * (assim a pizza não vira fatia invisível pra zerados).
 */
export function gerarDistribuicaoNivel(relatos) {
  const contagem = { baixo: 0, medio: 0, alto: 0 }
  for (const r of relatos) {
    if (NIVEIS.includes(r.nivel)) contagem[r.nivel]++
  }
  return NIVEIS
    .filter((n) => contagem[n] > 0)
    .map((n) => ({ nivel: n, rotulo: ROTULOS_NIVEL[n], valor: contagem[n] }))
}

/**
 * Top N bairros por quantidade de relatos. Relatos sem bairro são ignorados.
 */
export function gerarTopBairros(relatos, limite = 8) {
  const contagem = new Map()
  for (const r of relatos) {
    if (!r.bairro?.nome) continue
    contagem.set(r.bairro.nome, (contagem.get(r.bairro.nome) || 0) + 1)
  }
  return Array.from(contagem.entries())
    .map(([bairro, total]) => ({ bairro, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limite)
}

// ── Resumo local — espelha o /api/dashboard/resumo/ pra modo demo ───────────
//
// Quando o modo demo está ativo no painel da Defesa Civil, o backend não
// conhece os relatos fake — então recalculamos KPIs, por_nivel, por_bairro
// e ultimo_relato_em no client a partir da lista combinada. Mantém o painel
// internamente consistente (mapa, tabela, KPIs e bairros críticos batem).
//
// A forma do retorno espelha o backend (apps/dashboard/views.py) — qualquer
// chave aqui precisa existir lá e vice-versa.

const PESO_NIVEL = { baixo: 1, medio: 2, alto: 3 }
const NIVEL_POR_PESO = { 0: null, 1: 'baixo', 2: 'medio', 3: 'alto' }

function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function gerarResumoLocal(relatos, janelaHoras = 24) {
  const agora = new Date()
  const inicioHoje = new Date(agora)
  inicioHoje.setHours(0, 0, 0, 0)
  const inicioSemana = new Date(agora.getTime() - 7 * 24 * 3600_000)
  const inicioMes = new Date(agora.getTime() - 30 * 24 * 3600_000)
  const inicioJanela = new Date(agora.getTime() - janelaHoras * 3600_000)

  const totais = { hoje: 0, semana: 0, mes: 0 }
  const porNivel = { baixo: 0, medio: 0, alto: 0 }
  const acumBairros = new Map() // nome -> { bairro, total, pesoMax }
  let ultimoRelatoEm = null

  for (const r of relatos) {
    const t = new Date(r.created_at)
    if (!ultimoRelatoEm || t > new Date(ultimoRelatoEm)) {
      ultimoRelatoEm = r.created_at
    }

    if (t >= inicioMes) totais.mes++
    if (t >= inicioSemana) totais.semana++
    if (t >= inicioHoje) totais.hoje++

    if (t >= inicioJanela) {
      if (porNivel[r.nivel] !== undefined) porNivel[r.nivel]++
      if (r.bairro?.nome) {
        const nome = r.bairro.nome
        let entrada = acumBairros.get(nome)
        if (!entrada) {
          entrada = {
            bairro: {
              id: r.bairro.id ?? `local-${gerarSlug(nome)}`,
              nome,
              slug: r.bairro.slug ?? gerarSlug(nome),
            },
            total: 0,
            pesoMax: 0,
          }
          acumBairros.set(nome, entrada)
        }
        entrada.total++
        const peso = PESO_NIVEL[r.nivel] ?? 0
        if (peso > entrada.pesoMax) entrada.pesoMax = peso
      }
    }
  }

  const porBairro = Array.from(acumBairros.values())
    .map(({ pesoMax, ...rest }) => ({
      ...rest,
      nivel_maximo: NIVEL_POR_PESO[pesoMax] ?? null,
    }))
    .sort(
      (a, b) =>
        b.total - a.total || a.bairro.nome.localeCompare(b.bairro.nome)
    )
    .slice(0, 10)

  return {
    janela_horas: janelaHoras,
    totais,
    por_nivel: porNivel,
    por_bairro: porBairro,
    ultimo_relato_em: ultimoRelatoEm,
  }
}
