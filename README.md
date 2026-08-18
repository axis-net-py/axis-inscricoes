# Axis Inscrições

Plataforma reutilizável de formulários de inscrição + CRM para treinamentos e cursos.

## V1
- Formulários públicos por slug (`/lap18`, `/outro-evento`)
- Campos configuráveis no banco por evento
- Contatos deduplicados por telefone
- Inscrições, pagamentos/comprovantes e UTMs
- Dashboard administrativo protegido
- Neon Postgres + Vercel Blob

## Variáveis
Copie `.env.example` e configure `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` e `BLOB_READ_WRITE_TOKEN`.

## Primeiro evento
O banco já contém o `lap18`, replicando o formulário Jotform de referência e mantendo 2.300.000 PYG / 350 USD.
