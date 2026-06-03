import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PERFIL_CIDADAO = 'cidadao'
const PERFIL_DEFESA = 'defesa_civil'

const ROLES_OPERADOR = ['defesa_civil', 'admin']

export function Login() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destinoSolicitado = location.state?.from?.pathname || null

  // Se o usuário foi interceptado vindo de /dashboard, já chega na aba certa.
  const perfilInicial =
    destinoSolicitado === '/dashboard' ? PERFIL_DEFESA : PERFIL_CIDADAO

  const [perfil, setPerfil] = useState(perfilInicial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState(null)
  const [submetendo, setSubmetendo] = useState(false)

  const ehOperador = perfil === PERFIL_DEFESA

  const trocarPerfil = (novo) => {
    if (novo === perfil) return
    setPerfil(novo)
    setErro(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setSubmetendo(true)
    try {
      const usuario = await login(email, password)

      if (ehOperador && !ROLES_OPERADOR.includes(usuario.role)) {
        // Login deu certo mas a conta não tem o role pedido — limpa tokens
        // pra não deixar uma sessão pendurada e exibe erro contextual.
        await logout()
        setErro(
          'Esta conta não tem acesso ao Painel da Defesa Civil. Entre como Cidadão ou peça acesso ao administrador.'
        )
        return
      }

      const destino =
        destinoSolicitado || (ehOperador ? '/dashboard' : '/')
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(
        err.response?.status === 401
          ? 'Email ou senha incorretos.'
          : 'Não foi possível entrar agora. Tente novamente.'
      )
    } finally {
      setSubmetendo(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">SIMA</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistema Inteligente de Monitoramento e Alerta
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Tipo de acesso"
          className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!ehOperador}
            onClick={() => trocarPerfil(PERFIL_CIDADAO)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              !ehOperador
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Cidadão
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={ehOperador}
            onClick={() => trocarPerfil(PERFIL_DEFESA)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              ehOperador
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Defesa Civil
          </button>
        </div>

        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          {ehOperador ? 'Entrar como operador' : 'Entrar como cidadão'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {ehOperador
            ? 'Acesso ao painel de monitoramento da Defesa Civil.'
            : 'Acesso ao mapa de alagamentos de Recife.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {erro && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={submetendo}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submetendo ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {ehOperador ? (
          <p className="mt-6 text-xs text-center text-slate-500 px-2">
            Operadores da Defesa Civil são cadastrados pelo administrador do
            sistema. Se você ainda não tem acesso, fale com a equipe de gestão.
          </p>
        ) : (
          <p className="mt-6 text-sm text-center text-slate-600">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
