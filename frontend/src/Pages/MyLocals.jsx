import styled from "styled-components"
import { colors, font } from "../styles/Variables.js"
import useQuickOut from "../hooks/useQuickout.jsx"


export default function MyLocals() {

  useQuickOut();

  return (
    <Container>
      <MainContent>
        <Title>Em Breve...</Title>
      </MainContent>
    </Container>
  );
}

const Container = styled.div`
  min-height: calc(100vh - 100px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: ${font.font_family};
  background: ${colors.background};
  padding: 50px;
`
const MainContent = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`
const Title = styled.h1`
  font-size: 2rem;
  color: ${colors.black};
  font-weight: bold;
`