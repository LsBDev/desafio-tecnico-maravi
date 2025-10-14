import styled from "styled-components"
import { colors, font } from "../styles/Variables";
import { Link } from "react-router-dom"


export default function(){
  return (
    <Nav>
      <Ul>
        <Li to="/my-notifications">Meus Avisos</Li>
        <Li to="/my-locals">Meus Locais</Li>
      </Ul>
    </Nav>
  )
}

const Nav = styled.nav`
  color: ${colors.white}; 
  padding: 10px; 
`  
const Ul = styled.ul`
  list-style: none; 
  display: flex;
  justify-content: flex-end;
  gap: 20px;  
`
const Li = styled(Link)`
  color: ${colors.white}; 
  font-family: ${font.font_family};
  font-size: 16px;
  text-decoration: none; 
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s ease;  
  &:hover {
    color: ${colors.light_hover}; 
  }
`
