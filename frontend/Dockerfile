# Usa a imagem oficial do Node.js
FROM node:18 as biuld

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package.json ./

# Instala as dependências.
RUN npm install

# Copia todos os arquivos do projeto para o container.
COPY . .

# Expõe a porta que o servidor de desenvolvimento do React usa.
EXPOSE 3000

# Comando para iniciar a aplicação React em modo de desenvolvimento.
CMD ["npm", "start"]