/**
 * Select dos 94 bairros oficiais de Recife.
 *
 * Compartilha o cache de ``useBairros`` — múltiplas instâncias na mesma
 * sessão fazem uma única requisição. ``value`` é o id (number) ou null.
 */

import { useBairros } from '../lib/bairros'

export function BairroSelect({
  value,
  onChange,
  id = 'bairro',
  name = 'bairro',
  disabled = false,
  required = false,
  placeholder = '— Selecione um bairro —',
  className = '',
}) {
  const { bairros, carregando, erro } = useBairros()

  const handleChange = (e) => {
    const v = e.target.value
    onChange(v ? parseInt(v, 10) : null)
  }

  const classes =
    className ||
    'w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500'

  if (erro) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Não foi possível carregar a lista de bairros.
      </p>
    )
  }

  return (
    <select
      id={id}
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled || carregando}
      required={required}
      className={classes}
    >
      <option value="">{carregando ? 'Carregando bairros...' : placeholder}</option>
      {bairros.map((bairro) => (
        <option key={bairro.id} value={bairro.id}>
          {bairro.nome}
        </option>
      ))}
    </select>
  )
}
