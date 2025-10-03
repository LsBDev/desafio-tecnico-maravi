
import styled from "styled-components"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from "./Pages/Home.jsx";
import SignInPage from "./Pages/SignIn/SingInPage.jsx";
import SignUpPage from "./Pages/SignUp/SignUpPage.jsx";

export default function App() {

  return (
    <>
    <HearderContainer>
      <Title>
        Busão RJ
      </Title>
    </HearderContainer>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignInPage/>}/>
          <Route path="/signup" element={<SignUpPage/>}/>
          <Route path="/home" element={<Home/>}/>
        </Routes>
      </BrowserRouter>    
    </>
  );
}

const HearderContainer = styled.header`
  background: linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(40, 116, 252) 100%);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  margin-bottom: 10px;
`
const Title = styled.h1`
    color: white;
    font-size: 2.5rem;
    font-weight: 500;
    font-family: 'Roboto Serif', sans-serif;
`

