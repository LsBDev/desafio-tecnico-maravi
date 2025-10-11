import axios from "axios"
import AuthContext from "../../contexts/AuthContext.js"
import UserContext from "../../contexts/UserContext.js"
import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { colors } from "../../styles/Variables.js"
import useQuickIn from "../../hooks/useQuickIn.jsx"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate()
  const {setToken} = useContext(AuthContext)
  const {setUser} = useContext(UserContext);

  useQuickIn()

  function login(event) {
    event.preventDefault()
    setDisabled(true);
    const formData = new URLSearchParams();
    formData.append('username', email); // A chave é 'username'
    formData.append('password', password);

    axios.post(`${process.env.REACT_APP_API_URL}/auth/token`, formData, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    .then((res) => {
      setToken(res.data.access_token)
      setUser(res.data.user.username)
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user", res.data.user.username)
      setDisabled(false);
      navigate("/home")
    })
    .catch((err) => {
      console.error(err.response.data)
      setDisabled(false);
    })
  }

  return (
    <Container>
    <Card>
      <TitleCard>Login</TitleCard>
      <Form onSubmit={login}>
          <Input placeholder="E-mail" type="email" value={email} disabled={disabled} onChange={e => setEmail(e.target.value)} required/>
          <Input placeholder="Senha" type="password" value={password} disabled={disabled} onChange={e => setPassword(e.target.value)} required/>
          <Button type="submit">Entrar</Button>
      </Form>
      <Cadastro to="/signup">Cadastre-se!</Cadastro>
    </Card>
    </Container>

  )
}
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.white};
  background-color: ${colors.background}; 
`

const TitleCard = styled.h1`
  font-size: 2rem;
  padding: 10px ;
  color: ${colors.black}  
`

const Card = styled.div`
  background: ${colors.white};
  padding: 40px;
  box-shadow: ${colors.box_shadow};
  width: 100%;
  max-width: 380px;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px
`
const Input = styled.input`
  padding: 12px 15px;
  border: ${colors.input_border};
  border-radius: 10px;
  font-size: 1rem;
  transition: 0.3s;
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
const Cadastro = styled(Link)`
  font-size: 1rem;
  font-style: italic;
  text-decoration: none;
  padding: 20px 20px;
  display: inline-block;
  color: ${colors.primary_hover};
`
