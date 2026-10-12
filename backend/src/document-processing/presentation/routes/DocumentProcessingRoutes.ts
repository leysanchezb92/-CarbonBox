import { FastifyInstance } from 'fastify';
import { DocumentProcessingModule } from '../../infrastructure/dependency-injection/DocumentProcessingModule';

/** Aquí se declara qué direcciones (rutas) existen y quién responde cada una. */
export function registerDocumentProcessingRoutes(
  app: FastifyInstance,
  documentProcessing: DocumentProcessingModule,
): void {
  app.post('/api/v1/uploads', (request, reply) =>
    documentProcessing.createUploadController.handle(request, reply),
  );

  app.get<{ Querystring: { page?: string; limit?: string } }>('/api/v1/uploads', (request, reply) =>
    documentProcessing.listUploadsController.handle(request, reply),
  );

  // Debe registrarse antes de /uploads/:id para que "stats" no se lea como un id.
  app.get('/api/v1/uploads/stats', (request, reply) =>
    documentProcessing.getUploadStatsController.handle(request, reply),
  );

  app.get<{ Params: { id: string } }>('/api/v1/uploads/:id', (request, reply) =>
    documentProcessing.getUploadByIdController.handle(request, reply),
  );

  app.get<{ Params: { id: string } }>('/api/v1/uploads/:id/results', (request, reply) =>
    documentProcessing.getUploadResultsController.handle(request, reply),
  );
}
