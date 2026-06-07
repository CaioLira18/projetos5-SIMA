/**
 * Aba "Visão geral" do painel da Defesa Civil (US06).
 *
 * Conteúdo:
 *  - 4 KPIs (hoje, 7d, 30d, nível alto nas últimas 24h).
 *  - Mapa de Recife (reaproveita MapaRecife do US01) + sidebar Bairros críticos.
 *  - Tabela de relatos recentes.
 *
 * Dois fetches em paralelo a cada 30s: /api/dashboard/resumo/ pra os
 * agregados e /api/relatos/?ultimas_horas=24 pra mapa e tabela.
 *
 * O header e a navegação por abas ficam no DashboardLayout.
 */

import { useEffect, useRef, useState } from 'react'

import { LegendaNiveis } from '../components/LegendaNiveis'
import { MapaRecife } from '../components/MapaRecife'
import { BairrosCriticos } from '../components/dashboard/BairrosCriticos'
import { KpiCard } from '../components/dashboard/KpiCard'
import { TabelaRelatos } from '../components/dashboard/TabelaRelatos'
import { dashboard as dashboardService } from '../lib/dashboard'
import { relatos as relatosService } from '../lib/relatos'
import { gerarResumoLocal } from '../lib/seriesHorarias'
// DEMO-MODE — remover antes de subir em produção (ver lib/demoMode.jsx)
import { useDemoMode } from '../lib/demoMode'

const JANELA_HORAS = 24
const INTERVALO_POLLING_MS = 30_000

const fmtRelativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function tempoRelativo(iso) {
  if (!iso) return null
  const diffMin = Math.round((new Date(iso) - Date.now()) / 60000)
  if (Math.abs(diffMin) < 60) return fmtRelativo.format(diffMin, 'minute')
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 24) return fmtRelativo.format(diffHr, 'hour')
  return fmtRelativo.format(Math.round(diffHr / 24), 'day')
}

export function Dashboard() {
  const [resumo, setResumo] = useState(null)
  const [relatos, setRelatos] = useState([])
  const [carregandoInicial, setCarregandoInicial] = useState(true)
  const [erroPolling, setErroPolling] = useState(false)
  const canceladoRef = useRef(false)

  useEffect(() => {
    canceladoRef.current = false

    const buscar = async () => {
      try {
        const [novoResumo, lista] = await Promise.all([
          dashboardService.resumo(),
          relatosService.listarTodos({ ultimas_horas: JANELA_HORAS }),
        ])
        if (canceladoRef.current) return
        setResumo(novoResumo)
        setRelatos(lista)
        setErroPolling(false)
      } catch {
        if (canceladoRef.current) return
        setErroPolling(true)
      } finally {
        if (!canceladoRef.current) setCarregandoInicial(false)
      }
    }

    buscar()
    const id = setInterval(buscar, INTERVALO_POLLING_MS)

    return () => {
      canceladoRef.current = true
      clearInterval(id)
    }
  }, [])

  // DEMO-MODE — quando ativo, mistura relatos fictícios e recalcula o resumo
  // localmente pra manter mapa/tabela/KPIs/bairros críticos consistentes
  // (o backend não conhece os relatos fake).
  const { ativo: demoAtivo, relatosFalsos } = useDemoMode()
  const relatosExibidos = demoAtivo ? [...relatos, ...relatosFalsos] : relatos
  const resumoExibido = demoAtivo ? gerarResumoLocal(relatosExibidos) : resumo
  // FIM DEMO-MODE

  const ultimoRel = tempoRelativo(resumoExibido?.ultimo_relato_em)

  return (
    <div className="space-y-4 sm:space-y-6">
      {erroPolling && !carregandoInicial && (
        <div
          className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-sm"
          role="alert"
        >
          Não foi possível atualizar agora. Tentando de novo em instantes...
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          rotulo="Hoje"
          valor={resumoExibido?.totais.hoje ?? '—'}
          sublabel="desde 00:00"
          cor="blue"
        />
        <KpiCard
          rotulo="Últimos 7 dias"
          valor={resumoExibido?.totais.semana ?? '—'}
        />
        <KpiCard
          rotulo="Últimos 30 dias"
          valor={resumoExibido?.totais.mes ?? '—'}
        />
        <KpiCard
          rotulo="Nível alto (24h)"
          valor={resumoExibido?.por_nivel.alto ?? '—'}
          sublabel={ultimoRel ? `último relato ${ultimoRel}` : ''}
          cor="red"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[450px] sm:h-[520px] relative">
          <MapaRecife relatos={relatosExibidos} />
          <LegendaNiveis />
        </div>
        <BairrosCriticos bairros={resumoExibido?.por_bairro ?? []} />
      </section>

      <section>
        <TabelaRelatos relatos={relatosExibidos} />
      </section>

      {carregandoInicial && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 text-sm text-slate-700 flex items-center gap-2 z-[1200]"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Carregando dados...
        </div>
      )}
    </div>
  )
}
