import { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '../../domain/DomainError';

/** Qué código HTTP corresponde a cada error de negocio. */
const STATUS_BY_CODE: Record<string, number> = {
  INVALID_FILE_NAME: 400,
  INVALID_UPLOAD_STATUS: 400,
  EMPTY_FILE: 400,
  INVALID_PAGINATION: 400,
  UPLOAD_NOT_FOUND: 404,
  INVALID_STATUS_TRANSITION: 409,
};

interface ClientHttpError {
  statusCode: number;
  code?: string;
  message: string;
}

function isClientHttpError(error: unknown): error is ClientHttpError {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as Partial<ClientHttpError>;
  return (
    typeof candidate.statusCode === 'number' &&
    candidate.statusCode >= 400 &&
    candidate.statusCode < 500 &&
    typeof candidate.message === 'string'
  );
}

/**
 * Manejador de errores centralizado: es el único lugar que decide
 * qué respuesta HTTP se envía cuando algo sale mal.
 */
export function errorHandler(error: unknown, request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof DomainError) {
    const statusCode = STATUS_BY_CODE[error.code] ?? 400;
    reply.status(statusCode).send({ error: error.code, message: error.message });
    return;
  }

  // Errores del propio servidor web: archivo demasiado grande (413), JSON inválido, etc.
  if (isClientHttpError(error)) {
    reply.status(error.statusCode).send({ error: error.code ?? 'BAD_REQUEST', message: error.message });
    return;
  }

  // Cualquier otra cosa es inesperada: se registra y se responde 500 sin dar detalles.
  request.log.error(error);
  reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
}
