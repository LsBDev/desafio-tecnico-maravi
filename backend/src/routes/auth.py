from fastapi import APIRouter, HTTPException, Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import select
from http import HTTPStatus
from ..security import get_password_hash, verify_password, create_access_token
from ..schemas import UserRegistration, UserPublic, UserLogin, LoginResponse, Token
from ..models import User
from ..database import get_session
from ..security import get_current_user

router = APIRouter(
  prefix='/auth',
  tags=['auth']
)

@router.post("/sign-up", status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user(user: UserRegistration, session=Depends(get_session)):
  # Verificar existência e Fazer a criação do usuário no banco
  user_exist = session.scalar(
    select(User).where(
      (User.username == user.username) | (User.email == user.email)
    )
  )
  if user_exist:
    if user_exist.username == user.username:
      raise HTTPException(
        status_code=HTTPStatus.BAD_REQUEST,
        detail="Usuário já existe."
      )
    elif user_exist.email == user.email:
      raise HTTPException(
        status_code=HTTPStatus.BAD_REQUEST,
        detail="Email já existe."
      )
  # Guardar um hash ao invés da senha, criptografar a senha
  hash = get_password_hash(user.password)
  # Guarda no banco
  try: 
    user_db = User(username=user.username, email=user.email, password=hash)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
  except Exception as err:
    session.rollback()
    raise HTTPException(
      status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
      detail="Erro ao criar usuário."
    )
          
  return user_db


@router.post("/token", status_code=HTTPStatus.OK, response_model=LoginResponse)
def login_for_access_token(
  form_data: OAuth2PasswordRequestForm = Depends(), 
  session=Depends(get_session)
):
  # Verifica existência de conta
  user = session.scalar(
    select(User).where(User.email == form_data.username)
  )
  if not user or not verify_password(form_data.password, user.password):
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED, detail='Credenciais incorretas.'
    )
  # Cria Token de acesso
  access_token = create_access_token(data={'sub': user.email}) # sub / clain

  return {'access_token': access_token, 'token_type': 'Bearer', 'user': UserPublic(username=user.username, email=user.email)}


@router.get("/validate",status_code=HTTPStatus.OK)
def validate_token(current_user: User=Depends(get_current_user)): 
  return {
    "status": "Usuário autenticado.",
    "user": {
      "id": current_user.id,
      "username": current_user.username,
      "email": current_user.email
    }
  }