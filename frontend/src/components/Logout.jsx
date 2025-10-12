import React, { useContext } from 'react';
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.info("Você foi desconectado. Até a próxima!");
    navigate("/");
  };

  return (
    <ContainerLogout>
        <LougoutTitle>Sair</LougoutTitle>
        <StyledButton onClick={handleLogout} src={Logout}/>
    </ContainerLogout>
  );
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
    width: 18px;  
`