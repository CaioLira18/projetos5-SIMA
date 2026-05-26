/**
 * Hook que carrega o GeoJSON dos bairros do Recife.
 *
 * O arquivo (~2 MB) é servido estaticamente por Vite a partir de
 * /public/geo/bairros_recife.geojson — origem: dados abertos da Prefeitura
 * (dados.recife.pe.gov.br), mirror em github.com/zps-commits/Heat-Carbon.
 *
 * Cacheado em memória num módulo singleton: o fetch só acontece uma vez
 * por sessão, mesmo que o hook seja usado em múltiplos componentes.
 */

import { useEffect, useState } from 'react'

const URL_GEOJSON = '/geo/bairros_recife.geojson'

let cache = null
let promessaEmAndamento = null

function carregar() {
  if (cache) return Promise.resolve(cache)
  if (promessaEmAndamento) return promessaEmAndamento
  promessaEmAndamento = fetch(URL_GEOJSON)
    .then((res) => {
      if (!res.ok) throw new Error(`Falha ao carregar GeoJSON (${res.status})`)
      return res.json()
    })
    .then((data) => {
      cache = data
      promessaEmAndamento = null
      return data
    })
    .catch((err) => {
      promessaEmAndamento = null
      throw err
    })
  return promessaEmAndamento
}

export function useBairrosGeoJSON() {
  const [geojson, setGeojson] = useState(cache)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (cache) return
    let cancelado = false
    carregar()
      .then((data) => {
        if (!cancelado) setGeojson(data)
      })
      .catch((err) => {
        if (!cancelado) setErro(err)
      })
    return () => {
      cancelado = true
    }
  }, [])

  return { geojson, erro, carregado: geojson !== null }
}
