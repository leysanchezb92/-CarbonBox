# Procesador asíncrono de documentos CSV

Prueba técnica Full Stack. Un usuario sube un archivo CSV desde una página web; el backend lo recibe y responde de inmediato; un worker lo procesa en segundo plano (revisa cada fila y guarda los datos válidos) y la pantalla muestra el estado actualizándose sola cada 3 segundos.

## Cómo funciona

```
Navegador (Next.js :3000)
   │  1. sube el CSV
   ▼
API (Fastify :3001) ──► guarda el archivo (storage/uploads)
   │                ──► crea el upload en PostgreSQL con estado PENDING
   │                ──► deja un mensaje en la cola (storage/queue)
   │  2. responde al instante con el id
   ▼
Worker (proceso aparte) ── lee la cola cada 3 s
   │  3. lee el CSV, valida fila por fila
   │  4. guarda las filas válidas en PostgreSQL
   │  5. marca el upload COMPLETED o FAILED
   ▼
Navegador ── 6. pregunta cada 3 s (polling) hasta que el estado es final y muestra los datos
```

Estados de un upload: `PENDING` → `PROCESSING` → `COMPLETED` o `FAILED`. El estado solo puede avanzar en ese orden.

## Requisitos previos

- Node.js 20 o superior (desarrollado y probado con Node 24)
- npm
- Docker Desktop (con `docker compose`)
- Git

## Instalación y ejecución

Se usan 4 terminales. Todos los comandos parten de la raíz del proyecto.

**1. Base de datos (PostgreSQL en Docker)**

```bash
docker compose up -d
docker compose ps        # debe mostrar postgres en estado "running"
```

**2. Backend: API (terminal 1)**

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev              # API en http://localhost:3001
```

**3. Backend: worker (terminal 2)**

```bash
cd backend
npm run worker           # debe decir: [worker] Esperando mensajes...
```

**4. Frontend (terminal 3)**

```bash
cd frontend
npm install
npm run dev              # web en http://localhost:3000
```

Variables opcionales: el backend lee `PORT`, `FRONTEND_ORIGIN`, `STORAGE_DIR` y `MAX_FILE_SIZE_MB` (ver `backend/.env.example`); el frontend lee `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3001`).

## Cómo probarlo

1. Abre http://localhost:3000. El **Dashboard** muestra los contadores.
2. Entra a **Subir CSV** y elige `sample-data.csv` (50 filas válidas, está en la raíz). Verás la barra de progreso y te llevará al detalle.
3. En el detalle, el estado pasa de **Pendiente** a **Procesando** y **Completado** sin recargar la página (se actualiza cada 3 segundos). Al completarse aparece la tabla con los 50 registros.
4. Prueba `docs/sample-data-con-errores.csv`: queda **Completado** con 3 filas procesadas y 5 con errores (monto negativo, texto en vez de número, fecha inexistente, fila incompleta y categoría vacía). En la terminal del worker se ve la línea de cada error.
5. Prueba un archivo que no sea `.csv`: la pantalla lo rechaza antes de subirlo. Un CSV sin las columnas obligatorias termina en **Fallido** con un mensaje claro.
6. En **Uploads** está la lista paginada (10 por página) con etiquetas de color por estado.

También se puede probar solo la API:

```bash
curl -F "file=@sample-data.csv" http://localhost:3001/api/v1/uploads
curl "http://localhost:3001/api/v1/uploads?page=1&limit=10"
curl http://localhost:3001/api/v1/uploads/<id>
curl http://localhost:3001/api/v1/uploads/<id>/results
```

## API

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/uploads` | Sube un CSV (`multipart/form-data`, campo `file`). Responde `201` con el upload en `PENDING` |
| `GET` | `/api/v1/uploads?page=1&limit=10` | Lista paginada: `{ data, total, page, limit }` |
| `GET` | `/api/v1/uploads/:id` | Estado del upload: filas totales, procesadas y con error, mensaje de error |
| `GET` | `/api/v1/uploads/:id/results` | Datos procesados: `{ data: [{ category, amount, unit, date }] }` |
| `GET` | `/health` | Comprobación de que el servidor está vivo |

Los errores tienen la forma `{ "error": "CODIGO", "message": "texto" }` con el código HTTP adecuado: `400` datos inválidos, `404` no existe, `409` cambio de estado no permitido, `413` archivo demasiado grande (límite 10 MB), `500` fallo interno.

Reglas de validación de cada fila: `category` y `unit` no vacíos; `amount` número positivo; `date` fecha real con formato `YYYY-MM-DD`.

## Arquitectura

Un solo **bounded context**, `document-processing`, organizado en capas con la regla de dependencias de Clean Architecture: cada capa solo conoce a las de más adentro.

| Capa | Carpeta (en `backend/src/document-processing`) | Contenido |
|---|---|---|
| Dominio | `domain/` | Entidades `Upload` (aggregate root) y `ActivityData`; value objects `FileName` y `UploadStatus`; interfaces de repositorio; errores de negocio. No depende de ninguna librería externa |
| Aplicación | `application/` | Casos de uso con **CQRS**: comandos `CreateUpload` y `ProcessFile`; consultas `GetUploadById`, `ListUploads` y `GetUploadResults`; servicios de lectura y validación del CSV; puertos (`IFileStorage`, `IMessagePublisher`, `IMessageConsumer`) |
| Infraestructura | `infrastructure/` | Prisma (repositorios y mappers), almacenamiento local, cola simulada, cableado de dependencias |
| Presentación | `presentation/` | Controladores y rutas de Fastify |

