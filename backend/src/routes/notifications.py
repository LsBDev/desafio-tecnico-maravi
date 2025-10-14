from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List
from ..security import get_current_user, get_session
from ..models import User, NotificationConfig
from ..schemas import NotificationUpdate

router = APIRouter(
    prefix="/notifications", 
    tags=["notifications"]
)


@router.get("/user", response_model=List[dict])
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):

    notifications = session.scalars(
        select(NotificationConfig).where(NotificationConfig.user_id == current_user.id)
    ).all()

    # Converte os objetos do SQLAlchemy para dicionários antes de retornar
    return [
      {
        "id": n.id,
        "user_id": n.user_id,
        "line_code": n.line_code,
        "notification_date": n.notification_date,
        "start_time": n.start_time,
        "end_time": n.end_time,
        "is_active": n.is_active,
        "latitude": n.latitude,
        "longitude": n.longitude,
        "status": n.notification_status
      }
      for n in notifications
    ]

@router.patch("/{notification_id}")
async def update_notification_status(
    notification_id: int,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    notification = session.get(NotificationConfig, notification_id)

    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada.")

    if notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para alterar esta notificação.")

    notification.is_active = notification_update.is_active
    session.add(notification)
    session.commit()
    session.refresh(notification)

    return {"message": "Notificação atualizada com sucesso."}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    notification = session.get(NotificationConfig, notification_id)

    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada.")

    if notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para deletar esta notificação.")

    session.delete(notification)
    session.commit()

    return {"message": "Notificação deletada com sucesso."}