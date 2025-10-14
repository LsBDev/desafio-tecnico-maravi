from fastapi import APIRouter, Depends, HTTPException
from http import HTTPStatus
from ..config import settings
from datetime import datetime
from ..security import get_current_user, get_session
from ..models import User, NotificationConfig, MunicipalLine
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..schemas import NotificationCreate, MunicipalLineSchema
import redis
import json
from ..services.notification_services import travel_time


router = APIRouter(
  prefix='/buses',
  tags=['buses']
)

@router.get("/municipal_lines", status_code=HTTPStatus.OK, response_model=list[MunicipalLineSchema])
def get_municipal_lines(session=Depends(get_session)):
  municipal_lines = session.scalars(select(MunicipalLine)).all()
  return municipal_lines


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


@router.get("/position", status_code=HTTPStatus.OK)
async def get_bus_position(linha: str, user_lat: float, user_long: float):
  # conecta com redis
  r = redis.Redis(
  host=settings.redis_host, 
  port=settings.redis_port, 
  db=0,
  decode_responses=True
  )

  try:

    #lista de todos os onibus - dados brutos
    bus_data_raw = r.get("bus_data_current") 
    if not bus_data_raw:
      print(f"Os Dados de ônibus não disponíveis no Redis.")
      return []
    # quero buscar no redis as informações dos onibus filtrando pela linha

    # ler dados do redis
    bus_data = json.loads(bus_data_raw)

  except json.JSONDecodeError as err:
    # Este `except` está correto.
    raise HTTPException(
      status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
      detail=f"Erro ao decodificar dados do Redis: {err}"
    )
    

  onibus_da_linha_dict = {} 
  lista_onibus_filtrada= []

  for bus in bus_data:
   
    if str(bus.get('linha')) == linha:
      ordem_do_onibus = bus.get('ordem')
      datahora_atual = int(bus.get('datahora'))
      if ordem_do_onibus in onibus_da_linha_dict:
        onibus_existente = onibus_da_linha_dict[ordem_do_onibus]
        datahora_existente = int(onibus_existente.get('datahora'))          
        if datahora_atual > datahora_existente:
          onibus_da_linha_dict[ordem_do_onibus] = bus
      else:
        onibus_da_linha_dict[ordem_do_onibus] = bus
  lista_onibus_filtrada= list(onibus_da_linha_dict.values())

#==========
  if not lista_onibus_filtrada:
    return []


  # Adiciona a informação de tempo a cada ônibus
  ponto_usuario = (user_lat, user_long)
  google_key = settings.google_key
  onibus_com_tempo = []

  for onibus in lista_onibus_filtrada:
    try:
      latitude_str = onibus.get('latitude').replace(',', '.')
      longitude_str = onibus.get('longitude').replace(',', '.')
      ponto_onibus = (float(latitude_str), float(longitude_str))
      
      tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, google_key)
      
      # Adiciona a nova chave ao dicionário do ônibus
      if tempo_em_minutos is not None:
        onibus['tempo_em_minutos'] = f"{int(tempo_em_minutos)} min"
      else:
        onibus['tempo_em_minutos'] = "Indisponível"
    except (ValueError, TypeError) as e:
      print(f"Erro ao converter coordenadas ou calcular tempo para o ônibus {onibus.get('ordem')}: {e}")
      onibus['tempo_em_minutos'] = "Indisponível"
    
    onibus_com_tempo.append(onibus)

  return onibus_com_tempo