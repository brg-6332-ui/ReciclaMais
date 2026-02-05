# Plano de Implementação: Dashboard do Usuário (plan-dashboard-0205)

Data: 2026-02-05

Objetivo: substituir dados mockados no `src/routes/dashboard.tsx` por dados reais do banco (Supabase), desenhar o módulo de dashboard completo (DB, tipos, use-cases, API, UI), e fornecer um plano prático de implementação, testes e rollout.

## 1. Pontos de Interesse no código atual

- Arquivo principal do front-end: `src/routes/dashboard.tsx` — contém dados mockados:
  - `userStats` (totalRecycled, totalRewards, co2Saved, recyclingRate)
  - `recentActivities` (lista de atividades com date, type, amount, reward, location)
  - Usa componentes de design-system já existentes: `Avatar`, `Badge`, `Button`, `Card`, `openActivityAddModal` (modal para adicionar atividade)
- Padrões do repo:
  - Supabase client está em `src/shared/infrastructure/supabase/`
  - Tipos gerados para Supabase (se existirem) ficam em `src/shared/infrastructure/supabase/database.types.ts`
  - SolidJS com idioms (signals, hooks, `<For>`, `<Show>`) — não destructurar signals
  - Scripts de verificação: `pnpm run check` (lint + type-check)

## 2. Requisitos funcionais do Dashboard

- Mostrar estatísticas agregadas por usuário:
  - Total reciclado (kg)
  - Recompensas totais (€)
  - CO₂ poupado (kg ou equivalente)
  - Taxa de reciclagem (%)
- Mostrar lista paginada de atividades recentes do usuário (data, tipo de resíduo, quantidade, recompensa, localização)
- Botão para adicionar nova atividade (usa `openActivityAddModal`) — ao criar deve atualizar a dashboard (optimistic update ou re-fetch)
- Edição de perfil (manter comportamento atual)
- Performance: agregações devem ser feitas por query no banco (views ou consultas agregadas) e paginadas
- Segurança: o dashboard exibe apenas dados do usuário autenticado (usar RLS e checks no backend)

## 3. Modelo de Dados e Tabelas propostas (Supabase / Postgres)

Observação: adaptar nomes às convenções do projeto. Sempre criar `created_at`, `updated_at` quando aplicável.

Tabelas principais (nota: a base do projeto já expõe um schema gerado em `src/shared/infrastructure/supabase/database.types.ts`. Veja seção dedicada abaixo para reconciliar):

1) users (já existente provavelmente)
- id (uuid) PK
- email (text)
- full_name (text)
- avatar_url (text)
- joined_at (timestamptz)
- preferences JSONB (opcional)
- created_at, updated_at

2) waste_types / materials
- id (uuid) PK (ou `materials.name` existente no schema atual)
- key / name (text) e.g. 'plastic', 'glass'
- label (text) e.g. 'Plástico'
- co2_factor (numeric) — kg CO₂ saved per kg (opcional: ver nota sobre migrações abaixo)
- unit (text) default 'kg'
- created_at, updated_at

3) collection_points
- id (uuid)
- name (text)
- address (text)
- lat (numeric), lng (numeric)
- external_id (text) opcional
- created_at

4) activities (registro de entrega/recycle)
- id (uuid or number) PK — use o tipo que já existe no banco (no schema atual `id` é number)
- user_id FK -> users.id (string/uuid)
- material / waste_type (string FK to `materials.name` or waste_type_id)
- grams (integer) — a base do schema atual usa `grams`; converta para kg no cálculo (kg = grams / 1000)
- reward (string | null) — atualmente armazenado como string no schema; normalizar em insert/API para formato numérico legível
- location_id -> collectionpoints.id (opcional)
- date (string/timestamptz) — schema atual usa `date` string; preferir armazenar ISO timestamp
- created_at

5) rewards (histórico financeiro / transações) — opcional se `activities.reward` for suficiente
- id (uuid)
- user_id
- activity_id (uuid/number) FK opcional
- amount (numeric)
- source (text) e.g. 'activity_reward'
- status (text) e.g. 'credited','pending'
- created_at

Views e functions úteis (preferir criar views/functions em vez de alterar tabelas quando possível):
- `view_user_dashboard_aggregates(user_id)` — view que agrega total_kg, total_rewards, co2_saved (soma grams/1000 * co2_factor se disponível), recycling_rate (calculated)
- `function calculate_co2_saved(grams, material_name)` — implementa lógica usando um mapping local ou valor em `materials`

Índices (recomendados, mas opcionais):
- activities(user_id, date DESC)
- activities(user_id, material)

RLS (Row-Level Security):
- Ativar RLS em `activities`, `rewards` (quando aplicável)
- Policies: usuários só leem suas `activities` e `rewards`; leitura de `collectionpoints` pública

