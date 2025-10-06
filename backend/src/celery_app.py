from celery import Celery
from celery.schedules import crontab
from .config import settings


celery_app = Celery(
  "bus-notification",
  broker=f"redis://{setting.redis_host}:{settings.redis_port}/0",
  backend=f"redis://{setting.redis_host}:{settings.redis_port}/0"
)

celery_app.conf.beat_schedule = {
    "fetch-bus-data-every-minute": {
        "task": "src.tasks.bus_data.get_and_store_bus_data",
        "schedule": crontab(minute='*')
    }
}

celery_app.automatic_tasks(['src.tasks'])