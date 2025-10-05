from pydantic import BaseModel, EmailStr

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