from celery import Celery
from celery.schedules import crontab
from .config import settings
from kombu import Queue


celery_app = Celery(
  "bus-notification",
  broker=f"redis://{settings.redis_host}:{settings.redis_port}/0",
  backend=f"redis://{settings.redis_host}:{settings.redis_port}/0",
  include=['src.tasks.bus_data_tasks', 'src.tasks.notification_tasks']
)

# Definir as filas
celery_app.conf.task_queues = (
    Queue('default', routing_key='default.#'),
    Queue('serial_tasks', routing_key='serial_tasks.#'), # Fila para tarefas seriais
)
celery_app.conf.task_default_queue = 'default'

celery_app.conf.beat_schedule = {
  "fetch-bus-data-every-minute": {
    "task": "src.tasks.bus_data_tasks.get_and_store_bus_data",
    "schedule": crontab(minute='*')
  }, 
  #   "start-notification-process": {
  #   "task": "src.tasks.manager_tasks.start_notification_process",
  #   "schedule": crontab(minute='*')
  # }
  # "check-for-pending-notifications": {
  #   "task": "src.tasks.notification_tasks.check_and_send_notification",
  #   "schedule": crontab(minute='*')
  # }
}

