from sqlalchemy.orm import registry, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
from typing import List
from datetime import time, date
 # active, completed, expired para a coluna status
table_registry = registry()

@table_registry.mapped_as_dataclass
class User:
    __tablename__= 'user'
    id: Mapped[int] = mapped_column(init=False, primary_key = True)
    username: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]
    configs: Mapped[List["NotificationConfig"]] = relationship(
    back_populates="user", cascade="all, delete-orphan", default_factory=list
    ) 

@table_registry.mapped_as_dataclass
class NotificationConfig:
    __tablename__ = 'notification_config'
    id: Mapped[int] = mapped_column(init=False, primary_key=True)    
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    notification_date: Mapped[date]
    line_code: Mapped[str]    
    latitude: Mapped[float]
    longitude: Mapped[float]
    start_time: Mapped[time] 
    end_time: Mapped[time]    
    user: Mapped[User] = relationship(back_populates="configs", init=False)    
    is_active: Mapped[bool] = mapped_column(default=True)
    notification_status: Mapped[str] = mapped_column(default="active")

@table_registry.mapped_as_dataclass
class MunicipalLine:
    __tablename__ = 'municipal_lines'
    numero: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String)