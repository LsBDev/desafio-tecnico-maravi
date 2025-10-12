import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import styled from "styled-components"
import { colors, font } from "../../styles/Variables.js"


export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate()

  function signup(event) {
    event.preventDefault()
    setDisabled(true);
    const user = {
        username: username, email: email, password: password
    }
    axios.post(`${process.env.REACT_APP_API_URL}/auth/sign-up`, user)
    .then((res) => {
        setDisabled(false);
        navigate("/")
    })
    .catch((err) => {
        console.error(err.response.data)
        setDisabled(false);
    })
  }

  return (
  <Container>
    <Card>
      <TitleCard>Cadastro</TitleCard>
      <Form onSubmit={signup}>
        <Input placeholder="Nome" type="name" value={username} disabled={disabled} onChange={e => setUsername(e.target.value)} required/>
        <Input placeholder="E-mail" type="email" value={email} disabled={disabled} onChange={e => setEmail(e.target.value)} required/>
        <Input placeholder="Senha" type="password" value={password} disabled={disabled} onChange={e => setPassword(e.target.value)} required/>
        <Button type="submit">Entrar</Button>
      </Form>
      <Login to="/">Já possui cadastro? Faça login!</Login>
    </Card>
  </Container>
  ) 
}
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  background: ${colors.background};
`

const Card = styled.div`
  background: ${colors.white};
  padding: 40px;
  box-shadow: ${colors.box_shadow};
  width: 100%;
  max-width: 380px;
  text-align: center;
`

const TitleCard = styled.h1`
  font-size: 2rem;
  padding: 10px;
  color: ${colors.primary_hover};
  font-family: ${font.font_family}
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
  font-size: ${font.label};
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
const Login = styled(Link)`
  font-size: 1rem;
  font-style: italic;
  text-decoration: none;
  padding: 20px 20px;
  display: inline-block;
  color: ${colors.primary_hover};
`