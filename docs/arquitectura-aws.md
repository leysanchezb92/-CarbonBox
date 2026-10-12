# Arquitectura en AWS (propuesta de despliegue)

Así se desplegaría el sistema en producción. Localmente se simplificó: PostgreSQL en Docker, archivos en disco y una cola simulada con archivos.

```mermaid
flowchart LR
    user([Usuario / Navegador])

    subgraph aws["AWS Cloud"]
        subgraph vpc["VPC"]
            subgraph public["Subnets públicas - 2 zonas de disponibilidad"]
                alb["Application Load Balancer"]
                nat["NAT Gateway"]
            end
            subgraph private["Subnets privadas - 2 zonas de disponibilidad"]
                subgraph ecs["ECS Fargate"]
                    api["API Service<br/>Fastify - 2 o más tasks"]
                    worker["Worker Service<br/>1 o más tasks<br/>auto-scaling por tamaño de cola"]
                end
                rds[("RDS PostgreSQL<br/>Multi-AZ")]
            end
        end
        s3[("S3 Bucket privado<br/>CSV subidos con lifecycle policies")]
        sqs["SQS Queue<br/>archivos subidos"]
        dlq["SQS Dead Letter Queue<br/>mensajes fallidos"]
        secrets["Secrets Manager<br/>credenciales de la base de datos"]
        cw["CloudWatch<br/>logs y métricas"]
    end

    user -->|HTTPS| alb
    alb --> api
    api -->|1 guarda el CSV| s3
    api -->|2 crea el upload en PENDING| rds
    api -->|3 publica el mensaje| sqs
    sqs -->|4 consume| worker
    worker -->|5 lee el CSV| s3
    worker -->|6 guarda datos y estado| rds
    sqs -.->|tras varios reintentos| dlq
    api -.-> secrets
    worker -.-> secrets
    api -.-> cw
    worker -.-> cw
    sqs -.->|mensajes pendientes| cw
    cw -.->|alarma: escalar workers| worker
```

## Componentes

| Componente | Rol | Detalle |
|---|---|---|
| **VPC** | Red aislada | Subnets públicas (solo el balanceador y el NAT) y privadas (aplicación y base de datos), en 2 zonas de disponibilidad |
| **Application Load Balancer** | Entrada de tráfico | En subnets públicas; termina HTTPS y reparte entre las tasks de la API |
| **ECS Fargate - API Service** | Recibe uploads y responde consultas | 2 o más tasks en zonas distintas para alta disponibilidad |
| **ECS Fargate - Worker Service** | Procesa los CSV | 1 o más tasks; el número sube o baja según los mensajes pendientes en SQS |
| **RDS PostgreSQL** | Base de datos | Multi-AZ (réplica en espera en otra zona), en subnets privadas, sin acceso público |
| **S3** | Almacén de los CSV | Bucket privado con cifrado y lifecycle policies (por ejemplo, mover a almacenamiento frío o borrar a los 90 días) |
| **SQS + Dead Letter Queue** | Cola de trabajo | Si un mensaje falla varias veces, pasa a la DLQ para revisarlo sin perderlo |
| **Secrets Manager** | Credenciales | La contraseña de la base de datos se inyecta a las tasks; no vive en el código |
| **CloudWatch** | Observabilidad | Logs de API y worker, métricas y la alarma que escala a los workers |

## Notas de diseño

- **Las tasks están en subnets privadas.** Para llegar a S3 y SQS usan VPC endpoints (o el NAT Gateway), sin exponerse a internet.
- **API y worker son servicios separados** y escalan de forma independiente: la API según tráfico; el worker según el largo de la cola.
- **Permisos mínimos (IAM):** la API puede escribir en S3 y publicar en SQS; el worker puede leer de S3 y consumir de SQS.
- **El frontend** (Next.js) se podría servir desde otro servicio de ECS o desde un hosting estático detrás de CloudFront; queda fuera de este diagrama.
