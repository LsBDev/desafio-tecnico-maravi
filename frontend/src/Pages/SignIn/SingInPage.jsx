import axios from "axios"
import AuthContext from "../../contexts/AuthContext.js"
import UserContext from "../../contexts/UserContext.js"
import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { colors } from "../../styles/Variables.js"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const {setToken} = useContext(AuthContext)
  const {user, setUser} = useContext(UserContext);

  function login(event) {
      event.preventDefault()
      // desabilitar e apaga os campos quando vier a resposta.
      // const user = {
      //   email, password
      // }
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
        // setToken("token:", res.data.access_token)
        setToken(res.data.access_token)
        setUser(res.data.user.username)
        console.log(`O User é: ${user}`)
        localStorage.setItem("token", res.data.access_token)
        localStorage.setItem("user", res.data.user.username)
        console.log(res.data)
        navigate("/home")
      })
      .catch((err) => {
          console.log(err.response.data)
      })
  }

  return (
      <Container>
      <Card>
          <h1>Login</h1>
          <Form onSubmit={login}>
              <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
              <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
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
  font-family: 'Roboto', sans-serif;
  background: ${colors.white};
  background-color: ${colors.background}; // Fundo branco (255, 255, 255) com 80% de opacidade
`;
const Card = styled.div`
  background: ${colors.white};
  padding: 40px;
  box-shadow: ${colors.box_shadow};
  width: 100%;
  max-width: 380px;
  text-align: center;
`;
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
    box-shadow: 0 0 5px rgba(40, 116, 252, 0.5);
  }
`
const Button = styled.button`
    background: ${colors.primary};
    color: white;
    font-weight: 600;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        background: #1a5cd8;
    }
`
const Cadastro = styled(Link)`
    font-style: italic;
    text-decoration: none;
    padding: 20px 20px;
    display: inline-block;
`
