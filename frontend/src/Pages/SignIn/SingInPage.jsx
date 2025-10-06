import axios from "axios"
import AuthContext from "../../contexts/AuthContext.js"
import UserContext from "../../contexts/UserContext.js"
import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const {setToken} = useContext(AuthContext)
  const {setUser} = useContext(UserContext);

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
        setToken("token:", res.data.access_token)
        setUser("user", res.data.user.username)
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
  background: #ffffffff;
`;
const Card = styled.div`
  background: #fff;
  padding: 40px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 1rem;
    transition: 0.3s;
     &:focus {
    border-color: #2874fc;
    outline: none;
    box-shadow: 0 0 5px rgba(40, 116, 252, 0.5);
  }
`
const Button = styled.button`
    background: #2874fc;
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
