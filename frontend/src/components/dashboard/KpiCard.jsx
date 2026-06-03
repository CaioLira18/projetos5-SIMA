/**
 * Card de métrica do painel da Defesa Civil (US06).
 * Mostra um número grande com rótulo e sublabel opcional.
 */

const CORES = {
  blue: 'text-blue-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
  slate: 'text-slate-800',
}

export function KpiCard({ rotulo, valor, sublabel, cor = 'slate' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {rotulo}
      </p>
      <p className={`text-3xl font-bold mt-1 tabular-nums ${CORES[cor] || CORES.slate}`}>
        {valor}
      </p>
      {sublabel && (
        <p className="text-xs text-slate-500 mt-1 truncate">{sublabel}</p>
      )}
    </div>
  )
}
