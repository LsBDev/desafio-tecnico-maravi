import  { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { useContext } from 'react';
import axios from 'axios';
import user_icon from "../assets/localization.png"
import bus_icon from "../assets/busIcon.png"
import L from 'leaflet';
import BusContext from '../contexts/BusContext.js';

const busIcon = new L.Icon({
  iconUrl: bus_icon,
  iconSize: [65, 40], // tamanho do ícone [h, w]
  iconAnchor: [17, 35], // ponto de ancoragem (centro inferior)
  popupAnchor: [0, -30], // posição do popup
});

const userIcon = new L.Icon({
  iconUrl: user_icon,
  iconSize: [60, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});


export default function LeafletMap({ linha_onibus, posicao_onibus, posicao_usuario }) {
  const {busPosition, setBusPosition} = useContext(BusContext);

    function getPositions() {
      axios.get(`${process.env.REACT_APP_API_URL}/buses/position`, {
        params: {
          linha: linha_onibus,
          user_lat: posicao_usuario[0], 
          user_long: posicao_usuario[1]
        }
    })
      .then((res) => {
        const cleanData = res.data
          .map((bus) => ({
            ...bus,
            latitude: parseFloat(bus.latitude.replace(",", ".")),
            longitude: parseFloat(bus.longitude.replace(",", ".")),
          }))
        setBusPosition(cleanData);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados: ", {err})
      })
    }
    useEffect(() => {
      if (!linha_onibus || posicao_usuario.length !== 2) return;
      getPositions();
      const interval = setInterval(getPositions, 60000);
      return () => clearInterval(interval);
    }, [linha_onibus, posicao_usuario]);

  return (
    <ContainerMap center={posicao_usuario} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {busPosition.map((bus) => {
        return (
          <Marker key={bus.ordem} position={[bus.latitude, bus.longitude]} icon={busIcon}>
            {/* Adiciona um popup com informações do ônibus */}
            <Popup>
              Linha: {bus.linha} <br />
              Ordem: {bus.ordem} <br />
              Velocidade: {bus.velocidade} km/h
            </Popup>
          </Marker>
        );
      })}
      <Marker position={posicao_usuario} icon={userIcon}>
        <Popup>
          Você está aqui!
        </Popup>
      </Marker>
    </ContainerMap>
  );
}

const ContainerMap = styled(MapContainer)`
  height: 500px;
`