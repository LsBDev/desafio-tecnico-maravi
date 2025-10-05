from pwdlib import PasswordHash
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from jwt import encode, decode
from jwt.exceptions import PyJWTError
from .config import settings
from .database import get_session
from .models import User
from http import HTTPStatus

pwd_context = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_password_hash(password: str):
    return pwd_context.hash(password) 

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password) 

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(tz=ZoneInfo('UTC')) + timedelta(
      minutes= settings.access_token_expire_minutes
    )
    to_encode.update({'exp': expire})
    encode_jwt = encode(to_encode, settings.jwt_secret_key, algorithm=settings.algorithm)

    return encode_jwt

def get_current_user(session=Depends(get_session),token: str = Depends(oauth2_scheme)):
  
  credentials_exception = HTTPException(
    status_code=HTTPStatus.UNAUTHORIZED, 
    detail="Coul not validate credentials",
    headers={"WWW-Authenticate": "Bearer"}        
  )

  try:
    payload = decode(token, settings.jwt_secret_key, algorithms=settings.algorithm)
    username = payload.get('sub')
    if not username:
      raise credentials_exception
  except PyJWTError:
    raise credentials_exception
      
  user_db = session.scalar(
    select(User).where(User.email == username)
  )
  
  if not user_db:
    raise credentials_exception
  
  return user_db
