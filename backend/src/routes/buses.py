from fastapi import APIRouter, Depends, HTTPException
from http import HTTPStatus
from ..config import settings
from datetime import datetime
from ..security import get_current_user, get_session
from ..models import User, NotificationConfig
from sqlalchemy.orm import Session
from ..schemas import NotificationCreate
import redis
import json
from ..services.notification_services import travel_time



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



# @router.get("/position", status_code=HTTPStatus.OK)
# async def get_bus_position(linha: str, user_lat: float, user_lng: float):
#   print("entrou no get_bus_position")

#   r = redis.Redis(
#   host=settings.redis_host, 
#   port=settings.redis_port, 
#   db=0,
#   decode_responses=True
#   )

#   try:
#     bus_data_raw = r.get("bus_data_current") #lista de todos os onibus
#     if not bus_data_raw:
#       print(f"Os Dados de ônibus não disponíveis no Redis.")
#       return {"message": "Dados de ônibus não disponíveis."}
    
#     # ler dados do redis
#     bus_data = json.loads(bus_data_raw)
    
#     #filtro pela linha
#     onibus_da_linha_dict = {}
#     # onibus_da_linha  = []

#     for bus in bus_data:
#       # Verifica se a linha do ônibus corresponde à linha que você quer
#       if str(bus.get('linha')) == linha:

#         ordem_do_onibus = bus.get('ordem')
#         # Converte o timestamp para um número inteiro para comparação
#         datahora_atual = int(bus.get('datahora'))
#         if ordem_do_onibus in onibus_da_linha_dict:
#           # Pega o ônibus que já está no dicionário
#           onibus_existente = onibus_da_linha_dict[ordem_do_onibus]
#           # Converte o timestamp do ônibus existente para comparação
#           datahora_existente = int(onibus_existente.get('datahora'))          
#           # Se a data/hora atual for mais recente, substitui o ônibus no dicionário
#           if datahora_atual > datahora_existente:
#             onibus_da_linha_dict[ordem_do_onibus] = bus
#         else:
#           # Se não existe, adiciona o ônibus ao dicionário
#           onibus_da_linha_dict[ordem_do_onibus] = bus
#     # Agora, converte os valores do dicionário de volta para uma lista
#     onibus_filtrados = list(onibus_da_linha_dict.values())

#     if not onibus_filtrados:
#       return {"message": "Nenhum ônibus encontrado para a linha."}

#     # Adiciona a informação de tempo a cada ônibus
#     ponto_usuario = (user_lat, user_lng)
#     google_key = settings.google_key
#     onibus_com_tempo = []

#     for onibus in onibus_filtrados:
#       try:
#         latitude_str = onibus.get('latitude').replace(',', '.')
#         longitude_str = onibus.get('longitude').replace(',', '.')
#         ponto_onibus = (float(latitude_str), float(longitude_str))
        
#         tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, google_key)
        
#         # Adiciona a nova chave ao dicionário do ônibus
#         if tempo_em_minutos is not None:
#           onibus['tempo_em_minutos'] = f"{int(tempo_em_minutos)} min"
#         else:
#           onibus['tempo_em_minutos'] = "Indisponível"
#       except (ValueError, TypeError) as e:
#         print(f"Erro ao converter coordenadas ou calcular tempo para o ônibus {onibus.get('ordem')}: {e}")
#         onibus['tempo_em_minutos'] = "Indisponível"
      
#       onibus_com_tempo.append(onibus)

#     return onibus_com_tempo

#   except json.JSONDecodeError as err:
#     raise HTTPException(
#       status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
#       detail=f"Erro ao decodificar dados do Redis: {err}"
#     )




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
    
  #==================
  #filtro pela linha
  onibus_da_linha_dict = {} # dicionário para separar as várias aparições do mesmo onibus, (O timestamp pra ver o mais atual)
  lista_onibus_filtrada= [] # armazena os onibus já filtrados

  for bus in bus_data:
    # Verifica se a linha do ônibus corresponde à linha que você quer
    if str(bus.get('linha')) == linha:

      ordem_do_onibus = bus.get('ordem')
    # Converte o timestamp para um número inteiro para comparação
      datahora_atual = int(bus.get('datahora'))
      if ordem_do_onibus in onibus_da_linha_dict:
        # Pega o ônibus que já está no dicionário
        onibus_existente = onibus_da_linha_dict[ordem_do_onibus]
        # Converte o timestamp do ônibus existente para comparação
        datahora_existente = int(onibus_existente.get('datahora'))          
        # Se a data/hora atual for mais recente, substitui o ônibus no dicionário
        if datahora_atual > datahora_existente:
          onibus_da_linha_dict[ordem_do_onibus] = bus
      else:
        # Se não existe, adiciona o ônibus ao dicionário
        onibus_da_linha_dict[ordem_do_onibus] = bus
# Agora, converte os valores do dicionário de volta para uma lista
  lista_onibus_filtrada= list(onibus_da_linha_dict.values())

#==========
  if not lista_onibus_filtrada:
    # return {"message": "Nenhum ônibus encontrado para a linha."}
    return []

  # return lista_onibus_filtrada

#================
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
  #============

  # except json.JSONDecodeError as err:
  #   raise HTTPException(
  #     status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
  #     detail=f"Erro ao decodificar dados do Redis: {err}"
  #   )



# Colocar aqui as regras que filtram os dados recebidos da APi do ônibus // Na verdade ver qual a melhor estrutura 
# @router.get("/onibus-rj", status_code=HTTPStatus.OK)
# async def get_bus_data(
#     linha: int,
#     latitude: float,
#     longitude: float,
#     data: str,
#     hora_inicio: str,
#     hora_fim: str,
#     current_user: User = Depends(get_current_user)
#   ):

#   # session: Depends(get_session)

#   # hoje = datetime.now().strftime("%Y-%m-%d")
#   dataInicial = f"{data}+{hora_inicio}:00"
#   dataFinal = f"{data}+{hora_fim}:00"
#   # compor url
#   url =f"dataInicial={dataInicial}&dataFinal={dataFinal}"
#   # url="dataInicial=2025-10-20+15:40:00&dataFinal=2025-10-20+15:43:00"

#   async with httpx.AsyncClient() as client:
#     try:
#       response = await client.get(settings.api_url + url, timeout = 10.0)
#       response.raise_for_status()

#       # Fazer aqui a lógica de filtro dos dados
#       # armazenar no Redis
#       # Ver uso do celery

#       return response.json()
    
    
#     except httpx.HTTPStatusError as exc:
#       return {"error": f"Erro na requisição: {exc.response.status_code} - {exc.response.text}"}
#     except Exception as exc:
#       return {"error": f"Ocorreu um erro: {exc}"}

