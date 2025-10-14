# Use uma imagem oficial do Python como base
FROM python:3.11

# Instale o tzdata para o fuso horário -> Linha adicionada
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de configuração do Poetry
COPY pyproject.toml poetry.lock ./

# Instale o Poetry
RUN pip install poetry

# Instale as dependências usando o Poetry, ignorando as dependências de dev
RUN poetry install

# Copie o script de entrada e o torne executável
COPY ./src/entrypoint.sh ./src/entrypoint.sh
RUN chmod +x ./src/entrypoint.sh

# Copie o restante do código da sua aplicação
COPY . .

# Adicione o diretório da sua aplicação ao PYTHONPATH para que os módulos sejam encontrados
ENV PYTHONPATH=/app:$PYTHONPATH

# Expõe a porta que o FastAPI usa
EXPOSE 8000

# Use o entrypoint para inicializar o banco de dados antes de iniciar o serviço
ENTRYPOINT [".app/src/entrypoint.sh"]

# # Comando para rodar a aplicação com Uvicorn via Poetry
CMD ["poetry", "run", "uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]