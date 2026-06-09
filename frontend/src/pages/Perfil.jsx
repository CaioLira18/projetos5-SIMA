/**
 * Página de edição de perfil do usuário (todos os roles).
 *
 * Permite editar nome, telefone, bairro e localização (GPS ou CEP).
 * Faz PATCH /api/users/me/ e atualiza o contexto de autenticação.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { BuscaCEP } from '../components/BuscaCEP'
import { TelefoneInput } from '../components/TelefoneInput'
import { useAuth } from '../contexts/AuthContext'
import { normalizarParaSlug, useBairros } from '../lib/bairros'
import { reverseGeocode } from '../lib/geocoder'
import { usuarios } from '../lib/usuarios'

export function Perfil() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { bairros } = useBairros()

  const [form, setForm] = useState({ nome: '', telefone: '', bairro_id: '' })
  const [localizacao, setLocalizacao] = useState(null) // { lat, lng, endereco }
  const [modoLocalizacao, setModoLocalizacao] = useState('gps')
  const [obtendoGPS, setObtendoGPS] = useState(false)
  const [avisoGPS, setAvisoGPS] = useState(null)

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      nome:      user.nome      || '',
      telefone:  user.telefone  || '',
      bairro_id: user.bairro?.id ?? '',
    })
    if (user.lat && user.lng) {
      setLocalizacao({
        lat:     Number(user.lat),
        lng:     Number(user.lng),
        endereco: 'Localização salva anteriormente',
      })
    }
  }, [user])

  function campo(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function aplicarLocalizacao({ lat, lng, endereco, bairroSugerido }) {
    setLocalizacao({ lat, lng, endereco })
    if (bairroSugerido) {
      const slugAlvo = normalizarParaSlug(bairroSugerido)
      const match = bairros.find((b) => b.slug === slugAlvo)
      if (match) campo('bairro_id', match.id)
    }
  }

  function handleLocalizadoPorCEP({ lat, lng, bairro: bairroCEP, displayName }) {
    aplicarLocalizacao({ lat, lng, endereco: displayName, bairroSugerido: bairroCEP })
  }

  function handleUsarGPS() {
    setAvisoGPS(null)
    if (!('geolocation' in navigator)) {
      setAvisoGPS('Seu navegador não suporta geolocalização.')
      return
    }
    setObtendoGPS(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const { displayName, bairro: bairroReverso } = await reverseGeocode(lat, lng)
          aplicarLocalizacao({ lat, lng, endereco: displayName, bairroSugerido: bairroReverso })
        } catch {
          aplicarLocalizacao({ lat, lng, endereco: 'Localização capturada pelo GPS' })
        } finally {
          setObtendoGPS(false)
        }
      },
      (err) => {
        setObtendoGPS(false)
        if (err.code === err.PERMISSION_DENIED) {
          setAvisoGPS('Permissão de localização negada.')
        } else {
          setAvisoGPS('Não foi possível obter sua localização agora.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSucesso(false)
    setSalvando(true)

    const payload = {
      nome:      form.nome,
      telefone:  form.telefone,
      bairro_id: form.bairro_id || null,
    }
    if (localizacao) {
      payload.lat = Number(localizacao.lat.toFixed(6))
      payload.lng = Number(localizacao.lng.toFixed(6))
    }

    try {
      const atualizado = await usuarios.mePatch(payload)
      updateUser(atualizado)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setErro(Object.values(data).flat().join(' ') || 'Erro ao salvar.')
      } else {
        setErro('Erro ao salvar.')
      }
    } finally {
      setSalvando(false)
    }
  }

  const destino = user?.role === 'defesa_civil' || user?.role === 'admin' ? '/dashboard' : '/'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to={destino} className="text-xl font-bold text-blue-600 tracking-tight">
            SIMA
          </Link>
          <Link to={destino} className="text-sm text-slate-500 hover:text-slate-800 transition">
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Editar perfil</h1>
        <p className="text-sm text-slate-500 mb-6">
          Manter seu telefone e bairro atualizados garante que você receba alertas do SIMA.
        </p>

        <form onSubmit={salvar} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => campo('nome', e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado aqui.</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone <span className="text-slate-400 font-normal">(para alertas WhatsApp)</span>
            </label>
            <TelefoneInput
              id="telefone"
              value={form.telefone}
              onChange={(raw) => campo('telefone', raw)}
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bairro principal
            </label>
            <select
              value={form.bairro_id}
              onChange={(e) => campo('bairro_id', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione seu bairro</option>
              {bairros.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          {/* Localização — abas GPS / CEP igual ao Reportar */}
          <fieldset>
            <legend className="block text-sm font-medium text-slate-700 mb-2">
              Localização{' '}
              <span className="text-slate-400 font-normal">(para alertas por proximidade)</span>
            </legend>

            <div className="inline-flex p-1 bg-slate-100 rounded-lg mb-3" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={modoLocalizacao === 'gps'}
                onClick={() => setModoLocalizacao('gps')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  modoLocalizacao === 'gps'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📍 GPS
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modoLocalizacao === 'cep'}
                onClick={() => setModoLocalizacao('cep')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  modoLocalizacao === 'cep'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏠 CEP
              </button>
            </div>

            {modoLocalizacao === 'gps' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleUsarGPS}
                  disabled={obtendoGPS}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  {obtendoGPS ? 'Obtendo localização...' : '📍 Usar minha localização'}
                </button>

                {avisoGPS && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {avisoGPS}{' '}
                    <button
                      type="button"
                      onClick={() => setModoLocalizacao('cep')}
                      className="underline font-medium"
                    >
                      Buscar por CEP
                    </button>
                  </p>
                )}
              </div>
            )}

            {modoLocalizacao === 'cep' && (
              <BuscaCEP onLocalizado={handleLocalizadoPorCEP} />
            )}

            {localizacao && (
              <div className="mt-3 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <span className="text-emerald-700 font-semibold">✓</span>
                <div className="flex-1">
                  <div className="text-emerald-900 font-medium">Localização encontrada</div>
                  <div className="text-emerald-800">{localizacao.endereco}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalizacao(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline shrink-0"
                >
                  Trocar
                </button>
              </div>
            )}
          </fieldset>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-3 py-2">
              Perfil atualizado com sucesso!
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(destino)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
