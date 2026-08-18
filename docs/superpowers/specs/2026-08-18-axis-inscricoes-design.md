# Axis Inscrições — Design V1

## Objetivo
Criar uma plataforma reutilizável de inscrições e CRM para cursos, treinamentos e eventos, desacoplada de qualquer landing page específica.

## Arquitetura
- Next.js no Vercel para área pública e administrativa.
- Neon Postgres como fonte principal de dados.
- Eventos configuráveis com slug público, informações, valores, dados bancários e campos de formulário.
- Contatos separados de inscrições para permitir histórico multi-eventos.
- Pagamentos/comprovantes associados às inscrições.
- Captura de origem e UTMs.

## Primeiro evento
O LAP 18 é o primeiro evento configurado e replica os campos do Jotform de referência: nome, empresa, cargo, telefone, expectativa, origem, acessibilidade, restrições alimentares, comprovante e aceite dos termos.
