# 🚍 Avisa-aí | Backend (FastAPI, Celery & Redis)

*Para iniciar o projeto completo, consulte as instruções no [README.md da raiz](../README.md).*

---

### Visão Geral do Backend

Este projeto contém a API REST e a lógica de processamento em segundo plano (background tasks) responsável por gerenciar as notificações de ônibus e o rastreamento em tempo real.

- **API Principal**: FastAPI (Python)
- **Gerenciamento de Dependências**: Poetry
- **Mensageria e Workers**: Celery, com Redis como broker
- **Banco de Dados**: SQLite
- **Camada de Persistência**: SQLAlchemy

### Comandos Úteis

Se você precisar executar comandos dentro do container do backend, use o Docker.

* **Para acessar o shell do container**:
    ```bash
    docker-compose exec backend sh
    ```

* **Para purgar filas do Celery**:
    ```bash
    docker-compose exec backend poetry run celery -A src.celery_app purge
    ```