from ..celery_app import celery_app
from ..database import get_session
from ..models import NotificationConfig
from ..tasks.notification_tasks import check_and_send_notification
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

# buscar no database as notificações  []
# vou iterar e pegar tudo
# para cada notificação invoco uma task, com a função que itera sobre o redis.-> notificação
def start_notification_process():
  session: Session = next(get_session())

  hoje = datetime.now().date()

  notifications = session.scalars(
    select(NotificationConfig).where(
      NotificationConfig.is_active == True,
      NotificationConfig.notification_date == hoje
      )
    ).all() # virá como lista 
  # ver se tem notificação
  if not notifications:
    print("Sem notificações até o momento")

  for notification in notifications:
    check_and_send_notification.delay(notification.id) # só é possível passar argumentos simples
  session.close()