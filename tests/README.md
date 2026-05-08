# Testing QA Docente

Infraestructura de testing para el flujo real docente:

- `tests/e2e`: flujo web real con Playwright.
- `tests/api`: validación de endpoints críticos usando Playwright API.
- `tests/unit`: lógica pura con Vitest.
- `tests/fixtures/excel`: archivos de carga válidos e inválidos.
- `tests/fixtures/data`: payloads y catálogos reutilizables.
- `tests/support`: helpers compartidos.

## Variables de entorno

### E2E / UI

- `E2E_BASE_URL`: URL web del frontend. Default `http://127.0.0.1:9000`
- `E2E_DOCENTE_USERNAME`
- `E2E_DOCENTE_PASSWORD`
- `E2E_DOCENTE_ASIGNATURA`
- `E2E_DOCENTE_GRUPO`

### API

- `API_BASE_URL`: URL del backend API. Default `http://127.0.0.1:8000/api`
- `API_DOCENTE_USERNAME`
- `API_DOCENTE_PASSWORD`
- `API_DOCENTE_ASIGNATURA_ID`
- `API_DOCENTE_GRUPO`
- `API_DOCENTE_PARCIAL`: default `2P`
- `API_DOCENTE_SEDE_ID`

## Scripts

- `npm run test:fixtures`: regenera los Excel versionados.
- `npm run test:unit`: corre lógica pura con Vitest.
- `npm run test:api`: corre contratos y validaciones API.
- `npm run test:e2e:smoke`: smoke docente.
- `npm run test:e2e`: suite E2E completa.
