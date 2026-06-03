/**
 * Aba "Gráficos" do painel da Defesa Civil (US06).
 *
 * Visualizações em tempo real (polling de 30s) calculadas no client a
 * partir dos relatos das últimas 24h — mesma fonte do mapa. Usa Recharts.
 *
 * Gráficos:
 *  - Relatos por hora (BarChart empilhado por nível) — vê picos do dia
 *  - Distribuição por nível (PieChart) — proporção baixo/médio/alto
 *  - Top bairros (BarChart horizontal) — concentração territorial
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { relatos as relatosService } from '../lib/relatos'
import {
  gerarDistribuicaoNivel,
  gerarSerieHoraria,
  gerarTopBairros,
} from '../lib/seriesHorarias'

const JANELA_HORAS = 24
const INTERVALO_POLLING_MS = 30_000

// Mesmas cores dos badges e dos marcadores do mapa — consistência visual.
const CORES_NIVEL = {
  baixo: '#10b981', // emerald-500
  medio: '#f59e0b', // amber-500
  alto: '#ef4444',  // red-500
}

const COR_PRIMARIA = '#2563eb' // blue-600

export function DashboardGraficos() {
  const [relatos, setRelatos] = useState([])
  const [carregandoInicial, setCarregandoInicial] = useState(true)
  const [erroPolling, setErroPolling] = useState(false)
  const canceladoRef = useRef(false)

  useEffect(() => {
    canceladoRef.current = false

    const buscar = async () => {
      try {
        const lista = await relatosService.listarTodos({
          ultimas_horas: JANELA_HORAS,
        })
        if (canceladoRef.current) return
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

  const serieHoraria = useMemo(
    () => gerarSerieHoraria(relatos, JANELA_HORAS),
    [relatos]
  )
  const distribuicao = useMemo(() => gerarDistribuicaoNivel(relatos), [relatos])
  const topBairros = useMemo(() => gerarTopBairros(relatos, 8), [relatos])

  const semDados = !carregandoInicial && relatos.length === 0

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

      {semDados ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">
            Sem relatos nas últimas {JANELA_HORAS}h — nada pra plotar ainda.
          </p>
        </div>
      ) : (
        <>
          <CartaoGrafico titulo="Relatos por hora (últimas 24h)">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={serieHoraria}
                margin={{ top: 8, right: 16, bottom: 4, left: -8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hora" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="baixo" stackId="a" fill={CORES_NIVEL.baixo} name="Baixo" />
                <Bar dataKey="medio" stackId="a" fill={CORES_NIVEL.medio} name="Médio" />
                <Bar dataKey="alto" stackId="a" fill={CORES_NIVEL.alto} name="Alto" />
              </BarChart>
            </ResponsiveContainer>
          </CartaoGrafico>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <CartaoGrafico titulo="Distribuição por nível (24h)">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={distribuicao}
                    dataKey="valor"
                    nameKey="rotulo"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.rotulo}: ${entry.valor}`}
                  >
                    {distribuicao.map((entry) => (
                      <Cell key={entry.nivel} fill={CORES_NIVEL[entry.nivel]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </CartaoGrafico>

            <CartaoGrafico titulo="Top bairros (24h)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topBairros}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="bairro"
                    type="category"
                    stroke="#64748b"
                    fontSize={12}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="total" fill={COR_PRIMARIA} name="Relatos" />
                </BarChart>
              </ResponsiveContainer>
            </CartaoGrafico>
          </div>
        </>
      )}

      {carregandoInicial && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 text-sm text-slate-700 flex items-center gap-2 z-[1200]"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Carregando gráficos...
        </div>
      )}
    </div>
  )
}

function CartaoGrafico({ titulo, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
        {titulo}
      </h3>
      {children}
    </div>
  )
}
