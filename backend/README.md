🚍 Avisa Aí | Backend (FastAPI, Celery & Redis)
Este projeto contém a API REST e a lógica de processamento em segundo plano (background tasks) responsável por gerenciar as notificações de ônibus e o rastreamento em tempo real.

1. Pré-requisitos
Para configurar e executar o projeto, você precisa dos seguintes softwares instalados na sua máquina:

- Python (v3.11+): Linguagem de programação.
- Poetry: Gerenciador de dependências e ambiente virtual do Python.
- Docker: Necessário para rodar o servidor Redis (broker do Celery).

2. Instalação e Preparação
Siga os passos abaixo para preparar o ambiente localmente.

➡️ Clone o Repositório
git clone <https://github.com/LsBDev/desafio-tecnico-maravi.git>
cd <desafio-tecnico-maravi>/backend

➡️ Instale as Dependências
O Poetry irá instalar todas as dependências e criar o ambiente virtual isolado.

# poetry install

➡️ Configure o Banco de Dados SQLite
Crie o arquivo database.db e as tabelas necessárias para o projeto:

# poetry run python -m src.create_db

3. Executando o Projeto
Para colocar a aplicação em funcionamento, você precisará de múltiplos terminais para iniciar a API, o Redis e os serviços do Celery.

A. Iniciar o Broker (Redis)
O Redis é usado como o broker de mensagens para o Celery.

# docker run --name my-redis-db -p 6379:6379 -d redis
Dica: Se o container com o mesmo nome já existir, remova-o primeiro com: # docker rm my-redis-db.

B. Terminal 1: Iniciar o Servidor FastAPI (API)
Inicia o servidor principal da sua API com hot-reload.

# poetry run uvicorn src.app:app --reload

C. Terminais 2 e 3: Iniciar os Workers do Celery
Abra dois novos terminais. O Celery precisa de workers separados para processar tarefas em diferentes filas.

🛠️ Worker para Tarefas Seriais (Fila serial_tasks)
Este worker é crucial para tarefas que devem ser processadas em ordem, como a leitura de dados ou a atualização de posição.
=> Linux/macOS
# poetry run celery -A src.celery_app worker --loglevel=info -Q serial_tasks -c 1
=> Windows
# poetry run celery -A src.celery_app worker --loglevel=info -Q serial_tasks -c 1 --pool=solo

⚙️ Worker para Tarefas Padrão (Fila default)
Este worker é usado para tarefas genéricas ou agendamentos mais leves.
=> Linux/macOS
# poetry run celery -A src.celery_app worker --loglevel=info -Q default
=> Windows
# poetry run celery -A src.celery_app worker --loglevel=info -Q default --pool=solo

D. Terminal 4: Iniciar o Celery Beat (Agendador)
Este serviço é responsável por agendar e disparar as tarefas recorrentes (ex: a busca de dados a cada minuto).

# poetry run celery -A src.celery_app beat

4. Comandos Adicionais
➡️ Limpeza de Fila de Tarefas (Purge)
Use estes comandos para limpar todas as tarefas pendentes das filas, caso necessário:

# poetry run celery -A src.tasks.bus_data_tasks purge
# poetry run celery -A src.tasks.notification_tasks purge