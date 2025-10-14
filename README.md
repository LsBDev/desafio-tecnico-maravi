O Projeto Avisa-aí
O Avise-aí é um projeto monorepo que combina backend em FastAPI com um frontend em ReactJS. Seu objetivo principal é fornecer um sistema de notificação em tempo real para usuários que dependem de linhas de ônibus do RJ

O backend utiliza Redis como um cache de alta velocidade para armazenar os dados de localização dos ônibus e também como broker para gerenciar tarefas em segundo plano com o Celery. As configurações do usuário e outras informações persistem em um banco de dados SQLite.

Com o Docker Compose, todo o ambiente de desenvolvimento é orquestrado de forma simples, permitindo que todos os serviços — backend, frontend e os workers do Celery — funcionem em conjunto sem esforço. Isso garante que o projeto seja portátil e fácil de configurar.

*COMO RODAR O PROJETO*

1. Pré-requisitos:
- Garanta que o Docker Desktop esteja instalado e em execução na sua máquina

2. Configuração:
- Crie um arquivo .env na raiz do projeto a partir do .env.example.

- Preencha as variáveis de ambiente necessárias, como chaves de API e e-mail.

3. Execução:
- Abra o terminal na raiz do projeto (onde está o arquivo docker-compose.yml).
- Execute o comando para construir as imagens e iniciar todos os serviços:

 ```bash
  docker-compose up --build
 ```