Fuera del contexto: `shared/` (patrón `Either`, errores base, manejador central de errores HTTP) y `workers/` (el worker de procesamiento).

Patrones usados:

- **Either** (`Left` error / `Right` éxito): los casos de uso devuelven el resultado o el error como valor, sin lanzar excepciones para errores de negocio. El `errorHandler` central traduce cada error a su código HTTP.
- **Value objects** con constructor privado: un `FileName` o un `UploadStatus` inválido no puede existir.
- **Repository + Mapper**: el dominio no conoce Prisma; los mappers traducen entre filas de base de datos y entidades.
- **CQRS**: los comandos cambian el estado; las consultas solo leen.
- **Inyección de dependencias manual** en `DocumentProcessingModule` (API) y `worker.ts` (worker).

El diagrama de cómo se desplegaría en AWS está en [`docs/arquitectura-aws.md`](docs/arquitectura-aws.md).

## Decisiones técnicas

| Decisión | Por qué | Trade-off |
|---|---|---|
| **Fastify** | Ligero, rápido y con buen soporte de TypeScript y de subida de archivos | Menos conocido que Express |
| **Prisma 6 fijado** | Todos los ejemplos del enunciado encajan sin cambios | No usa la última versión mayor |
| **Cola simulada con archivos** (`storage/queue`) | El worker es un proceso aparte y no puede leer la memoria de la API; una carpeta lo resuelve sin infraestructura extra. El enunciado permite un mock | Sin reintentos, sin varios workers a la vez. Con más tiempo: SQS con LocalStack |
| **Almacenamiento en disco local** | Simple y suficiente para la prueba | En producción sería S3 (el puerto `IFileStorage` permite cambiarlo sin tocar los casos de uso) |
| **Fila inválida no tumba el archivo** | Se guardan las válidas y se cuenta cuántas fallaron (`COMPLETED` con `failedRows`). Queda `FAILED` solo si el encabezado es incorrecto, el archivo está vacío o ninguna fila es válida | Los errores por fila se muestran en el log del worker, no en la pantalla |
| **Solo se procesa un upload `PENDING`** | Si el mismo mensaje llega dos veces no se duplican datos | |
| **Lector de CSV propio** | Entiende comillas, saltos de línea de Windows y BOM, sin dependencia extra | Carga el archivo completo en memoria |
| **Inyección de dependencias manual** en lugar de un contenedor (Awilix) | Menos magia y más fácil de seguir | Más código de cableado al crecer |
| **Polling cada 3 s con React Query** (`refetchInterval`) | Simple y es lo que pide el enunciado; se detiene solo cuando el upload termina | Websockets serían más inmediatos |
| **`XMLHttpRequest` para subir** | Permite medir el progreso real de la subida (`fetch` no lo permite) | |
| **`fetch` en lugar de Axios** | Una dependencia menos | |
| **Next.js 16 con Tailwind 4** | Es lo que genera hoy `create-next-app`; Tailwind 4 ya no usa `tailwind.config.ts` | Difiere del árbol de archivos del enunciado |
| **Los puertos viven en `application/`** | Regla de dependencias: la capa de aplicación define lo que necesita | El enunciado ubica `IMessagePublisher` en `shared/infrastructure` |

## Limitaciones conocidas

- **Sin transacción** entre guardar las filas y marcar el upload como `COMPLETED`. Si el proceso se cae justo en medio, el upload puede quedarse en `PROCESSING`.
- **Cola simulada pensada para un solo worker**; sin reintentos con espera creciente. Los mensajes ilegibles o los fallos inesperados se apartan en `storage/queue-dead-letter` (una DLQ básica).
- **Si falla la publicación del mensaje** después de guardar el upload, este se queda en `PENDING` (solución profesional: patrón *outbox*).
- **Sin autenticación**: todos los uploads pertenecen a un usuario fijo.
- **Sin tests automatizados en el repositorio.** El código se verificó con compilación estricta de TypeScript y pruebas manuales; ver `USO-DE-IA.md`.
- El archivo se lee completo en memoria: no está pensado para CSV de cientos de MB.
- Los contadores del Dashboard consideran los 100 uploads más recientes.
- `docker-compose.yaml` solo levanta PostgreSQL (no LocalStack).

## Qué haría con más tiempo

SQS y S3 reales con LocalStack; reintentos con espera creciente; patrón outbox; tests unitarios y de integración; autenticación; mostrar los errores por fila en la pantalla; y métricas del worker.

## Estructura del repositorio

```
├── backend/
│   ├── prisma/                   # schema.prisma y migraciones
│   └── src/
│       ├── document-processing/  # domain, application, infrastructure, presentation
│       ├── shared/               # Either, errores base, manejo de errores HTTP
│       ├── workers/              # FileProcessingWorker
│       ├── app.ts, server.ts     # API
│       └── worker.ts             # proceso del worker
├── frontend/                     # Next.js (App Router, React Query, Tailwind)
├── docs/
│   ├── arquitectura-aws.md       # diagrama AWS (Mermaid)
│   └── sample-data-con-errores.csv
├── docker-compose.yaml
├── sample-data.csv               # 50 filas válidas de ejemplo
├── README.md
└── USO-DE-IA.md
```