## 4. Contratos / Types (TypeScript)

Arquivos propostos: `src/modules/dashboard/types.ts` e/ou reuso de `src/shared/infrastructure/supabase/database.types.ts` se gerado.

Exemplos de interfaces:

- DashboardAggregates
  - totalRecycledKg: number
  - totalRewards: number
  - co2SavedKg: number
  - recyclingRatePercent: number

- Activity
  - id: string
  - userId: string
  - wasteType: { id:string, key:string, label:string }
  - amount: number
  - rewardAmount: number
  - occurredAt: string (ISO)
  - collectionPoint?: { id:string, name:string }
  - locationText?: string

- PaginatedActivities { items: Activity[], nextCursor?: string }

## 5. Use-cases (backend) e Endpoints

Use-cases principais:

1) GetUserDashboard(user_id)
- Retorna DashboardAggregates + primeira página de atividades
- Query: usar view `view_user_dashboard_aggregates` + SELECT de `activities` com JOIN em `waste_types` e `collection_points`.
- Considerar cache curto (CDN) e TTL no cliente para evitar chamadas em excesso

2) ListUserActivities(user_id, limit, cursor)
- Paginação baseada em occurred_at desc (cursor = last occurred_at + id)

3) AddActivity(user_id, activityDto)
- Insere em `activities`, calcula reward (ou recebe reward_amount), cria `rewards` se aplicável
- Deve validar campos, aplicar RLS
- Retornar objeto criado e disparar evento para atualizar agregados (webhook / Supabase Realtime)

4) GetCollectionPointsNearby(lat, lng, radius)
- Para mostrar onde usuário entregou (opcional)

API Endpoints propostos (serverless routes / API):
- GET /api/dashboard — retorna aggregates + first page activities (authed)
- GET /api/dashboard/activities?limit=&cursor= — paginação
- POST /api/dashboard/activities — cria nova atividade (body) — protege via auth

Implementação: usar rotas em `src/routes/api/...` (ver padrão do projeto) ou criar serviços em `src/modules/dashboard/application/` seguindo arquitetura do repo (application/domain/infrastructure/ui)

## 6. Integração com Supabase (queries e segurança)

- Reusar `src/shared/infrastructure/supabase/supabase.ts` para queries do frontend.
- Preferir SQL simples e views para agregações (evitar carregar todo o histórico apenas para somar)
- Exemplos de queries:
  - aggregates: SELECT total_kg, total_rewards, co2_saved, recycling_rate FROM view_user_dashboard_aggregates WHERE user_id = :user_id
  - activities: SELECT a.*, wt.key, wt.label, cp.name AS collection_point_name FROM activities a JOIN waste_types wt ON a.waste_type_id=wt.id LEFT JOIN collection_points cp ON a.collection_point_id=cp.id WHERE a.user_id = :user_id ORDER BY occurred_at DESC LIMIT :limit
- RLS: criar policy `allow_select_own` ON activities FOR SELECT USING (auth.uid() = user_id)
- Role: No client (browser) continuar usando anon key + RLS; para operações sensíveis (como gerar relatórios agregados que envolvam múltiplos usuários) usar funções server-side com service_role

## 7. Frontend: Módulo, Hooks e Componentes

Estrutura proposta no `src/modules/dashboard/`:

- application/
  - dashboardActions.ts (calls to API)
  - store/ (se necessário para estado local/global)
- domain/
  - types.ts
- hooks/
  - useDashboard.ts — carrega aggregates + atividades iniciais, expõe reFetch, loading, error
  - useActivitiesPagination.ts — paginação para lista de atividades
- ui/sections/
  - DashboardPage.tsx (container, substituir `src/routes/dashboard.tsx` ou refatorar a rota para importar este componente)
  - DashboardHeader.tsx
  - StatsGrid.tsx
  - RecentActivitiesList.tsx
  - ActivityCard.tsx

### Modal: Nova Atividade (UX, dados e integração)

O projeto já expõe `openActivityAddModal` usado no `src/routes/dashboard.tsx`. A seguir detalhes de como o modal "Adicionar Reciclagem" deve funcionar, quais campos, validações, UX e integração com o backend.

1) Propósito
- Permitir ao usuário registar uma nova entrega/atuação de reciclagem, associada ao seu `user_id` e opcionalmente a um `collectionpoint`.

