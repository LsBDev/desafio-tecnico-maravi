from celery import Celery
from celery.schedules import crontab
from .config import settings


celery_app = Celery(
  "bus-notification",
  broker=f"redis://{settings.redis_host}:{settings.redis_port}/0",
  backend=f"redis://{settings.redis_host}:{settings.redis_port}/0",
  include=['src.tasks.bus_data_tasks']
)

# celery_app.autodiscover_tasks(packages=['src.tasks'])

celery_app.conf.beat_schedule = {
  "fetch-bus-data-every-minute": {
    "task": "src.tasks.bus_data_tasks.get_and_store_bus_data",
    "schedule": crontab(minute='*')
  }
}

