from fastapi import FastAPI, Depends
from http import HTTPStatus
from .config import settings, setup_cors
from .schemas import UserPublic, NotificationPublic
from sqlalchemy import select
from .database import get_session
from .models import User, NotificationConfig
from .routes import auth, buses


app = FastAPI()
setup_cors(app)
app.include_router(auth.router)
app.include_router(buses.router)


# Rever a questão do .env -> Corrigir, está subindo para o github, não está no gitignore

@app.get("/", status_code=HTTPStatus.OK)
def root():
    return {'Health': 'Tudo Certo!'}

@app.get("/users", status_code=HTTPStatus.OK, response_model=list[UserPublic])
def get_users(session=Depends(get_session)):
  users =  session.scalars(select(User)).all()
  return users

@app.get("/notifications", status_code=HTTPStatus.OK, response_model=list[NotificationPublic])
def get_notifications(session=Depends(get_session)):
  notifications = session.scalars(select(NotificationConfig)).all()
  return notifications



