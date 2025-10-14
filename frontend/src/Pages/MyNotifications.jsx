import { useEffect, useState, useContext } from "react"
import styled from "styled-components"
import axios from "axios"
import { colors, font } from "../styles/Variables.js"
import { toast } from 'react-toastify'
import AuthContext from "../contexts/AuthContext.js"
import useQuickOut from "../hooks/useQuickout.jsx"

export default function MyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useQuickOut();

  // Função para buscar as notificações do usuário
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("token")
        localStorage.removeItem('user')
        localStorage.removeItem("last_agendamento_linha")
        localStorage.removeItem("last_agendamento_user_position")
        localStorage.removeItem("last_agendamento_bus_position")
        localStorage.removeItem("last_agendamento_dados_notificacao")
        toast.warn("Sua sessão expirou. Faça login novamente.")
        window.location.reload() // Recarrega a página para limpar o estado
        return // Sai da função para não continuar o fluxo
      }
      console.error("Erro ao buscar notificações:", err.response)
      toast.error("Não foi possível carregar seus avisos.")

    } finally {
      setLoading(false)
    }
  };
 
  useEffect(() => {
    fetchNotifications()
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este aviso?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Aviso deletado com sucesso!")
        fetchNotifications(); // Recarrega a lista
      } catch (err) {
        console.error("Erro ao deletar aviso:", err.response)
        toast.error("Erro ao deletar o aviso. Tente novamente.")
      }
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    // A.is_active é true (1) e B.is_active é false (0) -> 1 - 0 = 1 (A vai depois de B)
    // Para que A (Ativo/true) vá PRIMEIRO, precisamos que o retorno seja -1.
    // Invertemos a ordem de A e B na subtração.

    // b.is_active - a.is_active:
    // Se b for ativo (1) e a for inativo (0) -> 1 - 0 = 1 (b vem antes de a)
    // Se a for ativo (1) e b for inativo (0) -> 0 - 1 = -1 (a vem antes de b)

    return b.is_active - a.is_active;
  });

  // Função para mudar o status de 'is_active'
  // const handleToggleActive = async (id, currentStatus) => {
  //   const newStatus = !currentStatus;
  //   try {
  //     await axios.patch(
  //       `${API_URL}/notifications/${id}`,
  //       { is_active: newStatus },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     toast.success("Status do aviso atualizado!");
  //     fetchNotifications(); // Recarrega a lista
  //   } catch (err) {
  //     console.error("Erro ao atualizar status:", err.response);
  //     toast.error("Erro ao atualizar o status. Tente novamente.");
  //   }
  // };

  if (loading) {
    return <Container><p>Carregando avisos...</p></Container>;
  }

  return (
    <Container>
      <MainContent>
        <Title>Histórico de Avisos</Title>
        <NotificationGrid>
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((n) => (

              <NotificationCard key={n.id} isactive={n.is_active}>
                <Info>
                  <strong>Linha:</strong> {n.line_code}
                </Info>
                <Info>
                  <strong>Data:</strong> {n.notification_date}
                </Info>
                <Info>
                  <strong>Horário:</strong> {n.start_time} - {n.end_time}
                </Info>
                <Info>
                  <strong>Notificação: </strong>
                  <StatusTag status={n.status}>{n.status == "active" ? "Agendado" : n.status == "completed" ? "Notificado" : "Expirado"}</StatusTag>
                </Info>
                <Info>
                  <strong>Disponibilidade: </strong>
                  <StatusTag status={n.is_active ? 'on' : 'off'}>{n.is_active ? "Ativa" : "Inativa"}</StatusTag>
                </Info>
                <ButtonContainer>
                  {/* <Button onClick={() => handleToggleActive(n.id, n.is_active)}>
                    {n.is_active ? "Desativar" : "Ativar"}
                  </Button> */}
                  <Button onClick={() => handleDelete(n.id)} className="delete">
                    Deletar
                  </Button>
                </ButtonContainer>
              </NotificationCard>
            ))
          ) : (
            <p>Você ainda não tem nenhum aviso agendado.</p>
          )}
        </NotificationGrid>
      </MainContent>
    </Container>
  );
}

const Container = styled.div`
  min-height: calc(100vh - 100px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: ${font.font_family};
  background: ${colors.background};
  padding: 50px;
`
const MainContent = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`
const Title = styled.h1`
  font-size: 2rem;
  color: ${colors.black};
  font-weight: bold;
`
const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
`
const NotificationCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 0 10px 10px 0;
  box-shadow: ${colors.box_shadow};
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-left: 5px solid ${(props) => (props.isactive ? colors.primary : colors.darkOrange)};
`
const Info = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weiht: bolder;
  color: ${colors.black};
`
const StatusTag = styled.span`
display: inline-block;
padding: 2px 4px;
border-radius: 5px;
font-weight: bold;
// color: ${colors.black};
background-color: ${colors.gray}

`
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10px;
`
const Button = styled.button`
  background: ${colors.primary_hover};
  color: ${colors.white};
  font-weight: 600;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${colors.primary};
  }
  &.delete {
    background: ${colors.darkRed};
    &:hover {
      background: ${colors.darkRed};
    }
  }
`