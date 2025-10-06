
import styled from "styled-components"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthRoute from "./components/AuthRoute.jsx"
import Home from "./Pages/Home.jsx"
import SignInPage from "./Pages/SignIn/SingInPage.jsx"
import SignUpPage from "./Pages/SignUp/SignUpPage.jsx"
import AuthContext from "./contexts/AuthContext.js"
import UserContext from "./contexts/UserContext.js"
import { useState } from "react"

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [user, setUser] = useState(localStorage.getItem("user"))

  return (
    <AuthContext.Provider value={{token, setToken}}> 
      <UserContext.Provider value={{user, setUser}}>
        <BrowserRouter>
          <HearderContainer>
            <Title>
              Avisa ai!
            </Title>
            {user? <p>Olá, {user}!</p>: "" }              
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
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}

const HearderContainer = styled.header`
  background: linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(40, 116, 252) 100%);
  padding: 10px 20px;
  /* display: flex; */
  /* flex-direction: column; */
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  margin-bottom: 10px;
  padding: 20px 50px;
`
const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 500;
  font-family: 'Roboto Serif', sans-serif;
`
// const Logo = styled(Link)`
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;

// `


