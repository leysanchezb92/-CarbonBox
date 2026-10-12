# Uso de Inteligencia Artificial en esta Prueba

## Herramientas utilizadas

- [ ] Claude Code
- [ ] GitHub Copilot
- [ ] ChatGPT
- [ ] Cursor AI
- [x] Otra: **Claude (Anthropic)**, usado desde la app de chat (no Claude Code)

## Cómo trabajé

Tenía tres días y poca experiencia con este stack, así que le pedí a Claude que me ayudara a construir el proyecto y que **me explicara cada paso y me hiciera preguntas** para ir entendiendo. Claude escribió el código y me lo entregó en scripts que yo copié, ejecuté y verifiqué en mi computador. Yo reportaba los resultados y errores reales, y decidíamos cómo seguir.

## ¿Qué generé con IA?

Prácticamente **todo el código lo generó Claude**; mi trabajo fue ejecutarlo, verificarlo, reportar los problemas reales de mi entorno y decidir el rumbo.

### Backend
- [x] Estructura de carpetas por capas (domain, application, infrastructure, presentation)
- [x] Schema de Prisma (a partir del que da el enunciado) y migración
- [x] Dominio: `Either`, value objects, entidades `Upload` y `ActivityData`
- [x] CQRS: comandos y consultas con sus handlers
- [x] Repositorios y mappers con Prisma
- [x] Servidor Fastify: rutas, controladores y manejo central de errores
- [x] Almacenamiento local y cola simulada con archivos
- [x] Lectura y validación del CSV
- [x] Worker de procesamiento
- [x] Configuración de TypeScript

### Frontend
- [x] Setup de Next.js (el comando lo indicó Claude)
- [x] Páginas y componentes: dashboard, lista, subida y detalle
- [x] Lógica de React Query y polling
- [x] Estilos con Tailwind

### Documentación
- [x] Borrador de README, del diagrama AWS y de este documento (los revisé y ajusté)

## ¿Qué modifiqué o corregí?

Estos son problemas reales que encontramos al ejecutar el código en mi computador:

1. **`docker-compose.yaml` sin puerto publicado:** PostgreSQL arrancaba pero no era accesible desde mi computador (Prisma daba el error `P1000`). Agregué el bloque `ports`.
2. **URL de base de datos de `prisma init`:** generó una URL de una base local propia de Prisma (`prisma+postgres://...`). La reemplacé por la conexión al PostgreSQL de Docker.
3. **`tsconfig.json` por defecto de TypeScript 7:** no servía para el proyecto; lo reemplazamos por una configuración mínima y estricta.
4. **Cliente de Prisma en formato incompatible:** se había generado antes de cambiar el `tsconfig`; hubo que regenerarlo con `npx prisma generate`.
5. **`.gitignore` que ocultaba código:** la línea `storage` ignoraba también la carpeta de código `infrastructure/storage`. Lo descubrimos al revisar `git status` y lo cambié por `/backend/storage`.
6. **Migración modificada sin querer:** `git status` mostró `migration.sql` alterado; revisé el cambio y lo restauré con `git restore`, porque Prisma guarda una huella de las migraciones aplicadas.
7. **Instalaciones en la carpeta equivocada (varias veces):** ejecuté `npm install` en la raíz en vez de en `backend` o `frontend`. Limpié los archivos sobrantes y ahora confirmo la carpeta con `pwd` antes de cada comando.
8. **Decisión de alcance:** elegí la cola simulada y archivos locales en lugar de LocalStack/SQS, y recortamos tests y otros extras por el tiempo disponible.

## ¿Qué aprendí?

1. **La terminal y las carpetas:** cada comando depende de la carpeta donde se ejecuta; `pwd` y `ls` antes de actuar.
2. **Docker:** un contenedor necesita publicar un puerto (`ports`) para ser alcanzable; `P1001` es "no encuentro el servidor" y `P1000` es "lo encontré pero rechazó las credenciales".
3. **Prisma:** `schema.prisma` describe las tablas y `migrate` genera y aplica el cambio; las migraciones aplicadas no se editan.
4. **Capas y puertos:** separar reglas de negocio, casos de uso e infraestructura para poder cambiar una tecnología (disco por S3, cola simulada por SQS) sin tocar la lógica.
5. **`Either` y value objects:** devolver el error como valor y hacer que un dato inválido no pueda existir (constructor privado y `readonly`).
6. **Máquina de estados:** el upload solo avanza en el orden permitido.
7. **HTTP y polling:** códigos `201`, `400`, `404`, `409`, `413`; y cómo `refetchInterval` de React Query repite la consulta mientras el upload no termina y se detiene al terminar.

## Lo que todavía no domino a fondo

Tengo claras las ideas generales y puedo seguir el flujo completo, pero hay temas donde mi comprensión es básica: CQRS más allá de la separación comando/consulta, la inyección de dependencias manual, el funcionamiento interno de React Query, y todo lo de AWS (SQS, ECS, VPC), que conozco a nivel conceptual por el diagrama.

## Limitaciones encontradas con la IA

1. **Ritmo y volumen:** al principio entregó demasiados archivos y términos de golpe; tuve que pedir que fuera más despacio y empezar por lo básico.
2. **Errores propios de la IA:** la regla `storage` del `.gitignore` fue un error suyo que solo apareció al revisar `git status`; y algunas instrucciones de `npm install` fueron ambiguas y me llevaron a instalar en la carpeta equivocada.
3. **No pudo descargar archivos hacia mi computador**, así que cada script lo copié y pegué a mano.
4. **No pudo probar contra mi entorno real:** en su entorno de pruebas no había PostgreSQL ni navegador, así que la conexión real a la base de datos y la pantalla en el navegador solo se comprobaron al ejecutarlas yo.
5. **Versiones nuevas:** TypeScript 7, Next.js 16 y Tailwind 4 difieren de lo que describe el enunciado; se resolvió leyendo la documentación incluida en el propio paquete y compilando para comprobar.

## Cómo validé el código

- Compilación estricta de TypeScript (`npx tsc --noEmit`) en el backend, y `npm run build` en el frontend.
- Pruebas manuales de punta a punta: subir CSV buenos, con filas inválidas y con encabezado incorrecto, y ver el resultado en la base de datos, en la terminal del worker y en el navegador.
- Revisión de `git status` antes de cada commit.
- Durante el desarrollo, la IA también ejecutó pruebas automáticas en su propio entorno (lógica de validación, worker y componentes del frontend). **Esas pruebas no están incluidas en este repositorio.**
