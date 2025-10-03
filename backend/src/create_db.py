from .database import engine
from .models import table_registry

def create_database():
    table_registry.metadata.create_all(engine)
    print("Banco criado com sucesso!")

if __name__ == "__main__":
    create_database()