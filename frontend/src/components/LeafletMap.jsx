import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { useState } from 'react';
import axios from 'axios';


export default function LeafletMap(linha_onibus, dados_notificacao, posicao_usuario) {
  const [busPosition, setBusPosition] = useState([])
  const position = [-22.9068, -43.1729]; // Exemplo: Rio de Janeiro

  useEffect(() => {
    const interval = setInterval(async () => {
      axios.get(`${process.env.REACT_APP_API_URL}/buses/position?linha=${linha_onibus}`)
      .then((res) => {
        console.log(`Dados dos onibus vindo do redis: ${res.data}`)
        console.log(posicao_usuario)
        // setBusPosition([lat, long])
      })
      .catch((err) => {
        console.log("Erro ao buscar dados:", {err})
      })

    }, 60000)
    return () => {
      // para "desligar" o setInterval anterior
      console.log('Intervalo limpo.');
      clearInterval(interval);
    }
  }, [])

  return (
    <ContainerMap center={position} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Você está em <br /> Rio de Janeiro.
        </Popup>
      </Marker>
    </ContainerMap>
  );
}

const ContainerMap = styled(MapContainer)`
  height: 500px;
  /* width: 400px; */
`