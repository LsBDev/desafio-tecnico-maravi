# populate_db.py
import json
from sqlalchemy.orm import Session
from ..database import get_session
from ..models import MunicipalLine

def populate_municipal_lines():
    print("Iniciando a sessão do populate_municipal_lines")
    session: Session = next(get_session())

    try:
        with open('src/linhas_municipais.json', 'r', encoding='utf-8') as f:
            linhas_municipais = json.load(f)
        # Limpa a tabela antes de popular para evitar duplicatas
        linhas_unicas = {linha['numero']: linha for linha in linhas_municipais}.values()
        
        session.query(MunicipalLine).delete()
        print("Tabela de linhas municipais limpa.")
        
        # Itera sobre a nova lista de linhas únicas
        for linha_data in linhas_unicas:
            linha = MunicipalLine(
                numero=linha_data['numero'],
                nome=linha_data['nome']
            )
            session.add(linha)
        
        session.commit()
        print("Tabela populada com sucesso!")
        
    except Exception as e:
        session.rollback()
        print(f"Erro ao popular o banco de dados: {e}")
    finally:
        session.close()