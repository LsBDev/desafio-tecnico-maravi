from ..celery_app import celery_app
from ..config import settings
from ..database import get_session
import redis
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..models import NotificationConfig, User
from datetime import datetime, time
import json
from ..services.notification_services import travel_time, send_email

# TODO - Remover comentários
# Fazer conexão com redis, database. Olhar a tabela de notificações e ver 
# se tem alguma com status ativo e que se enquadra nas lógica de enviar a notificação por e-mail
# depois pegar a informação do redis, filtrar, tratar os dados e enviar para o front.

# Configuração da conexão com o Redis e o banco de dados
r = redis.Redis(
  host=settings.redis_host, 
  port=settings.redis_port, 
  db=0,
  decode_responses=True
)

@celery_app.task
def check_and_send_notification():  
  session: Session = next(get_session())
  print("Inicionou a sessão")
  
    # a notificação é pra hoje? está ativa?
  hora_atual = datetime.now().time()
  hoje = datetime.now().date()
  print(f"[{datetime.now()}] Tarefa iniciada. Data: {hoje}, Hora: {hora_atual}")

  # dados dos onibus no redis
  bus_data_raw = r.get("bus_data_current")
  if not bus_data_raw:
    print(f"[{datetime.now()}] Dados de ônibus não disponíveis no Redis.")
    session.close()
    return
  # depois iterar sobre as notificações,ver qual tem data para hoje e o is_active = True
  # depois ver se o onibus escolhido está a 10 minutos do ponto marcado pela pessoa. (Para calculo de tempo de viagem estimado: traveltime.com)
  try:
    bus_data = json.loads(bus_data_raw)
  except json.JSONDecodeError as e:
    print(f"[{datetime.now()}] Erro ao decodificar dados do Redis: {e}")
    session.close()
    return

  notifications = session.scalars(
    select(NotificationConfig).where(
      NotificationConfig.is_active == True,
      NotificationConfig.notification_date == hoje
      )
    ).all() # virá como lista 
  # ver se tem notificação
  if not notifications:
    print("Sem notificações até o momento")
    session.close() # fechar sessão

  for notification in notifications:
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
      continue # Pula para a próxima notificação

    onibus_da_linha = [] # Lista de Onibus, tem vários
    for bus in bus_data:
      if str(bus.get('linha')) == notification.line_code:
        onibus_da_linha.append(bus)

    for onibus in onibus_da_linha:
      # Coordenadas do ônibus e do ponto do usuário
      print("Entrou no último loop")
      ponto_onibus = (float(onibus.get('latitude')), float(onibus.get('longitude')))
      ponto_usuario = (notification.latitude, notification.longitude)
      tempo_em_minutos = travel_time(ponto_usuario, ponto_onibus, settings.google_key)

      if tempo_em_minutos is not None and tempo_em_minutos <= 10:
        user = session.get(User, notification.user_id)
        if user:
          # Dispara a notificação por e-mail e desativa a notificação no banco
          send_email(user.email, notification.line_code, tempo_em_minutos)
          print("Notificou ao usuário")
          notification.is_active = False
          session.add(notification)
          session.commit()
          print(f"[{datetime.now()}] Notificação {notification.id} desativada após envio.")

  session.close()




