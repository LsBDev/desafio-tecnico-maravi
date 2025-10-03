import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import styled from "styled-components"



export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

        function signup(event) {
        event.preventDefault()
        // desabilitar campos, enquanto aguarda a resposta?
        const user = {
            name: name, email: email, password: password
        }
        axios.post(`${process.env.REACT_APP_API_URL}/users`, user)
        .then((res) => {
            console.log(res.data)
            navigate("/")
        })
        .catch((err) => {
            console.log(err.response.data)
        })
    }


   return (
    <Container>
        <Card>
            <h1>Cadastro</h1>
            <Form onSubmit={signup}>
                <Input placeholder="Nome" type="name" value={name} onChange={e => setName(e.target.value)} required/>
                <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
                <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
                <Button type="submit">Entrar</Button>
            </Form>
            {/* <Link to="/signup">cadastro</Link> */}
            <Cadastro to="/">Já possui cadastro? Faça login!</Cadastro>
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