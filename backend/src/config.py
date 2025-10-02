from fastapi import FastAPI
from pydantic_settings import BaseSettings
from fastapi.middleware.cors import CORSMiddleware


class Settings(BaseSettings):
    api_url: str
    frontend_origin: str = "http://localhost:3000"
    class Config:
        env_file = ".env"

settings = Settings()

def setup_cors(app: FastAPI):
    origins = [
    settings.frontend_origin,
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
