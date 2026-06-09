/**
 * Input de telefone com máscara brasileira.
 *
 * - Exibe: +55 (81) 99999-9999
 * - Armazena (value / onChange): dígitos crus — 5581999999999
 * - DDI +55 é fixo; o usuário digita só DDD + número.
 *
 * Props:
 *   value      — dígitos crus (string), pode ser '' ou undefined
 *   onChange   — fn(rawDigits: string) chamada a cada tecla
 *   id         — id do input (para label htmlFor)
 *   className  — classes extras pro <input>
 *   erro       — mensagem de erro abaixo do input
 *   ...rest    — demais props repassadas ao <input> (required, disabled…)
 */

const MAX_DIGITOS = 13 // 55 + DDD(2) + 9 dígitos

function apenasDigitos(str) {
  return (str || '').replace(/\D/g, '')
}

function garantir55(digits) {
  if (digits.startsWith('55')) return digits
  return '55' + digits
}

function formatarDisplay(raw) {
  const digits = apenasDigitos(raw)
  // Remove o DDI 55 do inicio para formatar só a parte local
  const local = digits.startsWith('55') ? digits.slice(2) : digits

  if (!local) return ''

  const ddd    = local.slice(0, 2)
  const numero = local.slice(2)

  if (local.length <= 2) return `+55 (${ddd}`
  if (!numero)           return `+55 (${ddd}) `

  // mobile = 9 dígitos, fixo = 8
  const isMobile = numero.length > 8
  const separador = isMobile ? 5 : 4

  if (numero.length <= separador) return `+55 (${ddd}) ${numero}`
  return `+55 (${ddd}) ${numero.slice(0, separador)}-${numero.slice(separador, separador + 4)}`
}

export function TelefoneInput({ value = '', onChange, id, className = '', erro, ...rest }) {
  function handleChange(e) {
    const inputVal = e.target.value

    // Se o usuário apagou tudo (inclusive o +55), devolve string vazia
    if (!inputVal) {
      onChange('')
      return
    }

    const digitos   = apenasDigitos(inputVal)
    const com55     = garantir55(digitos)
    const limitado  = com55.slice(0, MAX_DIGITOS)
    onChange(limitado)
  }

  const inputClasse = [
    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    erro ? 'border-red-400' : 'border-slate-200',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={formatarDisplay(value)}
        onChange={handleChange}
        placeholder="+55 (81) 99999-9999"
        className={inputClasse}
        {...rest}
      />
      {erro && <p className="text-xs text-red-600 mt-1">{erro}</p>}
    </div>
  )
}
