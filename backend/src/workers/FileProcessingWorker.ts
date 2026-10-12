import { IMessageConsumer, QueueMessage } from '../document-processing/application/ports/IMessageConsumer';
import { ProcessFileCommandHandler } from '../document-processing/application/commands/handlers/ProcessFileCommandHandler';
import { ProcessFileCommand } from '../document-processing/application/commands/objects/ProcessFileCommand';

type WorkerLogger = Pick<Console, 'log' | 'warn' | 'error'>;

const MAX_ROW_ERRORS_LOGGED = 5;

export class FileProcessingWorker {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly consumer: IMessageConsumer,
    private readonly processFileHandler: ProcessFileCommandHandler,
    private readonly pollIntervalMs: number,
    private readonly logger: WorkerLogger,
  ) {}

  start(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollIntervalMs);
    void this.tick();
  }

  async stop(): Promise<void> {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    while (this.running) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      let message = await this.consumer.poll();
      while (message !== null) {
        await this.handleMessage(message);
        message = await this.consumer.poll();
      }
    } catch (error) {
      this.logger.error('[worker] Error al leer la cola:', error);
    } finally {
      this.running = false;
    }
  }

  private async handleMessage(message: QueueMessage): Promise<void> {
    try {
      const result = await this.processFileHandler.execute(new ProcessFileCommand(message.body.uploadId));

      if (result.isLeft()) {
        this.logger.warn(`[worker] Mensaje ${message.id} descartado: ${result.value.message}`);
      } else {
        const summary = result.value;
        this.logger.log(
          `[worker] Upload ${summary.uploadId}: ${summary.status} ` +
            `(${summary.processedRows}/${summary.totalRows} filas válidas, ${summary.failedRows} inválidas)` +
            (summary.message ? ` - ${summary.message}` : ''),
        );
        for (const rowError of summary.rowErrors.slice(0, MAX_ROW_ERRORS_LOGGED)) {
          this.logger.warn(`[worker]   línea ${rowError.line}: ${rowError.message}`);
        }
        const hidden = summary.rowErrors.length - MAX_ROW_ERRORS_LOGGED;
        if (hidden > 0) {
          this.logger.warn(`[worker]   ... y ${hidden} errores más`);
        }
      }
      await this.consumer.acknowledge(message.id);
    } catch (error) {
      this.logger.error(`[worker] Fallo inesperado con el mensaje ${message.id}; pasa a la cola de fallidos:`, error);
      await this.consumer.reject(message.id);
    }
  }
}
