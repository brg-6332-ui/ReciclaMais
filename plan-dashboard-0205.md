# Plano Técnico de Implementação

## Feature: Nova Reciclagem / Atividade

Este documento define **escopo, requisitos, contratos e decisões técnicas** para que um LLM implemente corretamente a feature **Nova Reciclagem / Atividade** no projeto Recicla+.

O foco é **implementação prática**, sem contexto acadêmico ou explicações conceituais.

---

## 1. Objetivo da Feature

Permitir que um utilizador autenticado **crie uma nova atividade de reciclagem**, persistindo os dados no banco (Supabase) e atualizando o Dashboard do Utilizador.

---

## 2. Escopo (hard boundaries)

### Incluído

* Criar nova atividade de reciclagem
* Persistir atividade no banco de dados
* Atualizar estatísticas e histórico no dashboard após criação
* Validações client-side e server-side
* Funcionar apenas para utilizador autenticado

### Explicitamente fora do escopo

* Edição ou exclusão de atividades
* Upload de imagens
* Offline-first
* Realtime entre múltiplos dispositivos
* Recompensas financeiras reais
* Painel administrativo

---

## 3. Entry Point da Feature

* Botão no Dashboard:

  * Label: **"Adicionar Reciclagem"**
  * Ação: `openActivityAddModal({ onSuccess })`

---

## 4. UX / Layout – Modal Nova Reciclagem

### Estrutura do Modal

```
Título: Nova Reciclagem

[Select] Tipo de Material *
[Input] Quantidade (kg) *
[Datetime] Data e Hora *
[Select / Input] Local de Entrega (opcional)
[Readonly] Recompensa Estimada
[Textarea] Observações (opcional)

[Cancelar] [Confirmar Reciclagem]
```

### Estados do Modal

* idle
* submitting
* success (toast + fechar modal)
* error (mensagem + retry)

---

## 5. Requisitos Funcionais dos Campos

### Tipo de Material

* Obrigatório
* Fonte: tabela `waste_types` / `materials`
* Valor enviado: `material` (string key, ex: `plastic`)
* Não permitir valores livres

### Quantidade

* Input em **kg**
* `step=0.01`
* Converter para gramas antes do envio
* Conversão: `grams = Math.round(kg * 1000)`
* Validações:

  * `> 0`
  * `< 50000` kg

### Data e Hora

* Default: `now()`
* Não permitir data futura (> now + 5 min)
* Enviar como ISO string

### Local de Entrega

* Opcional
* Se selecionado:

  * Enviar `collection_point_id`
* Se texto livre:

  * Usar apenas para UI (não persistir obrigatoriamente)

### Recompensa

* Apenas informativa no frontend
* **Nunca confiar no valor enviado pelo cliente**
* Backend recalcula sempre

---

## 6. Contrato da API

### Endpoint

```
POST /api/dashboard/activities
```

### Payload

```ts
{
  material: string;        // ex: 'plastic'
  grams: number;           // inteiro
  occurred_at: string;     // ISO
  collection_point_id?: string;
}
```

### Regras

* `user_id` deve ser extraído do contexto de autenticação
* Nunca aceitar `user_id` do cliente

---

## 7. Resposta da API

```ts
{
  activity: {
    id: number;
    material: string;
    grams: number;
    reward: number;
    occurred_at: string;
    collection_point_name?: string;
  };
}
```

---

## 8. Fluxo Técnico End-to-End

### Frontend

1. Dashboard carrega dados via `useDashboard()`
2. Utilizador abre `ActivityAddModal`
3. Modal valida dados client-side
4. Modal chama `useAddActivity().execute(payload)`
5. Em sucesso:

   * Fecha modal
   * Dispara `useDashboard().reFetch()`

### Backend

1. Extrair utilizador autenticado
2. Validar payload
3. Normalizar dados
4. Calcular recompensa
5. Inserir atividade no banco
6. Retornar atividade criada

---

## 9. Banco de Dados – Inserção Mínima

Tabela `activities`:

```sql
INSERT INTO activities (
  user_id,
  material,
  grams,
  reward,
  occurred_at,
  collection_point_id
)
```

---

## 10. Estratégia de Atualização do Dashboard

* **Re-fetch completo do dashboard após sucesso**
* Não usar optimistic update nesta feature
* Evitar drift de estatísticas

---

## 11. Estrutura de Arquivos Esperada

```
src/modules/activity/
  application/
    useAddActivity.ts
  ui/
    ActivityAddModal.tsx

src/modules/dashboard/
  hooks/
    useDashboard.ts
  ui/
    DashboardPage.tsx
```

---

## 12. Decisões Técnicas Importantes

* Recompensa calculada apenas no backend
* CO₂ e agregados calculados via query/view
* Paginação de atividades pode ser adicionada posteriormente
* Segurança garantida via autenticação + RLS

---

## 13. Checklist de Implementação

### Backend

* [ ] Criar endpoint POST `/api/dashboard/activities`
* [ ] Validar payload
* [ ] Inserir atividade no banco
* [ ] Retornar resposta normalizada

### Frontend

* [ ] Implementar `useAddActivity`
* [ ] Conectar modal à API
* [ ] Tratar loading / error / success
* [ ] Re-fetch dashboard após criação

---

## 14. Definition of Done

* Usuário cria nova reciclagem com sucesso
* Dados persistidos no banco
* Dashboard atualizado corretamente
* Nenhum dado mockado envolvido
* Código legível, modular e consistente com o projeto
