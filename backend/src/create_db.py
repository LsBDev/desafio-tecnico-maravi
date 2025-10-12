from .database import engine
from .models import table_registry
from .utils.populate_municipal_lines import populate_municipal_lines

def create_database():
    table_registry.metadata.create_all(engine)
    print("Banco criado com sucesso!")

    # Adiciona as linhas municipais após a criação das tabelas
    populate_municipal_lines()
    print("Linhas municipais adicionadas ao banco de dados.")

if __name__ == "__main__":
    create_database()