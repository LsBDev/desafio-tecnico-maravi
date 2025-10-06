from fastapi import APIRouter, Depends, HTTPException
import httpx
from http import HTTPStatus
from ..config import settings
from datetime import datetime
from ..security import get_current_user, get_session
from ..models import User, NotificationConfig
from sqlalchemy.orm import Session
from ..schemas import NotificationCreate


router = APIRouter(
  prefix='/buses',
  tags=['buses']
)

@router.post("/notification", status_code=HTTPStatus.CREATED)
async def create_notification(
  notification_data: NotificationCreate,
  current_user: User = Depends(get_current_user),
  session: Session = Depends(get_session)
  ):

  try:
    notification = NotificationConfig(
      user_id=current_user.id,
      line_code=notification_data.linha, 
      latitude=notification_data.latitude,
      longitude=notification_data.longitude,
      notification_date=notification_data.data,
      start_time=notification_data.hora_inicio,
      end_time=notification_data.hora_fim
    )

  except ValueError as err:
    raise HTTPException(
      status_code=HTTPStatus.BAD_REQUEST,
      detail=f"Formato de data ou hora inválido. {err}"
    )

  session.add(notification)
  session.commit()
  session.refresh(notification)

  return {"Message": "Notificação agendada!"}
  

# Colocar aqui as regras que filtram os dados recebidos da APi do ônibus // Na verdade ver qual a melhor estrutura 
@router.get("/onibus-rj", status_code=HTTPStatus.OK)
async def get_bus_data(
    linha: int,
    latitude: float,
    longitude: float,
    data: str,
    hora_inicio: str,
    hora_fim: str,
    current_user: User = Depends(get_current_user)
  ):

  # session: Depends(get_session)

  # hoje = datetime.now().strftime("%Y-%m-%d")
  dataInicial = f"{data}+{hora_inicio}:00"
  dataFinal = f"{data}+{hora_fim}:00"
  # compor url
  url =f"dataInicial={dataInicial}&dataFinal={dataFinal}"
  # url="dataInicial=2025-10-20+15:40:00&dataFinal=2025-10-20+15:43:00"

  async with httpx.AsyncClient() as client:
    try:
      response = await client.get(settings.api_url + url, timeout = 10.0)
      response.raise_for_status()

      # Fazer aqui a lógica de filtro dos dados
      # armazenar no Redis
      # Ver uso do celery

      return response.json()
    
    
    except httpx.HTTPStatusError as exc:
      return {"error": f"Erro na requisição: {exc.response.status_code} - {exc.response.text}"}
    except Exception as exc:
      return {"error": f"Ocorreu um erro: {exc}"}

