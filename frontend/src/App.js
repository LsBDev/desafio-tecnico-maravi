import styled from "styled-components"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthRoute from "./components/AuthRoute.jsx"
import Home from "./Pages/Home.jsx"
import SignInPage from "./Pages/SignIn/SingInPage.jsx"
import SignUpPage from "./Pages/SignUp/SignUpPage.jsx"
import AuthContext from "./contexts/AuthContext.js"
import UserContext from "./contexts/UserContext.js"
import { useState } from "react"
import 'leaflet/dist/leaflet.css';
import { colors } from "./styles/Variables.js"
// import Logo from "../src/assets/Logo em svg.svg"
import Logo from "../src/assets/Logo.png"

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [user, setUser] = useState(localStorage.getItem("user"))

  return (
    <AuthContext.Provider value={{token, setToken}}> 
      <UserContext.Provider value={{user, setUser}}>
        <div>
          <BrowserRouter>
            <HearderContainer>
              <TopRow>
                <LeftSection>
                  <Img src={Logo} alt="Logo Avisa Aí"/>
                </LeftSection>
                <RightSection>
                  {user ? <Title>Olá, {user}!</Title> : ""}
                </RightSection>
              </TopRow>
              <BottomRow>
                <nav>Menu de Navegação Aqui</nav>
              </BottomRow>
              {/* <LeftSection>
                <Img src={Logo}/>
              </LeftSection>
              <RightSection>
                {user? <Title>Olá, {user}!</Title>: "" } 
              </RightSection>
              {/* <Title> */}
                {/* <p>Menu</p>    */}
                {/* </Title> */ }
            </HearderContainer>
            <Routes>
              <Route path="/" element={<SignInPage/>}/>
              <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/home" element={
                  <AuthRoute>
                    <Home/>
                  </AuthRoute>
                  }/>
            </Routes>
          </BrowserRouter>    
        </div>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}

// const HearderContainer = styled.header`
// display: flex;
//   background: ${colors.blue_header};
//   justify-content: space-between;
//   align-items: center;
//   box-shadow: ${colors.box_shadow};
//   position: sticky;
//   top: 0;
//   z-index: 1000;
//   padding: 0px 50px;
// `
const HearderContainer = styled.header`
  display: flex;
  flex-direction: column; /* Organiza os filhos (TopRow e BottomRow) verticalmente */
  background: ${colors.blue_header};
  box-shadow: ${colors.box_shadow};
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 20px 30px;
`;

// Container que agrupa Logo (Esquerda) e Usuário (Direita)
const TopRow = styled.div`
  display: flex;
  justify-content: space-between; /* Empurra Logo e Usuário para os cantos */
  align-items: center;
  width: 100%;
  margin-bottom: 10px; /* Espaço entre a linha de cima e o menu */
  gap: 30px;
`;

// Seção Esquerda (Logo)
const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

// Seção Direita (Nome do Usuário)
const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

// Linha de baixo (Menu)
const BottomRow = styled.div`
  display: flex;
  justify-content: center; /* Centraliza o menu horizontalmente */
  width: 100%;
  font-size: 1.1rem;
  color: ${colors.white};
`;
const Title = styled.h1`
  padding: 0;
  margin: 0;
  color: ${colors.white};
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Roboto Serif', sans-serif;
`
const Img = styled.img`
  max-width: 150px;
`


