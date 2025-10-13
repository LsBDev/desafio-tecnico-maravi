import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext.js';
import UserContext from '../contexts/UserContext.js';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import Logout from '../assets/Logout.png'
import { font } from '../styles/Variables.js';


export default function LogoutButton() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("last_agendamento_linha")
    localStorage.removeItem("last_agendamento_user_position")
    localStorage.removeItem("last_agendamento_bus_position")
    localStorage.removeItem("last_agendamento_dados_notificacao")
    setToken(null);
    setUser(null);
    toast.info("Você foi desconectado. Até a próxima!")
    navigate("/")
  };

  return (
    <ContainerLogout onClick={handleLogout}>
        <LougoutTitle>Sair</LougoutTitle>
        <StyledButton src={Logout}/>
    </ContainerLogout>
  )
}

const ContainerLogout = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px
`
const LougoutTitle = styled.p`
  font-size: 1rem;
  text-align: center;
  font-family: ${font.font_family}
`
const StyledButton = styled.img`
  width: 15px;  
`