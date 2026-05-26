/**
 * Service de relatos de alagamento (US04).
 *
 * Camada fina sobre o axios `api` — mantém as páginas livres de detalhes
 * de HTTP e centraliza qualquer normalização de payload/resposta.
 */

import { api } from './api'

export const relatos = {
  criar: (payload) => api.post('/api/relatos/', payload).then((r) => r.data),
  listar: (params) =>
    api.get('/api/relatos/', { params }).then((r) => r.data),
  detalhe: (id) => api.get(`/api/relatos/${id}/`).then((r) => r.data),
  /**
   * Lista TODOS os relatos correspondentes (atravessa páginas do DRF).
   *
   * O endpoint usa PageNumberPagination (PAGE_SIZE=20). Pro mapa precisamos
   * de todos os relatos da janela, então seguimos `next` até esgotar.
   * A primeira chamada usa `params`; as próximas vão direto na URL `next`
   * (que já carrega os mesmos filtros).
   */
  listarTodos: async (params) => {
    let resposta = await api.get('/api/relatos/', { params })
    let todos = resposta.data.results || resposta.data
    while (resposta.data.next) {
      resposta = await api.get(resposta.data.next)
      todos = todos.concat(resposta.data.results || resposta.data)
    }
    return todos
  },
}

export const NIVEIS = [
  {
    valor: 'baixo',
    rotulo: 'Baixo',
    descricao: 'Poças, água no meio-fio',
    cor: 'emerald',
  },
  {
    valor: 'medio',
    rotulo: 'Médio',
    descricao: 'Cobre a calçada / parte da rua',
    cor: 'amber',
  },
  {
    valor: 'alto',
    rotulo: 'Alto',
    descricao: 'Rua intransitável, água entrando em imóveis',
    cor: 'red',
  },
]
