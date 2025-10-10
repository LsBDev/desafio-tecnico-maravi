import { useEffect, useState, useContext } from "react"
import styled from "styled-components"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import LeafletMap from "../components/LeafletMap"
import UserContext from "../contexts/UserContext.js"
import { colors, font } from "../styles/Variables.js"


const API_URL = process.env.REACT_APP_API_URL

// API de geocodificação
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search"

export default function Home() {
  const [linha, setLinha] = useState("")
  const [ponto, setPonto] = useState("")
  const [dataNotificacao, setDataNotificacao] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFim, setHoraFim] = useState("")
  const [dadosNotificacao, setDadosNotificacao] = useState(null)
  const {user} = useContext(UserContext);
  const [userPosition, setUserPosition] = useState([])
  const navigate = useNavigate()

  // Problema com fuso, precisei trocar a lógica.
  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const formattedDate = `${ano}-${mes}-${dia}`;
    setDataInicio(formattedDate);
  }, []);

  function buscaDadosOnibus(event) {
    event.preventDefault()

    if (horaInicio && horaFim) {
      const [hI, mI] = horaInicio.split(":").map(Number)
      const [hF, mF] = horaFim.split(":").map(Number)

      const totalMinutosInicio = hI*60 + mI
      const totalMinutosFim = hF*60 + mF
      if ((totalMinutosFim - totalMinutosInicio) <= 0 || (totalMinutosFim - totalMinutosInicio) > 60) {
        alert("O intervalo de horário deve ser de no máximo 1 hora.")
        return
      }
    }

    const token = localStorage.getItem("token")
    if(!token) {
      alert("Sua sessão expirou. Faça login novamente")
      navigate("/")
    }
    // API de geocodificação Nominatim
    axios.get(NOMINATIM_API_URL, {
        params: {
          q: `${ponto}, Rio de Janeiro`,
          format: "json",
          limit: 1,
        },
    })
    .then(geoResponse => {
      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        setUserPosition([lat, lon])
        return axios.post(`${API_URL}/buses/notification`, 
          { 
            linha,
            latitude: lat,
            longitude: lon,
            data: dataNotificacao,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
          }, 
          { 
            headers: {
              Authorization: `Bearer ${token}`
            },
          }
        );
      } else {
        // Se não encontrar o ponto, lança um erro, volta uma camada, para ir para o catch mais próximo.
        // posso colocar um middleware de erro depois
        throw new Error("Ponto não encontrado.");
      }
    })
    .then(res => {
        console.log("Notificação agendada com sucesso!");
        setDadosNotificacao(res.data);
        // Receber os dados da notificação
        console.log("Dados dos ônibus recebidos:", res.data);
    })
    .catch(err => {
      console.error("Erro na busca de dados:", err.response);
      if (err.message === "Ponto não encontrado.") {
          alert("Não foi possível encontrar as coordenadas para o ponto informado. Tente um endereço mais preciso.");
      } else {
          alert("Ocorreu um erro ao buscar as informações. Por favor, tente novamente mais tarde.");
      }
    });
  }

// # Fazer um get em notificações, ver as noti ativas e posições o usuário,
//  e da linha e coloca-lás num select, pra poder mudar o mapa dinamico



  return (
      <Container>
        <MainContent>
          <Form onSubmit={buscaDadosOnibus}>
            <Input
              placeholder="Linha"
              type="text"
              onChange={(e) => setLinha(e.target.value)}
              required
            />
            <Input
              placeholder="Partida (Ex.: Av. Rio Branco, 400)"
              type="text"
              onChange={(e) => setPonto(e.target.value)}
              required
            />
            <ContainerData>
              <Label htmlFor="data">Data do aviso</Label>
              <Input
                id="data"
                type="date"
                min={dataInicio}
                onChange={(e) => setDataNotificacao(e.target.value)}
                required
              />
            </ContainerData>
            <ContainerInputTime className="div">
              <ContainerHora>
                <Label htmlFor="hora-inicio">Hora de início</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </ContainerHora>
              <ContainerHora>
                <Label htmlFor="hora-fim">Hora de fim</Label>
                <Input
                  id="hora-fim"
                  type="time"
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />
              </ContainerHora>
            </ContainerInputTime>
            <Button type="submit">Buscar Ônibus</Button>
          </Form>
          {user ? (
            <ContainerMap>
              <LeafletMap linha={linha} dadosNotificacao={dadosNotificacao} posicao_usuario={userPosition}/>
            </ContainerMap>
          ): <div></div>}
        </MainContent>
      </Container>
  );
}

const Container = styled.div`
  min-height: calc(100vh - 100px); /* Garante que ocupe o espaço restante da tela */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
  background: #ffffffff;
  background-color: ${colors.background}; 
  `;
const MainContent = styled.div`
  width: 100%; 
  display: flex;
  flex-wrap: wrap; 
  justify-content: center;
  align-items: center;
  gap: 30px;
  /* width: 90%; */
  padding: 0 50px;
  /* max-width: 1000px;  */
  /* background: #000; */
`;
const Form = styled.form`
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  gap: 15px
`
const ContainerData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const ContainerInputTime = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 5px;
`
const ContainerHora = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const Label = styled.label`
  font-size: 11px;
  color: ${colors.black};
  font-weight: bolder;
  font-style: italic;
  font-size: ${font.label};
  color: ${colors.label_black};
`
const Input = styled.input`
  padding: 12px 15px;
  border: ${colors.input_border};
  border-radius: 10px;
  font-size: ${font.label};
  transition: 0.3s;
  min-width: 150px;
    &:focus {
  border-color: ${colors.primary};
  outline: none;
  box-shadow: ${colors.box_shadow};
}
`
const Button = styled.button`
    background: ${colors.primary};
    color: ${colors.white};
    font-weight: 600;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      background: ${colors.primary_hover};
    }
`
const ContainerMap = styled.div`
  flex: 1 1 600px; 
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${colors.box_shadow};
`;