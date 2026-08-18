# Axis Inscrições V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar uma V1 reutilizável de formulários de inscrição + CRM multi-eventos.

**Architecture:** Next.js App Router no Vercel, Neon Postgres para dados, Vercel Blob para comprovantes e autenticação administrativa simples por sessão assinada. Eventos definem conteúdo e campos públicos por slug; contatos são deduplicados e inscrições mantêm histórico por evento.

**Tech Stack:** Next.js 16, React 19, Neon Serverless, Vercel Blob, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-18-axis-inscricoes-design.md`

## Global Constraints
- LAP 18 é o primeiro evento.
- O formulário inicial replica o Jotform de referência.
- Valores atuais: 2.300.000 PYG / 350 USD.
- Banco principal: Neon Postgres.
- Cada evento deve ter URL pública própria.

---

### Task 1: Foundation
- [x] Configurar Next.js e aliases.
- [x] Criar estilos base legíveis e responsivos.
- [x] Criar home da plataforma.

### Task 2: Validation and persistence
- [x] Criar validação de inscrições.
- [x] Escrever testes de validação.
- [x] Integrar acesso ao Neon.

### Task 3: Public event form
- [x] Renderizar evento por slug.
- [x] Renderizar campos configuráveis.
- [x] Capturar UTMs e comprovante.
- [x] Criar endpoint de inscrição.

### Task 4: CRM admin
- [x] Criar login e sessão administrativa.
- [x] Criar dashboard com métricas, eventos e inscrições recentes.

### Task 5: Publish
- [x] Publicar branch no GitHub.
- [ ] Executar build completo em ambiente com dependências instaladas.
- [ ] Configurar variáveis no Vercel e publicar preview.
- [ ] Validar inscrição ponta a ponta.
