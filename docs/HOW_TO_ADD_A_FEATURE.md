# How To Add A Feature (DDD Layers)

## 1. Choose the Bounded Context
- Pick one module under `src/modules/<bc>`.
- Do not place business semantics in `shared/`.

## 2. Domain First
- Add or extend `Entity`, `Aggregate`, and `Value Objects` in `domain/`.
- Keep domain code pure: no HTTP, no DB, no framework imports.
- Throw `DomainError` for invariant violations.

## 3. Application Use Case
- Create a focused use case in `application/usecases`.
- Define explicit `Command` and `Result` types.
- Depend only on repository ports/interfaces, never adapters.

## 4. Infrastructure Adapter
- Implement repository adapters in `infrastructure/`.
- Add persistence rows and mappers (`Row <-> Entity`).
- Throw `InfrastructureError` for technical failures.

## 5. Interface/HTTP Layer
- Add request schemas in `interface/http/*schemas.ts`.
- Add mappers (`RequestDTO -> Command`, `Result -> ResponseDTO`).
- Keep controllers thin and map typed errors to HTTP status codes.

## 6. UI Layer
- Consume only API `ResponseDTO`.
- Map `ResponseDTO -> ViewModel` inside `ui/*ui-mapper.ts`.
- Avoid importing `domain` or `infrastructure` in UI files.

## 7. Route Adapter
- Keep route files (`src/routes/api/*`) as thin adapters calling BC controllers.
- Legacy routes should wrap canonical controllers until migration is complete.

## 8. Quality Gates
- Run:
  - `pnpm run type-check`
  - `pnpm run lint`
- Perform smoke checks for impacted routes/flows.

## 9. Naming & Boundary Rules
- Use explicit boundary types:
  - `XRow -> XEntity -> XCommand/XResult -> XRequestDTO/XResponseDTO -> XVM`
- Avoid `any` and unsafe casts outside controlled mapper functions.
