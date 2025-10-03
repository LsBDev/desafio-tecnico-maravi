from sqlalchemy.orm import registry, Mapped, mapped_column

table_registry = registry()

@table_registry.mapped_as_dataclass
class User:
    __tablename__= 'user'
    id: Mapped[int] = mapped_column(init=False, primary_key = True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]
