Este arquivo contém as instruções para configurar e executar o projeto de back-end.

1. Pré-requisitos
Certifique-se de que você tem o Python e o Poetry instalados na sua máquina.

Além disso, é necessário ter o Docker para rodar o servidor Redis, que é usado pelo Celery.

2. Instalação
Clone o repositório:

Bash

git clone <URL_do_seu_repositorio>
cd <nome_da_pasta>/backend
Instale as dependências:
O Poetry irá instalar todas as dependências e criar o ambiente virtual automaticamente.

Bash

poetry install
3. Configuração
Execute o comando abaixo para criar o arquivo database.db e as tabelas necessárias.

Bash

poetry run python -m src.create_db
4. Executando o Projeto
Para rodar o projeto, você precisará de três terminais.

Terminal 1: Iniciar o servidor Redis
Use o Docker para iniciar o container do Redis.

Bash

docker run --name my-redis-db -p 6379:6379 -d redis
Se você precisar remover um container com o mesmo nome antes de criar um novo, use o comando: docker rm my-redis-db.

Terminal 2: Iniciar o servidor FastAPI (API)
Este comando inicia o servidor da sua API.

Bash

poetry run uvicorn src.app:app --reload
Terminais 3 e 4: Iniciar os Workers e Beat do Celery
Abra dois novos terminais. Um para o worker padrão e outro para as tarefas seriais.

Worker para tarefas seriais:

Bash

Linux: poetry run celery -A src.celery_app worker --loglevel=info -Q serial_tasks -c 1
Worker para tarefas padrão:
No win: poetry run celery -A src.celery_app worker --loglevel=info -Q serial_tasks -c 1 --pool=solo

Bash

Linux: poetry run celery -A src.celery_app worker --loglevel=info -Q default
Win: poetry run celery -A src.celery_app worker --loglevel=info -Q default --pool=solo
Terminal 5: Iniciar o Celery Beat (agendador)
Este comando é responsável por agendar as tarefas recorrentes.

Bash

poetry run celery -A src.celery_app beat
Comandos Adicionais (Opcionais)
Limpar a fila de tarefas do Celery:

Bash

poetry run celery -A src.tasks.bus_data_tasks purge
poetry run celery -A src.tasks.notification_tasks purge
