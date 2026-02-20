# Architecture Baseline (DDD Refactor)

## Implemented Bounded Contexts
- `collection-network`
- `identity-access`
- `recycling-activity`

## Canonical API Endpoints
- `GET /api/collection-points`
- `GET /api/recycling-activities`
- `POST /api/recycling-activities`
- `DELETE /api/recycling-activities/:id`
- `GET /api/dashboard-summary`

## Legacy Wrappers Kept for Compatibility
- `GET /api/location` -> delegates to `collection-network`
- `POST /api/dashboard/activities` -> delegates to `recycling-activity`

## Layering Rules Enforced
- Domain layer cannot import framework/infrastructure modules.
- Application layer (new BCs) cannot import infrastructure adapters directly.
- UI layer (new BCs) cannot import domain/infrastructure directly.
- `zod` usage restricted outside BC domain/application/infrastructure/ui for new BCs.

## Migration Notes
- Core UI flows now use canonical endpoints:
  - Collection points/map: `/api/collection-points`
  - Activity creation: `/api/recycling-activities`
  - Dashboard summary/delete: `/api/dashboard-summary`, `/api/recycling-activities/:id`
- `test-gps` was isolated into `src/shared/infrastructure/gps-simulator` and remains functionally unchanged.
