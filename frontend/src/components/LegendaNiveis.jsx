/**
 * Legenda flutuante com as cores dos níveis de alagamento.
 * Renderizada fora do MapContainer — fica posicionada absoluta sobre o mapa.
 */

const ITENS = [
  { cor: '#10b981', rotulo: 'Baixo', descricao: 'Poças, meio-fio' },
  { cor: '#f59e0b', rotulo: 'Médio', descricao: 'Cobre a rua' },
  { cor: '#dc2626', rotulo: 'Alto', descricao: 'Intransitável' },
]

export function LegendaNiveis() {
  return (
    <div
      className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-sm p-3 max-w-[220px]"
      role="region"
      aria-label="Legenda dos níveis de alagamento"
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Nível do alagamento
      </div>
      <ul className="space-y-1.5">
        {ITENS.map((item) => (
          <li key={item.rotulo} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: item.cor }}
              aria-hidden="true"
            />
            <span className="text-slate-800 font-medium">{item.rotulo}</span>
            <span className="text-slate-500 text-xs">— {item.descricao}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
