# Bellas Fisio - Backend (NestJS)

Este é o backend do sistema Bellas Fisio, desenvolvido com NestJS e Prisma.

## Pré-requisitos

* Node.js (v18+)
* npm
* PostgreSQL (Hostinger ou Local)

## Instalação

1. Clone o repositório.
2. Acesse a pasta `backend`.
3. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração

Crie um arquivo `.env` na raiz da pasta `backend` (ou na raiz do projeto conforme sua estrutura) com as seguintes variáveis:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/BANCO?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
```

## Banco de Dados

Para sincronizar o banco de dados da Hostinger com o schema:

1. Execute as migrações:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Gere o Prisma Client:
   ```bash
   npx prisma generate
   ```

## Scripts Disponíveis

* `npm run start:dev`: Inicia o servidor em modo de desenvolvimento com watch.
* `npm run build`: Gera o build de produção.
* `npm run start:prod`: Inicia o servidor em produção (após o build).
* `npm run lint`: Executa o linter para verificar padrões de código.
* `npm run prisma:generate`: Gera novamente o cliente do Prisma.

## Estrutura de Módulos

* **Auth**: Autenticação via JWT e controle de acesso.
* **Users**: Gestão de usuários do sistema.
* **Clinics**: Cadastro e gestão de unidades/clínicas.
* **Professionals**: Perfil dos profissionais de fisioterapia.
* **Patients**: Prontuário e dados dos pacientes.
* **Appointments**: Agenda e controle de sessões.
* **Medical Records**: Evolução clínica e anexos.
* **Financial**: Fluxo de caixa e pagamentos.
* **Plans**: Convênios e tabela de procedimentos.
