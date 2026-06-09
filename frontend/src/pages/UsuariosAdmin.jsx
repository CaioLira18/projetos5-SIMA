/**
 * Gerenciamento de usuários — exclusivo para admin (US09 area admin).
 *
 * Lista todos os usuários com filtro por bairro.
 * Permite editar nome, telefone, bairro e role; e excluir.
 */

import { useEffect, useState } from 'react'
import { useBairros } from '../lib/bairros'
import { TelefoneInput } from '../components/TelefoneInput'
import { ROLES, usuarios as usuariosService } from '../lib/usuarios'

const ROTULOS_ROLE = {
  cidadao:     'Cidadão',
  defesa_civil: 'Defesa Civil',
  admin:       'Admin',
}

const COR_ROLE = {
  cidadao:     'bg-slate-100 text-slate-700',
  defesa_civil: 'bg-blue-100 text-blue-800',
  admin:       'bg-purple-100 text-purple-800',
}

function ModalEditar({ usuario, bairros, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    nome:     usuario.nome || '',
    telefone: usuario.telefone || '',
    role:     usuario.role || 'cidadao',
    bairro_id: usuario.bairro?.id ?? '',
    is_active: usuario.is_active ?? true,
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function campo(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const payload = {
        nome:      form.nome,
        telefone:  form.telefone,
        role:      form.role,
        bairro_id: form.bairro_id || null,
        is_active: form.is_active,
      }
      const atualizado = await usuariosService.editar(usuario.id, payload)
      onSalvar(atualizado)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setErro(Object.values(data).flat().join(' '))
      } else {
        setErro('Erro ao salvar.')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Editar usuário</h2>

        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => campo('nome', e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <TelefoneInput
              id="telefone-admin"
              value={form.telefone}
              onChange={(raw) => campo('telefone', raw)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
            <select
              value={form.bairro_id}
              onChange={(e) => campo('bairro_id', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sem bairro</option>
              {bairros.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
            <select
              value={form.role}
              onChange={(e) => campo('role', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => campo('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Conta ativa</span>
          </label>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onFechar}
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
      </div>
    </div>
  )
}

export function UsuariosAdmin() {
  const { bairros } = useBairros()
  const [lista, setLista] = useState([])
  const [filtroBairro, setFiltroBairro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null)
  const [confirmandoId, setConfirmandoId] = useState(null)

  async function carregar(bairroSlug = '') {
    setCarregando(true)
    try {
      const params = bairroSlug ? { bairro: bairroSlug } : {}
      const dados = await usuariosService.listar(params)
      setLista(dados)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar(filtroBairro)
  }, [filtroBairro])

  function aoSalvar(atualizado) {
    setLista((prev) => prev.map((u) => (u.id === atualizado.id ? atualizado : u)))
    setEditando(null)
  }

  async function excluir(id) {
    await usuariosService.excluir(id)
    setLista((prev) => prev.filter((u) => u.id !== id))
    setConfirmandoId(null)
  }

  return (
    <div className="space-y-4">
      {editando && (
        <ModalEditar
          usuario={editando}
          bairros={bairros}
          onSalvar={aoSalvar}
          onFechar={() => setEditando(null)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Usuários
          {!carregando && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({lista.length} {lista.length === 1 ? 'usuário' : 'usuários'})
            </span>
          )}
        </h2>

        <select
          value={filtroBairro}
          onChange={(e) => setFiltroBairro(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
        >
          <option value="">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b.id} value={b.slug}>{b.nome}</option>
          ))}
        </select>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
          Carregando...
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden lg:table-cell">Telefone</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Bairro</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Perfil</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((u) => (
                <tr key={u.id} className={`hover:bg-slate-50 transition ${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{u.nome}</div>
                    {!u.is_active && (
                      <div className="text-xs text-slate-400">Inativo</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                    {u.telefone || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                    {u.bairro?.nome || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COR_ROLE[u.role] || 'bg-slate-100 text-slate-700'}`}>
                      {ROTULOS_ROLE[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmandoId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-slate-500">Confirmar exclusão?</span>
                        <button
                          onClick={() => excluir(u.id)}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmandoId(null)}
                          className="px-2 py-1 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditando(u)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmandoId(u.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
