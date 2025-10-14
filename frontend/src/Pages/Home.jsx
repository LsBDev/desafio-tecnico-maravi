import { useEffect, useState, useContext } from "react"
import styled from "styled-components"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import LeafletMap from "../components/LeafletMap"
import UserContext from "../contexts/UserContext.js"
import AuthContext from "../contexts/AuthContext.js"
import BusContext from "../contexts/BusContext.js"
import { colors, font } from "../styles/Variables.js"
import useQuickOut from "../hooks/useQuickout.jsx"
import BusList from "../components/BusList.jsx"
import { toast } from 'react-toastify';


export default function Home() {
  const [linha, setLinha] = useState("")
  const [ponto, setPonto] = useState("")
  const [dataNotificacao, setDataNotificacao] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFim, setHoraFim] = useState("")
  const [dadosNotificacao, setDadosNotificacao] = useState(null)
  const {user} = useContext(UserContext);
  const {token} = useContext(AuthContext)
  const {busPosition} = useContext(BusContext);
  const [userPosition, setUserPosition] = useState([])
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate()
  const [linhasMunicipais, setLinhasMunicipais] = useState([]); // Armazena a lista de linhas
  const [linhaSelecionada, setLinhaSelecionada] = useState(""); // Armazena a linha selecionada
  const [trajeto, setTrajeto] = useState(""); // Armazena o trajeto da linha
  //==============================
  //Manter informação no local storage
  // NOVO: useEffect para carregar o estado do localStorage
  useEffect(() => {
    const savedLine = localStorage.getItem('last_agendamento_linha');
    const savedUserPosition = localStorage.getItem('last_agendamento_user_position');
    const savedDadosNotificacao = localStorage.getItem('last_agendamento_dados_notificacao');

    if (savedLine && savedUserPosition && savedDadosNotificacao) {
      setLinha(savedLine);
      setUserPosition(JSON.parse(savedUserPosition));
      setDadosNotificacao(JSON.parse(savedDadosNotificacao));
      // toast.info("Carregando o último aviso agendado.");
    }
  }, []); // Roda apenas uma vez na montagem do componente
  //==================================

   useEffect(() => {
     axios.get(`${process.env.REACT_APP_API_URL}/buses/municipal_lines`)
      .then(res => {
        const linhasOrdenadas = res.data.sort((a, b) => {
        return a.numero.localeCompare(b.numero, undefined, { numeric: true, sensitivity: 'base' });
      });
        // console.log(res.data)
        setLinhasMunicipais(linhasOrdenadas);
      })
      .catch(err => {
        console.error("Erro ao carregar linhas municipais:", err);
        toast.error("Não foi possível carregar a lista de linhas municipais.");
      });
  }, []); // O array de dependências vazio garante que o useEffect rode apenas uma vez

  // Lógica para filtrar e exibir a rota da linha
  useEffect(() => {
    if (linhaSelecionada) {
      const linhaFiltrada = linhasMunicipais.find(item => item.numero === linhaSelecionada);
      if (linhaFiltrada) {
        setTrajeto(linhaFiltrada.nome);
        setLinha(linhaFiltrada.numero); // Garante que a variável 'linha' seja atualizada
      }
    } else {
      setTrajeto("");
    }
  }, [linhaSelecionada, linhasMunicipais]); // Atualiza o trajeto quando a linha selecionada muda
