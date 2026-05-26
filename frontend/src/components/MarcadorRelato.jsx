/**
 * Marcador de um relato de alagamento no mapa (US01).
 *
 * Usamos CircleMarker (px fixos, independente do zoom) em vez de Marker
 * com ícone — mais leve e sem dependência de assets externos.
 */

import { CircleMarker, Popup } from 'react-leaflet'

const CORES = {
  baixo: '#10b981', // emerald-500
  medio: '#f59e0b', // amber-500
  alto: '#dc2626', // red-600
}

const ROTULOS = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
}

function formatarTempoRelativo(timestamp) {
  const agora = new Date()
  const data = new Date(timestamp)
  const diffMs = agora - data
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `há ${diffD} d`
}

export function MarcadorRelato({ relato }) {
  const cor = CORES[relato.nivel] || '#64748b'
  const rotulo = ROTULOS[relato.nivel] || relato.nivel
  const bairro = relato.bairro?.nome || 'Bairro não informado'
  const autor = relato.user?.nome || 'Anônimo'

  return (
    <CircleMarker
      center={[Number(relato.lat), Number(relato.lng)]}
      radius={8}
      pathOptions={{
        color: '#ffffff',
        weight: 2,
        fillColor: cor,
        fillOpacity: 0.9,
      }}
    >
      <Popup>
        <div className="text-sm space-y-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cor }}
              aria-hidden="true"
            />
            <strong className="text-slate-800">Nível {rotulo}</strong>
          </div>
          <div className="text-slate-600">
            {bairro} · {formatarTempoRelativo(relato.created_at)}
          </div>
          {relato.descricao && (
            <p className="text-slate-700 italic">"{relato.descricao}"</p>
          )}
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Reportado por {autor}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  )
}
