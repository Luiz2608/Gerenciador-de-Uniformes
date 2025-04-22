Universidade de Rio Verde
Faculdade de Engenharia de Software





Erick Gabriel Alves Barros
Luiz Eduardo
Ycaro Tanimoto




Sistema de Gestão de Uniformes - UniSys






Rio Verde, GO
2025

Introdução
A gestão de uniformes esportivos em instituições pode ser desafiadora quando realizada de forma manual. Com a necessidade de rastrear a distribuição, devolução e disponibilidade dos uniformes de forma eficiente, torna-se essencial a criação de um sistema automatizado que centralize essas informações.
1.1 Objetivo
Criar uma plataforma eficiente para gerenciar o controle e distribuição de uniformes esportivos para atletas, permitindo o rastreamento desde a disponibilidade até a devolução dos uniformes.
1.2 Principais funcionalidades
Gerenciamento de Atletas
Controle de Uniformes
Sistema de Atribuições
Dashboard
1.3 Tecnologias utilizadas
Frontend
Linguagem: TypeScript
Framework: React
Bibliotecas:
React Router para navegação
Lucide React para ícones
Backend
Supabase – Plataforma de Backend as a Service (BaaS)
Edge Functions – Para processamento serverless quando necessário
Storage – Para armazenamento de arquivos (fotos dos atletas)
Autenticação – Sistema de autenticação integrado do Supabase
Banco de Dados
PostgreSQL – Através do Supabase

Justificativa das Tecnologias
1. TypeScript
Tipagem estática para maior segurança
Melhor suporte a IDE e autocomplete
Redução de erros em tempo de desenvolvimento
2. React
Biblioteca madura e bem estabelecida
Grande ecossistema de componentes
Excelente performance com Virtual DOM
Componentização para reuso de código

Backlog do produto
O backlog do sistema UniSys representa a lista priorizada de funcionalidades e requisitos que devem ser implementados para que o sistema atenda às necessidades dos usuários — no caso, os administradores responsáveis pela gestão de uniformes e atletas.
Ele é construído com base em histórias de usuário, organizadas em módulos funcionais como: cadastro de atletas, controle de uniformes, atribuições, devoluções, relatórios e segurança.
Cada item do backlog descreve o que deve ser feito, para quem, e com qual objetivo. Também inclui critérios de aceitação que indicam quando uma funcionalidade está completa e pronta para uso
2.1 Ferramenta de Gestão
A ferramenta de gestão escolhida foi o Trello, segue link:
https://trello.com/invite/b/67f5667b4d4bb0fb46ef0929/ATTI0fab3ccc26e6b31ab1bbd84bdfeda4da154457B4/sistema-de-gestao-de-uniformes

Arquitetura
3.1 Frontend (React)
Tecnologias Principais:
React
TypeScript
Organização:



3.2 Backend (Supabase)
Serviços Fornecidos:
Banco de dados PostgreSQL
Autenticação e autorização
Storage para arquivos
Row Level Security (RLS)
Edge Functions (quando necessário)


3.3 Banco de Dados
Estrutura Principal:
Tabela atletas→ Gestão de atletas
Tabela uniformes→ Controle de uniformes
Tabela atribuições → Atribuições de uniformes



3.4 Fluxo de Dados
Interface do Usuário (UI):
Componentes React renderizam a interface
Formulários capturam dados do usuário
Estado local gerenciado com React Hooks


Lógica de Negócio:
Validação e transformação de dados
Gerenciamento do estado da aplicação


Comunicação com o Backend:
Cliente Supabase realiza operações CRUD


Autenticação e autorização automáticas
Upload e download de arquivos pelo Supabase Storage


Persistência:
PostgreSQL armazena os dados
Políticas RLS controlam o acesso
Triggers garantem integridade e consistência

Precificação
Tempo estimado (horas) para cada funcionalidade
Perfis envolvidos (Front-end, Back-end, QA)
Taxa horária:
Full-stack: R$ 120/h
Front-end: R$ 90/h
Back-end: R$ 90/h
QA: R$ 75/h

Cadastro de Atletas
Tarefas:
Backend (Supabase): 6h × R$ 90 = R$ 540
Frontend (React/TypeScript): 10h × R$ 90 = R$ 900
Testes (QA): 4h × R$ 75 = R$ 300
Total: 20h
 Custo Total: R$ 1.740
Edição de Atletas
Tarefas:
Backend: 4h × R$ 90 = R$ 360
Frontend: 6h × R$ 90 = R$ 540
Testes: 3h × R$ 75 = R$ 225
Total: 13h
 Custo Total: R$ 1.125
Cadastro de Modelos de Uniformes
Tarefas:
Backend: 5h × R$ 90 = R$ 450
Frontend: 8h × R$ 90 = R$ 720
Testes: 4h × R$ 75 = R$ 300
Total: 17h
 Custo Total: R$ 1.470
Controle de Itens de Uniformes
Tarefas:
Backend: 8h × R$ 90 = R$ 720
Frontend: 12h × R$ 90 = R$ 1.080
Testes: 6h × R$ 75 = R$ 450
Total: 26h
 Custo Total: R$ 2.250
Gestão de Status dos Uniformes
Tarefas:
Backend: 6h × R$ 90 = R$ 540
Frontend: 4h × R$ 90 = R$ 360
Testes: 2h × R$ 75 = R$ 150
Total: 12h
 Custo Total: R$ 1.050
Atribuição de Uniformes
Tarefas:
Front-end: 4h × R$ 90 = R$ 360
Back-end: 6h × R$ 90 = R$ 540
QA: 2h × R$ 75 = R$ 150
Full-stack: 3h × R$ 120 = R$ 360
Total: 15h
 Subtotal: R$ 1.410
Registro de Devolução
Tarefas:
Front-end: 5h × R$ 90 = R$ 450
Back-end: 4h × R$ 90 = R$ 360
QA: 3h × R$ 75 = R$ 225
Full-stack: 4h × R$ 120 = R$ 480
Total: 16h
 Subtotal: R$ 1.515
Dashboard De Controle
Tarefas:
Frontend: 6h × R$ 90 = R$ 540
Backend: 6h × R$ 90 = R$ 540
Testes: 3h × R$ 75 = R$ 225
Total: 15h
 Custo Total: R$ 1.305
Filtros Avançados
Tarefas:
Backend: 12h × R$ 100 = R$ 1.200
Frontend: 8h × R$ 100 = R$ 800
Testes: 4h × R$ 100 = R$ 400
Total: 24h
 Custo Total: R$ 2.400
Exportação de Relatórios
Tarefas:
Backend: 10h × R$ 100 = R$ 1.000
Frontend: 6h × R$ 100 = R$ 600
Testes: 4h × R$ 100 = R$ 400
Total: 20h
 Custo Total: R$ 2.000
Confirmação das Ações
Tarefas:
Frontend: 4h × R$ 100 = R$ 400
Backend: 2h × R$ 100 = R$ 200
Testes: 2h × R$ 100 = R$ 200
Total: 8h
 Custo Total: R$ 800
Log de Alterações
Tarefas:
Backend: 8h × R$ 100 = R$ 800
Frontend: 4h × R$ 100 = R$ 400
Testes: 4h × R$ 100 = R$ 400
Total: 16h
 Custo Total: R$ 1.600
Hospedagem e Banco = R$ 750
Ferramentas de Desenvolvimento = R$ 800
Comunicação e Colaboração = R$ 525
Valor total gasto no projeto: 20.740

Análise de Requisitos