//================================

  useQuickOut()

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
    setDisabled(true)
    //===================================
    if (horaInicio && horaFim) {
        const [hI, mI] = horaInicio.split(":").map(Number)
        const [hF, mF] = horaFim.split(":").map(Number)
        
        // --- INÍCIO DA NOVA LÓGICA DE VALIDAÇÃO ---
        const inicioEmMinutos = hI * 60 + mI;
        let fimEmMinutos = hF * 60 + mF;

        // Se a hora de fim for anterior à de início, assume que é no dia seguinte
        if (fimEmMinutos < inicioEmMinutos) {
            fimEmMinutos += 24 * 60; // Adiciona 24 horas em minutos
        }

        const diferencaEmMinutos = fimEmMinutos - inicioEmMinutos;

        // Agora a validação é simples: a diferença deve ser menor ou igual a 60 minutos
        if (diferencaEmMinutos <= 0 || diferencaEmMinutos > 60) {
            toast.error("O intervalo de horário deve ser de no máximo 1 hora.");
            setDisabled(false); // Reativa o botão se a validação falhar
            return;
        }
    }

    if(!token || !user) {
      toast.warn("Sua sessão expirou. Faça login novamente")
      navigate("/")
    }
    // API de geocodificação Nominatim
    axios.get(process.env.REACT_APP_NOMINATIM_API_URL, {
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
        localStorage.setItem('last_agendamento_user_position', JSON.stringify([lat, lon])); 

        return axios.post(`${process.env.REACT_APP_API_URL}/buses/notification`, 
          { linha, latitude: lat, longitude: lon, data: dataNotificacao, hora_inicio: horaInicio, hora_fim: horaFim}, 
          { 
            headers: {
              Authorization: `Bearer ${token}`
            },
          }
        );
      } else {
        throw new Error("Ponto não encontrado.");
      }
    })
    .then(res => {
      setDadosNotificacao(res.data) 
      console.log("Dados da Notificação", res.data)     
      setDisabled(false)
      toast.success("Notificação cadastrada com sucesso!")
      localStorage.setItem('last_agendamento_linha', linha);
      localStorage.setItem('last_agendamento_dados_notificacao', JSON.stringify(res.data));
    })
    .catch(err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.warn("Sua sessão expirou. Faça login novamente.")
        localStorage.removeItem("token");
        localStorage.removeItem('user');
        window.location.reload();
        return; // sai da função pra não continuar o fluxo
      }
      console.error("Erro na busca de dados:", err.response);
      if (err.message === "Ponto não encontrado.") {
        toast.error("Não foi possível encontrar as coordenadas para o ponto informado. Tente um endereço mais preciso.");
      } else {
        toast.error("Ocorreu um erro ao buscar as informações. Por favor, tente novamente mais tarde.");
      }
      setDisabled(false)
    });
  }

  return (
    <Container>
      <MainContent>        
        <Form onSubmit={buscaDadosOnibus}>

          <FormLineContainer> 
            <SelectWrapper>
              <Label htmlFor="linha-select">Linha do ônibus</Label>
              <Select id="linha-select" disabled={disabled} onChange={(e) => {
                setLinhaSelecionada(e.target.value);
                setLinha(e.target.value);
              }} required={!linha}>
                <option value="">Linha</option>
                {linhasMunicipais.map(item => (
                  <option key={item.numero} value={item.numero}>{item.numero}</option>
                ))}
              </Select>
            </SelectWrapper>
            <LineOr> </LineOr> 
            <Input 
              placeholder="Digite a Linha" 
              type="text" 
              disabled={disabled || linhaSelecionada} // Desabilita se um select foi escolhido
              onChange={(e) => {
                setLinha(e.target.value);
                setLinhaSelecionada(""); // Limpa o select se o usuário digitar
              }} 
              required={!linhaSelecionada}
            />
          </FormLineContainer>

          <Input value={trajeto} placeholder="Trajeto da Linha" readOnly disabled={true} style={{ fontWeight: 'bold' }}/>
          <Input
            placeholder="Partida (Ex.: Av. Rio Branco, 400)"
            type="text" disabled={disabled}  onChange={(e) => setPonto(e.target.value)}
            required
          />
          <ContainerData>
            <Label htmlFor="data">Data do aviso</Label>
            <Input
              id="data"
              type="date" disabled={disabled}  min={dataInicio}  onChange={(e) => setDataNotificacao(e.target.value)} required/>
          </ContainerData>
          <ContainerInputTime className="div">
            <ContainerHora>
              <Label htmlFor="hora-inicio">Hora de início</Label>
              <Input
                id="hora-inicio" type="time" disabled={disabled} onChange={(e) => setHoraInicio(e.target.value)} required/>
            </ContainerHora>
            <ContainerHora>
              <Label htmlFor="hora-fim">Hora de fim</Label>
              <Input  id="hora-fim" type="time" disabled={disabled} onChange={(e) => setHoraFim(e.target.value)} required/>
            </ContainerHora>
          </ContainerInputTime>
          <Button type="submit">Agendar Aviso</Button>
        </Form>
        {dadosNotificacao ? (
          <ContainerMap>
            <LeafletMap linha_onibus={linha} posicao_onibus={busPosition} posicao_usuario={userPosition}/>
          </ContainerMap>
        ): <div></div>}
      </MainContent>
      {dadosNotificacao ? (
        <BusList buses={busPosition} linha_onibus={linha}/>
      ): <div></div>}     

    </Container>
  );
}

const Container = styled.div`
  min-height: calc(100vh - 100px); /* Garante que ocupe o espaço restante da tela */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: ${font.font_family};
  background: ${colors.white};
  background-color: ${colors.background}; 
  padding: 50px;
`
const MainContent = styled.div`
  width: 100%; 
  display: flex;
  flex-wrap: wrap; 
  justify-content: center;
  align-items: center;
  gap: 30px;
`
const Form = styled.form`
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  gap: 15px
`
const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`
const Select = styled.select`
  width: 100%;
  padding: 11px 13px;
  border: ${colors.input_border};
  border-radius: 10px;
  font-size: ${font.label};
  min-width: 150px;
  transition: 0.3s;
  &:focus {
    border-color: ${colors.primary};
    outline: none;
    box-shadow: ${colors.box_shadow};
  }
`
const FormLineContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 5px;
`
const LineOr = styled.span`
  font-size: 14px;
  color: ${colors.darkGray};
  margin-bottom: 12px;
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
  font-family: ${font.font_family};
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${colors.primary_hover};
  }
`
const ContainerMap = styled.div`
  flex: 1 1 600px; 
  /* display: flex; */
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${colors.box_shadow};
  /* background: #000; */
`
const NewButton = styled.button`
  width: 35%;
  background: ${colors.primary_hover};
  color: ${colors.white};
  font-weight: 600;
  padding: 9px;
  border: none;
  border-radius: 10px;
  font-size: .6rem;
  font-family: ${font.font_family};
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${colors.primary};
  }
`