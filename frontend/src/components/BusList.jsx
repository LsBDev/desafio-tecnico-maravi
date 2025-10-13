import styled from "styled-components";
import { colors, font } from "../styles/Variables.js";

export default function BusList({ buses, linha_onibus }) {
  if (!buses || buses.length === 0)
    return <EmptyMsg>Nenhum ônibus ativo nesta linha no momento.</EmptyMsg>;

  return (
    <ContainerLista>
      <Titulo>Ônibus em operação na linha {linha_onibus}</Titulo>
      <Grid>
        {buses.map((bus) => (
          <Card key={bus.ordem}>
            <LinhaTag>{bus.linha}</LinhaTag>
            <Info><strong>Ordem:</strong> {bus.ordem}</Info>
            <Info><strong>Velocidade:</strong> {bus.velocidade ? `${bus.velocidade} km/h` : "–"}</Info>
            <Info><strong>Chegada: </strong>{bus.tempo_em_minutos ? bus.tempo_em_minutos : "–"}</Info>
          </Card>
        ))}
      </Grid>
    </ContainerLista>
  );
}

const ContainerLista = styled.div`
  width: 100%;
  max-width: 1250px;
  background: ${colors.white};
  border-radius: 12px;
  margin-top: 25px;
  padding: 20px;
  box-shadow: ${colors.box_shadow};
  font-family: 'Roboto', sans-serif;
`
const Titulo = styled.h3`
  color: ${colors.label_black};
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
`
const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 15px;
  @media (max-width: 730px) {
    justify-content: center;
  }
`
const Card = styled.div`
  background-color: ${colors.background};
  border-radius: 10px;
  box-shadow: ${colors.box_shadow};
  width: 280px;        
  max-width: 100%;      
  flex-grow: 0;         
  flex-shrink: 0; 
  padding: 15px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  &:hover {
    border: 1px solid ${colors.primary};
    background-color: ${colors.white};
    transform: translateY(-2px);
  }
`
const LinhaTag = styled.span`
  display: inline-block;
  background: ${colors.primary};
  color: ${colors.white};
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 8px;
`
const Info = styled.p`
  color: ${colors.black};
  font-size: ${font.label};
  margin: 4px 0;
`
const EmptyMsg = styled.p`
  margin-top: 20px;
  color: ${colors.label_black};
  font-style: italic;
  background: ${colors.background};
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: ${colors.box_shadow};
  width: 90%;
  max-width: 600px;
  text-align: center;
`