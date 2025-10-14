import styled from "styled-components"
import {BrowserRouter, Routes, Route, Link} from "react-router-dom"
import Home from "./Pages/Home.jsx"
import SignInPage from "./Pages/SignIn/SingInPage.jsx"
import SignUpPage from "./Pages/SignUp/SignUpPage.jsx"
import AuthContext from "./contexts/AuthContext.js"
import UserContext from "./contexts/UserContext.js"
import { useState } from "react"
import 'leaflet/dist/leaflet.css'
import { colors, font } from "./styles/Variables.js"
import Logo from "../src/assets/Logo.png"
import BusContext from "./contexts/BusContext.js"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LogoutButton from "./components/Logout.jsx"
import NavBar from "./components/NavBar.jsx"
import MyNotifications from "./Pages/MyNotifications.jsx"
import MyLocals from "./Pages/MyLocals.jsx"

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(localStorage.getItem("user"))
  const [busPosition, setBusPosition] = useState([])

  return (
    <AuthContext.Provider value={{token, setToken}}> 
      <UserContext.Provider value={{user, setUser}}>
        <BusContext.Provider value={{busPosition, setBusPosition}}>
          <div>
            <BrowserRouter>
              <HearderContainer>
                <TopRow>
                  <LeftSection>
                    <Link to="/">
                      <Img src={Logo} alt="Logo Avisa Aí" />
                    </Link>                    
                  </LeftSection>
                  <RightSection>
                    {user ? <Title>Olá, {user}!</Title> : ""}
                    {user ? <LogoutButton/> : ""}
                  </RightSection>
                </TopRow>
                <BottomRow>
                  {user ? <NavBar/> : ""}                 
                </BottomRow>
              </HearderContainer>
              <Routes>
                <Route path="/" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/my-notifications" element={<MyNotifications/>}/>
                <Route path="/my-locals" element={<MyLocals />} />
              </Routes>
            </BrowserRouter>
            <ToastContainer />    
          </div>
        </BusContext.Provider>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}

const HearderContainer = styled.header`
  display: flex;
  flex-direction: column; /* Organiza os filhos (TopRow e BottomRow) verticalmente */
  background: ${colors.blue_header};
  box-shadow: ${colors.box_shadow};
  position: sticky;
  top: 0;
  z-index: 1000 !important;
  padding: 8px 30px;
`
const TopRow = styled.div`
  display: flex;
  justify-content: space-between; /* Empurra Logo e Usuário para os cantos */
  align-items: center;
  width: 100%;
  margin-bottom: 10px; /* Espaço entre a linha de cima e o menu */
  gap: 30px;
`
const LeftSection = styled.div`
  display: flex;
  align-items: center;
`
const RightSection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 13px;
`
const BottomRow = styled.div`
  display: flex;
  justify-content: center; /* Centraliza o menu horizontalmente */
  width: 100%;
  font-size: 1.1rem;
  color: ${colors.white};
`
const Title = styled.h1`
  padding: 0;
  margin: 0;
  color: ${colors.white};
  font-size: 1.2rem;
  font-weight: 500;
  font-family: ${font.font_family}
`
const Img = styled.img`
  max-width: 150px;
`