2) Campos do formulário (ordem e tipos)
- Tipo de Material (select) — valores vindos de `materials` (`materials.name` / label) com label localizável. Necessário suportar valores custom quando offline.
- Quantidade (number) — entrada em kg com step 0.01 e um campo secundário oculto que converte para `grams` (DB expects grams). Alternativamente permitir entrada direta em gramas.
- Data / Hora (datetime-local) — default: agora. Enviar como ISO string para coluna `date`.
- Local de Entrega (select/autocomplete) — opcional: buscar `collectionpoints` próximos via API ou permitir entrada de texto livre. Seleção populates `location_id`.
- Recompensa (read-only / calculada) — opcionalmente mostrar recompensa calculada pela aplicação; não confiar no valor vindo do cliente para armazenamento final.
- Observações (textarea) — opcional, salva apenas como metadata no frontend ou, se necessário, em uma coluna adicional.

3) Validações (cliente + servidor)
- Material: obrigatório
- Quantidade: obrigatório, > 0, máximo plausível (ex.: < 50000 kg)
- Data: não pode ser no futuro (ou permitir com aviso)
- Location: se fornecido, validar que o `collectionpoint` existe (server-side)

4) UX e acessibilidade
- Modal deve usar componentes `Modal.tsx` já presentes (`src/modules/modal/components/Modal.tsx`) e seguir padrões de acessibilidade (focus trap, labels, aria-*).
- Mostrar estados: loading (enviando), success (confirmação + fechar modal), error (mensagem clara com retry)
- Confirm dialog secundário se a quantidade for muito alta.

5) Submissão e integrações
- On submit, call API `POST /api/dashboard/activities` with normalized payload:
  {
    material: string,
    grams: number,
    date: ISOString,
    location_id?: string,
    reward_calculated?: number (optional, for UI only)
  }
- API deve validate and normalize (parse reward strings, enforce user_id from auth context) and return created activity item.
- Após sucesso: close modal and trigger dashboard refresh. Two strategies:
  - Re-fetch aggregates + first page (simple)
  - Optimistic update: inject new activity at the top of local activities list and update aggregates client-side (safer to re-fetch aggregates to avoid drift)

6) Error handling and retries
- Display field-level errors returned by API (e.g., invalid material)
- Retry button in modal for transient failures

7) Tests
- Unit tests for modal component (render, validation, submit payload)
- Integration test to simulate creating an activity and asserting the dashboard updates (use mocked supabase client or test API)

8) Telemetry / Observability
- Log submission errors to console and to global error tracker if present (Sentry) with context (user_id, material, grams)

9) Security
- Do not trust client-provided `user_id`; server should use the authenticated user from Supabase JWT.
- Sanitize free-text fields before storing or returning.

10) Implementation notes (practical)
- File: `src/modules/activity/ui/ActivityAddModal.tsx` already exists — extend it to call the new API and to accept a success callback that triggers a dashboard re-fetch.
- Hook: create `useAddActivity` in `src/modules/activity/application/` that wraps the POST call and returns { execute, loading, error }
- The `openActivityAddModal` utility should accept an options object to pass a `onSuccess` callback so `DashboardPage` can refresh on success.

### Wireframe integrado (formulário)

O modal deve seguir o wireframe abaixo — use como fonte de verdade para ordem dos campos, estados e botões:

[Modal Title] Nova Reciclagem

[Select] Tipo de material *
[Input] Quantidade (kg) *
[Datetime] Data e hora *
[Select / Input] Local de entrega (opcional)
[Readonly] Recompensa estimada
[Textarea] Observações (opcional)

[Cancel] [Confirmar Reciclagem]

Detalhes de implementação do wireframe:

- Título: "Nova Reciclagem" — visível no Header do modal e usado no aria-labelledby.
- Campo `Tipo de material` (select): obrigatório. Options carregadas de `materials` via `GET /api/materials` (ou usar `src/shared/infrastructure/supabase` para listar). Deve suportar busca/filtragem no select e opção "Outro" que abre um input para texto livre.
- Campo `Quantidade (kg)` (number): obrigatório. Mostrar placeholder "Ex.: 1.50". Internamente converter para `grams` ao submeter: grams = Math.round(kg * 1000). Aceitar step 0.01.
- Campo `Data e hora` (datetime-local): obrigatório, default `new Date().toISOString()`. Apresentar em local timezone; enviar ISO string.
- Campo `Local de entrega` (select/autocomplete OR input livre): opcional. Se o usuário escolher um `collectionpoint` existente, enviar `location_id`. Se digitar texto livre, enviar `location_text` no payload (ou null para `location_id`). Busca por proximidade pode ser ativada opcionalmente.
- Campo `Recompensa estimada` (readonly): calculado localmente ao preencher material+quantidade usando regras de negócio (ex.: tiered reward, or fixed €/kg per material). Mostrar com símbolo monetário e tooltip explicando que o valor final é determinado server-side.
- Campo `Observações`: optional textarea with max length (e.g., 500 chars).

Botões e comportamento:

- `Cancel`: fecha modal sem ação. If form dirty, show confirm discard dialog.
- `Confirmar Reciclagem`: primary action. Disabled until required fields valid. On click, calls `useAddActivity.execute(payload)`.
- Support Enter to submit when focus not inside textarea, Esc to close modal.

