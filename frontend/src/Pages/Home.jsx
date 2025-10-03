import axios from "axios"
import { useEffect, useState } from "react"

// URL do Backend (melhor definir fora da função para evitar redefinição)
const API_URL = process.env.REACT_APP_API_URL

export default function Home() {
    const [dadosBrutos, setDadosBrutos] = useState([]) 
    const [linhasUnicas, setLinhasUnicas] = useState([])
    const [linhaSelecionada, setLinhaSelecionada] = useState('')

    // Fazer uma função de carregamento de dados? Será que vai ser preciso mesmo usando redis?
    useEffect(() => {
        axios.get(`${API_URL}`)
        .then(res => {
            const dadosRecebidos = res.data || [] // Dados brutos (lista de todos os ônibus)
            setDadosBrutos(dadosRecebidos)
            const listaDeTodasAsLinhas = dadosRecebidos.map(item => item.linha) 
            const linhasFiltradas = Array.from(new Set(listaDeTodasAsLinhas)).sort()
            
            // Salva a lista final de linhas únicas
            setLinhasUnicas(linhasFiltradas)                
            console.log("Linhas Filtradas:", linhasFiltradas)
        })
        .catch(err => {
            console.error("Erro ao buscar dados de linhas:", err.response ? err.response.data : err.message)
        })
    }, []) // Array de dependências vazio para rodar apenas uma vez (ao montar)
    console.log("Dados:", dadosBrutos)

    return(
        <>
            {/* <h1>Monitoramento de Ônibus RJ</h1> */}
            <select onChange={e => setLinhaSelecionada(e.target.value)} value={linhaSelecionada} id="select-linha">
                <option value="" disabled>Selecione a Linha: {/*linhasUnicas.length*/}</option> 
                <optgroup label="Linhas Disponíveis"></optgroup>
                
                {/* Mapeia sobre a nova lista filtrada de linhas únicas */}
                {linhasUnicas.map((linha, index) => 
                <option key={index} value={linha}>{linha}</option>
                )}
            </select>
        </>
    )
}
