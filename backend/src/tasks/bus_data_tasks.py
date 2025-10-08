import httpx
import redis
import json
from ..celery_app import celery_app
from ..config import settings
from datetime import datetime, timedelta


# Configuração da conexão com redis

r = redis.Redis(
  host=settings.redis_host, 
  port=settings.redis_port, 
  db=0,
  decode_responses=True
)

@celery_app.task
def get_and_store_bus_data():

  data_final = datetime.now()
  data_inicial = data_final - timedelta(minutes=1)

  url = f"{settings.api_url}?dataInicial={data_inicial.strftime('%Y-%m-%d %H:%M:%S')}&dataFinal={data_final.strftime('%Y-%m-%d %H:%M:%S')}"

  try:
    response = httpx.get(url, timeout=60.0)
    response.raise_for_status()
    bus_data = json.dumps(response.json())
    r.setex("bus_data_current", 60, bus_data) #setex - set with expiration (expira em 60s)
    print("Dados atualizados no Redis.")

  except Exception as exc:
    print(f"Erro ao buscar ou salvar dados dos ônibus: {exc}")