Payload POST (normalized):

{
  material: string,         // required (materials.name or custom string)
  grams: number,           // required (integer)
  date: string,            // ISO timestamp
  location_id?: string,    // optional
  location_text?: string,  // optional if free-text
  notes?: string           // optional
}

Server-side expectations & validation:

- Server ignores any client-provided user_id and uses the authenticated user from Supabase JWT.
- Server validates material exists (unless custom allowed), grams > 0, date parseable and not absurdly future-dated, location_id exists when provided.
- Server computes and stores reward (as string in current schema) and returns normalized `reward` and created `activity` record.

Feedback UX after submit:

- On success: show a small success toast, close modal, and call `onSuccess` callback (if provided) so the dashboard can re-fetch aggregates + activities.
- On failure: show field-level errors where applicable and a global error banner. Provide a retry action that re-sends the same payload.

Accessibility notes:

- Ensure all inputs have labels and aria-describedby for helper/error text.
- Modal must trap focus and return focus to the triggering element on close.
- Buttons must be reachable by keyboard and have discernible text.


Fluxo no front:
- `DashboardPage` usa `useDashboard()` para obter `aggregates` e `activities`.
- Ao abrir `openActivityAddModal`, após sucesso do POST, chamar `reFetch` ou atualizar localmente (optimistic update).
- Manter os componentes pequenos e puros; mover lógica complexa para hooks/usecases.

Atenção para: carregar estados (`loading`, `empty`, `error`) e usar `<Show>`/`<For>` e `createSignal`/`createMemo` adequadamente (seguir instruções do repositório).

## 8. Migrations e Seeds

- Criar arquivos SQL em `supabase/migrations/` (ou usar fluxo do Supabase CLI):
  - 001_create_waste_types.sql (tabela waste_types)
  - 002_create_collection_points.sql
  - 003_create_activities.sql
  - 004_create_rewards.sql
  - 005_create_views_dashboard_aggregates.sql
  - 006_rls_policies.sql
- Seeds:
  - seed_waste_types.sql (inserir tipos comuns: plástico, vidro, papel, metal, orgânico)
  - seed_sample_activities_for_dev.sql (algumas atividades para ambiente de dev)

## 9. Testes e Qualidade

- Unit tests (vitest / jest) para:
  - useDashboard hooks (mock supabase client)
  - use-cases (AddActivity business logic)
- Integration tests:
  - API endpoints `/api/dashboard` usando test db or supabase emulator
- E2E:
  - Fluxo de adicionar atividade e ver dashboard atualizado
- CI:
  - Incluir checks: `pnpm run type-check`, `pnpm run lint`, `pnpm run test` (adicionar comando se necessário)

## 10. Plano de Rollout e Observabilidade

- Feature branch: `feature/dashboard-db` com PR para `main`.
- Rollout:
  1. Implementar schema + migrations + seeds
  2. Implementar endpoints e use-cases
  3. Implementar frontend hooks e substituir mocks
  4. Testes automatizados + revisão de PR
  5. Deploy
- Monitoramento:
  - Logs de erro no frontend (console + Sentry se disponível)
  - Métricas de latência do endpoint `/api/dashboard`
  - Verificar uso de queries (slow queries) e adicionar índices se necessário

## 11. Requisitos de Segurança e Privacidade

- RLS para que usuário só veja suas próprias `activities` e `rewards`.
- Validar inputs em `AddActivity` e evitar injection via SQL (usar query parametrizada / supabase client)
- Nunca devolver dados sensíveis de outros usuários no endpoint `GET /api/dashboard`.

## 12. Aceitação / Critérios de Pronto

- `src/routes/dashboard.tsx` não contém mais dados mockados; consome `useDashboard` para preencher a UI
- As estatísticas exibidas correspondem ao que é retornado pelo banco para o usuário autenticado
- Lista de atividades mostra dados reais (paginados) e o botão "Adicionar Reciclagem" persiste no banco e atualiza a UI
- RLS ativado para `activities` e `rewards`
- Migrations aplicáveis + seeds para ambiente de desenvolvimento
- Testes unitários/integrados cobrindo os principais caminhos

---

## Anexos: Tarefas imediatas (próximos passos técnicos)

1. Gerar migrations SQL listadas em seção 8
2. Criar `src/modules/dashboard/domain/types.ts` e `src/modules/dashboard/hooks/useDashboard.ts`
3. Implementar API lightweight em `src/routes/api/dashboard.ts`
4. Refatorar `src/routes/dashboard.tsx` para usar `DashboardPage`/`useDashboard`
5. Escrever testes básicos para `useDashboard` e endpoint




-- Fim do plano --
