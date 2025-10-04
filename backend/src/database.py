from .config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session


engine = create_engine(settings.database_url)

def get_session():
    with Session(engine) as session:
        yield session

#    yield -> Abre e fecha a sessão do db
