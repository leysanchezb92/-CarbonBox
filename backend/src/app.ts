import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import Fastify, { FastifyInstance } from 'fastify';
import { AppConfig } from './config';
import { DocumentProcessingModule } from './document-processing/infrastructure/dependency-injection/DocumentProcessingModule';
import { registerDocumentProcessingRoutes } from './document-processing/presentation/routes/DocumentProcessingRoutes';
import { errorHandler } from './shared/infrastructure/http/errorHandler';

export interface BuildAppOptions {
  documentProcessing: DocumentProcessingModule;
  config: Pick<AppConfig, 'frontendOrigin' | 'maxFileSizeBytes'>;
  logger?: boolean;
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? true });

  await app.register(cors, { origin: options.config.frontendOrigin });
  await app.register(multipart, {
    limits: { fileSize: options.config.maxFileSizeBytes, files: 1 },
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({ status: 'ok' }));
  registerDocumentProcessingRoutes(app, options.documentProcessing);

  return app;
}
