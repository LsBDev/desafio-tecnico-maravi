from fastapi import FastAPI
import httpx
from http import HTTPStatus
from .config import settings, setup_cors
from .schemas import UserRegistration, UserPublic, UserLogin
from sqlalchemy import select
from .database import get_session
from .models import User

app = FastAPI()
setup_cors(app)

url ="dataInicial=2024-01-29+15:40:00&dataFinal=2024-01-29+15:43:00"

@app.get("/", status_code=HTTPStatus.OK)
def root():
    return {'Health': 'Tudo Certo!'}


@app.post("/users", status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user(user: UserRegistration):
    # Fazer a criação do usuário no banco
    session = get_session()
    user_db = session.scalar(
        select(User).where(
            (User.username == user.username) | (User.email == user.email)
        )
    )
    if user_db:
        if user_db.username == user.username:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="Usuário já existe"
            )
        elif user_db.email == user.email:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail="Email já existe"
            )
        # Guardar um token ao inv~es da senha, criptografar a senha
    user_db = User(
        username=user.username, email=user.email, password=user.password
    )
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
            
    return user_db


@app.post("/sign-in", status_code=HTTPStatus.OK)
def sign_in_user(user: UserLogin):
    # Fazer um get no banco e devolver nome e email -> Usar o schema UserPublic
    return user


# Colocar aqui as regras que filtram os dados recebidos da APi do ônibus // Na verdade ver qual a melhor estrutura 
@app.get("/onibus-rj", status_code=HTTPStatus.OK)
async def get_bus_data():
    # Fazer aqui a lógica de filtro dos dados
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.api_url + url, timeout = 10.0)
            response.raise_for_status()
            return response.json()
        
        except httpx.HTTPStatusError as exc:
            return {"error": f"Erro na requisição: {exc.response.status_code} - {exc.response.text}"}
        except Exception as exc:
            return {"error": f"Ocorreu um erro: {exc}"}
        
# resposta -> lista de dicionários.

