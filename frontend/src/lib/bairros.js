/**
 * Bairros oficiais de Recife — carregados uma vez por sessão e cacheados.
 *
 * O endpoint /api/bairros/ devolve os 94 bairros sem paginação. Como a
 * lista é estática (muda só via admin), uma promise compartilhada evita
 * que cada componente abra sua própria requisição.
 */

import { useEffect, useState } from 'react'
import { api } from './api'

let cachePromise = null

export function carregarBairros() {
  if (!cachePromise) {
    cachePromise = api.get('/api/bairros/').then((r) => r.data)
  }
  return cachePromise
}

export function useBairros() {
  const [bairros, setBairros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let ativo = true
    carregarBairros()
      .then((data) => {
        if (ativo) {
          setBairros(data)
          setCarregando(false)
        }
      })
      .catch((err) => {
        if (ativo) {
          setErro(err)
          setCarregando(false)
        }
      })
    return () => {
      ativo = false
    }
  }, [])

  return { bairros, carregando, erro }
}

/**
 * Normaliza pra comparação com o slug do backend (mesmo algoritmo do
 * django.utils.text.slugify para os casos comuns: lowercase, sem
 * acentos, espaços/pontuação viram hífen).
 */
export function normalizarParaSlug(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
