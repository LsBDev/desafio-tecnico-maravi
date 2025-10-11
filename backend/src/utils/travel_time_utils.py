import redis
from ..config import settings
from datetime import datetime, time
import json
from ..services.notification_services import travel_time

r = redis.Redis(
  host=settings.redis_host, 
  port=settings.redis_port, 
  db=0,
  decode_responses=True
)


def get_data_by_line_code(bus_line, ponto_usuario):
  google_key = settings.google_key

  try:
    bus_data_raw = r.get("bus_data_current")
    if not bus_data_raw:
      print(f"[{datetime.now()}] Dados de ônibus não disponíveis no Redis.")
      return
    print("Le os dados do redis - notification_tasks")
    try:
      bus_data = json.loads(bus_data_raw)
    except json.JSONDecodeError as e:
      print(f"[{datetime.now()}] Erro ao decodificar dados do Redis: {e}")
      return
  except Exception as exc:
    print(f"Erro ao pegar os dados do Redis {exc}")
  
  onibus_da_linha_dict = {}
  onibus_da_linha = []

    
  for bus in bus_data:
    # Verifica se a linha do ônibus corresponde à linha que você quer
    if str(bus.get('linha')) == bus_line:

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
  onibus_da_linha = list(onibus_da_linha_dict.values())



  onibus_e_tempo = {} # Dicionário para armazenar a ordem e o tempo
  
  for onibus in onibus_da_linha:
    latitude_str = onibus.get('latitude').replace(',', '.')
    longitude_str = onibus.get('longitude').replace(',', '.')
    
    # Verifica se as coordenadas são válidas antes de continuar
    try:
        ponto_onibus = (float(latitude_str), float(longitude_str))
        tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, google_key)
        
        # Monta o dicionário {ordem: tempo}
        if tempo_em_minutos is not None:
            onibus_e_tempo[onibus.get('ordem')] = tempo_em_minutos
        else: 
          onibus_e_tempo[onibus.get('ordem')] = "Indisponível"
    except (ValueError, TypeError) as e:
        print(f"Erro ao converter coordenadas para o ônibus {onibus.get('ordem')}: {e}")
        onibus_e_tempo[onibus.get('ordem')] = "Indisponível"
        continue # Pula para o próximo ônibus
  return onibus_e_tempo


  # onibus_e_tempo = {}
  # for onibus in onibus_da_linha:
  #   latitude_str = onibus.get('latitude').replace(',', '.')
  #   longitude_str = onibus.get('longitude').replace(',', '.')

  #   ponto_onibus = (float(latitude_str), float(longitude_str))
  #   tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, settings.google_key)


  # return {'ordem': }

  # Pegar os dados deo redis
  # Filtrar os dados com base na data (front) e linha (front) 
  # Ponto do usuário eu tenho no front
  # Ponto dos onibus eu itero pela lista do redis e pego para cada onibus na lista de onibus filtrados 




  # tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, settings.google_key)
 
