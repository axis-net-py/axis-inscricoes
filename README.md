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

## Captura de foto para redes sociais

Para um evento que participará da campanha `#euvou`, habilite no banco dois campos em `event_form_fields`, nesta ordem:

- `personal_photo`: campo de upload obrigatório. Aceita JPG, PNG e WEBP até 10 MB; a imagem é armazenada no Vercel Blob como pública e seu endereço fica em `registrations.answers.photoUrl`.
- `social_media_consent`: checkbox obrigatório com o texto da autorização de uso da imagem nas redes sociais.

O consentimento é separado dos termos gerais para deixar explícita a autorização de publicação.

## Primeiro evento
O banco já contém o `lap18`, replicando o formulário Jotform de referência e mantendo 2.300.000 PYG / 350 USD.
