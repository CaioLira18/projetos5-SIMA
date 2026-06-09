import { api } from './api'

export const ROLES = [
  { value: 'cidadao',     label: 'Cidadão' },
  { value: 'defesa_civil', label: 'Defesa Civil' },
  { value: 'admin',       label: 'Administrador' },
]

export const usuarios = {
  listar:  (params = {}) => api.get('/api/users/', { params }).then((r) => r.data.results ?? r.data),
  editar:  (id, dados)   => api.patch(`/api/users/${id}/`, dados).then((r) => r.data),
  excluir: (id)          => api.delete(`/api/users/${id}/`),
  mePatch: (dados)       => api.patch('/api/users/me/', dados).then((r) => r.data),
}
