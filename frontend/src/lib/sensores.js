import { api } from './api'

export const sensores = {
  listar:  (params = {}) => api.get('/api/sensores/', { params }).then((r) => r.data.results ?? r.data),
  criar:   (dados)       => api.post('/api/sensores/', dados).then((r) => r.data),
  editar:  (id, dados)   => api.patch(`/api/sensores/${id}/`, dados).then((r) => r.data),
  excluir: (id)          => api.delete(`/api/sensores/${id}/`),
}

export const TIPOS_SENSOR = [
  { value: 'pluviometro',  label: 'Pluviômetro',   icone: '🌧️' },
  { value: 'regua_nivel',  label: 'Régua de Nível', icone: '📏' },
  { value: 'camera',       label: 'Câmera',          icone: '📷' },
  { value: 'iot_generico', label: 'IoT Genérico',   icone: '📡' },
]

export function iconeSensor(tipo) {
  return TIPOS_SENSOR.find((t) => t.value === tipo)?.icone ?? '📡'
}
