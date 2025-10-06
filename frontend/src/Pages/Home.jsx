import { useEffect, useState } from "react"
import styled from "styled-components"
import axios from "axios"
import { useNavigate } from "react-router-dom"


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
  const [dadosOnibus, setDadosOnibus] = useState(null)
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
        console.log(lat, lon);
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
        setDadosOnibus(res.data);
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

  return (
      <>
        <Container>
          <Form onSubmit={buscaDadosOnibus}>
            <Input
              placeholder="Linha"
              type="text"
              onChange={(e) => setLinha(e.target.value)}
              required
            />
            <Input
              placeholder="Ponto de partida (Ex.: Av. Rio Branco, 400)"
              type="text"
              onChange={(e) => setPonto(e.target.value)}
              required
            />
            <ContainerData>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                min={dataInicio}
                onChange={(e) => setDataNotificacao(e.target.value)}
                required
              />
            </ContainerData>
            <ContainerInputTime className="div">
              <ContainderHora>
                <Label htmlFor="hora-inicio">Hora de início</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </ContainderHora>
              <ContainderHora>
                <Label htmlFor="hora-fim">Hora de fim</Label>
                <Input
                  id="hora-fim"
                  type="time"
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />
              </ContainderHora>
            </ContainerInputTime>
            <Button type="submit">Buscar Ônibus</Button>
          </Form>

          {/* Aqui você vai renderizar a tabela e o mapa */}
          {dadosOnibus && (
            <div>
              <h2>Resultados da Busca</h2>
              {/* Exibir a tabela com os dados de 'dadosOnibus' */}
              {/* Exibir o mapa com a posição dos ônibus */}
            </div>
          )}
        </Container>
      </>
  );
}

const Container = styled.div`
  /* min-height: 100vh; */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
  background: #ffffffff;
`;

const Form = styled.form`
  width: 250px;
  display: flex;
  flex-direction: column;
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
const ContainderHora = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
const Label = styled.label`
  font-size: 11px;
  color: #495057;
  /* margin-bottom: 5px; */
  /* font-weight: bold; */
  font-style: italic;
`

const Input = styled.input`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 1rem;
    transition: 0.3s;
     &:focus {
    border-color: #2874fc;
    outline: none;
    box-shadow: 0 0 5px rgba(40, 116, 252, 0.5);
  }
`
const Button = styled.button`
    background: #2874fc;
    color: white;
    font-weight: 600;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      background: #1a5cd8;
    }
`