/**
 * Marcador de sensor IoT no mapa (US09).
 *
 * Visual distinto dos relatos: quadrado azul com ícone do tipo de sensor,
 * fundo cinza quando inativo. Popup mostra nome, tipo, bairro e status.
 */

import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

import { iconeSensor } from '../lib/sensores'

function criarIcone(tipo, ativo) {
  const bg     = ativo ? '#1d4ed8' : '#94a3b8'
  const icone  = iconeSensor(tipo)
  return L.divIcon({
    html: `<div style="
      width:30px;height:30px;
      background:${bg};
      border:2px solid #fff;
      border-radius:6px;
      display:flex;align-items:center;justify-content:center;
      font-size:15px;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      cursor:pointer;
    ">${icone}</div>`,
    iconSize:    [30, 30],
    iconAnchor:  [15, 15],
    popupAnchor: [0, -18],
    className:   '',
  })
}

export function MarcadorSensor({ sensor }) {
  const icone = criarIcone(sensor.tipo, sensor.ativo)

  return (
    <Marker
      position={[Number(sensor.lat), Number(sensor.lng)]}
      icon={icone}
    >
      <Popup>
        <div className="text-sm space-y-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="text-base">{iconeSensor(sensor.tipo)}</span>
            <strong className="text-slate-800">{sensor.nome}</strong>
          </div>
          <div className="text-slate-600">{sensor.tipo_display}</div>
          {sensor.bairro_nome && (
            <div className="text-slate-600">{sensor.bairro_nome}</div>
          )}
          <div
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
              sensor.ativo
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sensor.ativo ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            {sensor.ativo ? 'Ativo' : 'Inativo'}
          </div>
          {sensor.descricao && (
            <p className="text-slate-700 italic text-xs pt-1 border-t border-slate-100">
              {sensor.descricao}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
