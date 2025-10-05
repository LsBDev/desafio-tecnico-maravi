from fastapi import APIRouter, HTTPException, Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import select
from http import HTTPStatus
from ..security import get_password_hash, verify_password, create_access_token
from ..schemas import UserRegistration, UserPublic, UserLogin, LoginResponse, Token
from ..models import User
from ..database import get_session

router = APIRouter(
  prefix='/auth',
  tags=['auth']
)
#Criar token de autorizaćao
# cadastro de usuários
@router.post("/sign-up", status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user(user: UserRegistration, session=Depends(get_session)):
    # Fazer a criação do usuário no banco
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
        # Guardar um token ao invés da senha, criptografar a senha
    hash = get_password_hash(user.password)
    user_db = User(
        username=user.username, email=user.email, password=hash
    )
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
            
    return user_db

# # login
# @router.post("/sign-in", status_code=HTTPStatus.OK, response_model=LoginResponse)
# def sign_in_user(user: UserLogin, session=Depends(get_session)):
#   # Fazer um get no banco e devolver nome e email -> Usar o schema UserPublic  
#   user_db = session.scalar(
#     select(User).where(
#       User.email == user.email
#     )
#   )
#   if not user_db:
#     raise HTTPException(
#       status_code=HTTPStatus.BAD_REQUEST,
#       detail="Dados incorretos"
#     )
#   # validar senha -> criptografia
#   if not verify_password(user.password, user_db.password):
#     raise HTTPException(
#       status_code=HTTPStatus.UNAUTHORIZED,
#       detail="Dados incorretos"
#     )
  
#   token = create_access_token()
  
#   return {
#     "access_token": token,
#     "token_type": "Bearer",
#     "user": UserPublic(username=user_db.username, email=user_db.email)
#   }


@router.post("/token", response_model=LoginResponse)
def login_for_access_token(
  form_data: OAuth2PasswordRequestForm = Depends(), 
  session=Depends(get_session)
):
  user = session.scalar(
    select(User).where(User.email == form_data.username)
  )
  if not user or not verify_password(form_data.password, user.password):
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED, detail='Incorrect email or password'
    )
  access_token = create_access_token(data={'sub': user.email}) # sub / clain

  return {'access_token': access_token, 'token_type': 'Bearer', 'user': UserPublic(username=user.username, email=user.email)}