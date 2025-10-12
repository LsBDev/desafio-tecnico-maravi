from pydantic import BaseModel, EmailStr
from datetime import date, time

class UserRegistration(BaseModel):
  username: str
  email: EmailStr
  password: str

class UserLogin(BaseModel):
  email: EmailStr
  password: str

class UserPublic(BaseModel):
  username: str
  email: EmailStr

class Token(BaseModel):
  access_token: str
  token_type: str

class LoginResponse(BaseModel):
  access_token: str
  token_type: str
  user: UserPublic

class NotificationCreate(BaseModel):
  linha: str
  latitude: float
  longitude: float
  data: date
  hora_inicio: time
  hora_fim: time

class NotificationPublic(BaseModel):
  id: int
  user_id: int
  notification_date: date
  line_code: str
  latitude: float
  longitude: float
  start_time: time
  end_time: time
  is_active: bool

class NotificationUpdate(BaseModel):
  is_active: bool

class MunicipalLineSchema(BaseModel):
    numero: str
    nome: str
    class Config:
        orm_mode = True