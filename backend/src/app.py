from fastapi import FastAPI
import httpx
from http import HTTPStatus
from .config import settings, setup_cors
from .schemas import UserRegistration, UserPublic, UserLogin

app = FastAPI()
setup_cors(app)

url ="dataInicial=2024-01-29+15:40:00&dataFinal=2024-01-29+15:43:00"

@app.get("/", status_code=HTTPStatus.OK)
def root():
    return {'Health': 'Tudo Certo!'}


@app.post("/users", status_code=HTTPStatus.CREATED)
def create_user(user: UserRegistration):
    # Fazer a criação do usuário no banco
    return user


@app.post("/sign-in", status_code=HTTPStatus.OK)
def sign_in_user(user: UserLogin):
    # Fazer um get no banco e devolver nome e email -> Usar o schema UserPublic
    return user


# Colocar aqui as regras que filtram os dados recebidos da APi do ônibus // Na verdade ver qual a melhor estrutura 
@app.get("/onibus-rj", status_code=HTTPStatus.OK)
async def get_bus_data():
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

