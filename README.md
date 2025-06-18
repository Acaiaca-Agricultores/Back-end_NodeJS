# API Acaiaca Agricultores - Back-end Node.js

Bem-vindo ao repositório do back-end da API Acaiaca Agricultores! Este projeto é uma API RESTful desenvolvida com Node.js e Express, projetada para gerenciar usuários (agricultores e consumidores) e produtos agrícolas. Ele integra autenticação JWT, upload de arquivos e persistência de dados em um banco de dados PostgreSQL.

<img src="img-readme-backend/25500F.png" alt="Logo do Projeto Acaiaca Agricultores">

## Sumário

* [Visão Geral](#visão-geral)
* [Funcionalidades](#funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Configuração do Ambiente](#configuração-do-ambiente)
    * [Pré-requisitos](#pré-requisitos)
    * [Variáveis de Ambiente](#variáveis-de-ambiente)
    * [Executando com Docker Compose (Recomendado)](#executando-com-docker-compose-recomendado)
    * [Executando Localmente](#executando-localmente)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Rotas da API](#rotas-da-api)
    * [Autenticação](#autenticação)
    * [Usuários](#usuários)
    * [Produtos](#produtos)
* [Contribuição](#contribuição)
* [Licença](#licença)

## Visão Geral

Esta API serve como o coração do sistema Acaiaca Agricultores, permitindo que agricultores listem seus produtos e consumidores os visualizem. A segurança é uma prioridade, com autenticação baseada em tokens web JSON (JWT) para proteger as rotas sensíveis. O uso do Docker Compose simplifica o processo de configuração do ambiente, garantindo que o back-end e o banco de dados PostgreSQL (e MongoDB para futura expansão ou caso seja o banco primário para outros dados) estejam prontos para uso com um único comando.

## Funcionalidades

* **Autenticação Segura**:
    * Registro de novos usuários (agricultores e consumidores).
    * Login de usuários com geração de JWT.
    * Verificação de token JWT para acesso a rotas protegidas.
    * Atualização e redefinição de senha.
* **Gerenciamento de Usuários**:
    * Criação e edição de perfis de usuário.
    * Upload de imagens de perfil.
    * Exclusão de usuários (com exclusão em cascata de produtos associados).
    * Listagem de todos os agricultores e seus produtos.
* **Gerenciamento de Produtos Agrícolas**:
    * Registro de produtos com nome, descrição, categoria, quantidade, preço e imagem.
    * Categorias de produtos: Fruta, Verdura, Legume (definidas como ENUM no modelo).
    * Upload de imagens de produtos.
    * Listagem de todos os produtos.
    * Visualização de detalhes de um produto específico.
    * Visualização de produtos por usuário.
    * Edição e exclusão de produtos existentes.

## Tecnologias Utilizadas

* **Node.js**: Plataforma de tempo de execução JavaScript.
* **Express.js**: Framework web para Node.js.
* **Sequelize**: ORM (Object-Relational Mapper) para Node.js, utilizado para interagir com o banco de dados PostgreSQL.
* **PostgreSQL**: Banco de dados relacional robusto e de código aberto.
* **Mongoose**: ORM para MongoDB (presente no `package.json`, mas o código indica PostgreSQL para `Product` e `User`).
* **Bcrypt**: Biblioteca para hash de senhas.
* **JSON Web Token (JWT)**: Para autenticação baseada em token.
* **Multer**: Middleware para lidar com `multipart/form-data`, usado para upload de arquivos.
* **Dotenv**: Para carregar variáveis de ambiente de um arquivo `.env`.
* **Cors**: Middleware Express para habilitar o CORS (Cross-Origin Resource Sharing).
* **Nodemon**: Ferramenta que ajuda no desenvolvimento de aplicativos Node.js reiniciando automaticamente o servidor quando alterações nos arquivos são detectadas (somente em desenvolvimento).
* **Docker & Docker Compose**: Para conteinerização e orquestração dos serviços da aplicação e do banco de dados.

## Configuração do Ambiente

Siga as instruções abaixo para configurar e executar o projeto.

### Pré-requisitos

* Node.js (versão 18 ou superior) e npm (gerenciador de pacotes do Node.js)
* Docker e Docker Compose (recomendado para simplificar a configuração do banco de dados)
* Git

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (`acaiaca-agricultores/back-end_nodejs/Back-end_NodeJS-93fabf006a66d076746bc8022bd10446ec276abb/.env`) com base no exemplo abaixo. Estas variáveis são cruciais para a conexão com o banco de dados e a segurança da aplicação.

```dotenv
PORT=3000
CORS_ORIGIN=http://localhost:5173 # Ou a URL do seu front-end
SECRET=suaChaveSecretaJWT
JWT_EXPIRES_IN=1d # Exemplo: 1d para 1 dia, 8h para 8 horas

# Configurações do PostgreSQL
DB_HOST=localhost # ou o nome do serviço Docker se estiver usando Docker Compose (ex: db_container)
DB_USER=seuUsuarioPostgres
DB_PASS=suaSenhaPostgres
DB_NAME=seuBancoDeDados
DB_PORT=5432 # Porta padrão do PostgreSQL

# Configurações do MongoDB (se aplicável, para o Docker Compose)
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password
