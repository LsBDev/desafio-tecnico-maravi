# notification_tasks.py
from ..celery_app import celery_app
from ..config import settings
from ..database import get_session
import redis
# from sqlalchemy import select
from sqlalchemy.orm import Session
from ..models import NotificationConfig, User
from datetime import datetime, time
import json
from ..services.notification_services import travel_time, send_email

r = redis.Redis(
  host=settings.redis_host, 
  port=settings.redis_port, 
  db=0,
  decode_responses=True
)

@celery_app.task
def check_and_send_notification(notification_id):
  lock_key = f"lock:notification:{notification_id}"
  # Tenta adquirir o lock para esta notificação específica
  lock_acquired = r.set(lock_key, "locked", ex=10, nx=True)
  print("Adquiriu o lock_key = linha 25 notification_tasks")
  if not lock_acquired:
    print(f"[{datetime.now()}] Notificação {notification_id} já está sendo processada por outro worker. Ignorando.")
    return

  session: Session = next(get_session())
  
  try:
    print(f"[{datetime.now()}] Lock adquirido. Processando notificação {notification_id}...")
    
    # Busca a notificação no banco de dados usando o ID
    notification = session.get(NotificationConfig, notification_id)
    
    if not notification:
      print(f"[{datetime.now()}] Notificação com ID {notification_id} não encontrada.")
      session.close()
      return

    hora_atual = datetime.now().time()
    hoje = datetime.now().date()
    
    # Certifique-se de que a notificação está ativa e a data é a de hoje
    if not notification.is_active or notification.notification_date != hoje:
      session.close()
      return

    start_time_db = notification.start_time
    end_time_db = notification.end_time

    if not isinstance(start_time_db, time):
        start_time_db = datetime.strptime(str(start_time_db), '%H:%M:%S').time()

    if not isinstance(end_time_db, time):
        end_time_db = datetime.strptime(str(end_time_db), '%H:%M:%S').time()

    if hora_atual > end_time_db:
      print(f"[{datetime.now()}] Janela de tempo da notificação {notification.id} expirou. Desativando...")
      notification.is_active = False
      session.add(notification)
      session.commit()
      session.refresh(notification)
      session.close()
      return

    bus_data_raw = r.get("bus_data_current")
    if not bus_data_raw:
      print(f"[{datetime.now()}] Dados de ônibus não disponíveis no Redis.")
      session.close()
      return
    print("linha 69 - Le os dados do redis - notification_tasks")
    try:
      bus_data = json.loads(bus_data_raw)
    except json.JSONDecodeError as e:
      print(f"[{datetime.now()}] Erro ao decodificar dados do Redis: {e}")
      session.close()
      return

    onibus_da_linha = []
    for bus in bus_data:
      if str(bus.get('linha')) == notification.line_code:
        onibus_da_linha.append(bus)

    print("Terminou de preencher o array de onibus - notification_tasks")
    for onibus in onibus_da_linha:

      latitude_str = onibus.get('latitude').replace(',', '.')
      longitude_str = onibus.get('longitude').replace(',', '.')

      ponto_onibus = (float(latitude_str), float(longitude_str))
      ponto_usuario = (notification.latitude, notification.longitude)
      tempo_em_minutos = travel_time(ponto_onibus, ponto_usuario, settings.google_key)
      print(f"linha 90 - Tempo vindo do Travel_time: {tempo_em_minutos} - notification_tasks")
      print(f"Linha do onibus - {notification.line_code}")
      print(f"Ordem do onibus - {onibus.get('ordem')}")

      if tempo_em_minutos is not None and tempo_em_minutos <= 10:
        user = session.get(User, notification.user_id)
        if user:
          print("Caiu na condição dos 10 minutos, Notificou ao usuário")
          send_email(user.username, user.email, notification.line_code, tempo_em_minutos)
          notification.is_active = False
          session.add(notification)
          session.commit()
          session.refresh(notification)
          print(f"[{datetime.now()}] Notificação {notification.id} desativada após envio.")
          break
      else:
        print(f"Sem notificação! Tempo de chegada {tempo_em_minutos:.0f}")
  except Exception as exc:
    print(f"Erro na tarefa de notificação: {exc}")
  
  finally:
    r.delete(lock_key)
    session.close()