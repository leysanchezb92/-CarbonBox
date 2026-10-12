import { IActivityDataRepository } from '../../domain/repositories/IActivityDataRepository';
import { IUploadRepository } from '../../domain/repositories/IUploadRepository';
import { CreateUploadCommandHandler } from '../../application/commands/handlers/CreateUploadCommandHandler';
import { GetUploadByIdQueryHandler } from '../../application/queries/handlers/GetUploadByIdQueryHandler';
import { GetUploadResultsQueryHandler } from '../../application/queries/handlers/GetUploadResultsQueryHandler';
import { ListUploadsQueryHandler } from '../../application/queries/handlers/ListUploadsQueryHandler';
import { CreateUploadController } from '../../presentation/controllers/CreateUploadController';
import { GetUploadByIdController } from '../../presentation/controllers/GetUploadByIdController';
import { GetUploadResultsController } from '../../presentation/controllers/GetUploadResultsController';
import { ListUploadsController } from '../../presentation/controllers/ListUploadsController';
import { LocalFileStorage } from '../storage/LocalFileStorage';
import { MockMessagePublisher } from '../messaging/MockMessagePublisher';

export interface DocumentProcessingModuleDeps {
  uploadRepository: IUploadRepository;
  activityDataRepository: IActivityDataRepository;
  storageDir: string;
  defaultUserId: string;
}

/**
 * "Cableado" manual (inyección de dependencias): aquí, y solo aquí, se decide
 * qué ayudante concreto recibe cada mesero.
 */
export class DocumentProcessingModule {
  readonly createUploadController: CreateUploadController;
  readonly getUploadByIdController: GetUploadByIdController;
  readonly listUploadsController: ListUploadsController;
  readonly getUploadResultsController: GetUploadResultsController;

  constructor(deps: DocumentProcessingModuleDeps) {
    const fileStorage = new LocalFileStorage(deps.storageDir);
    const messagePublisher = new MockMessagePublisher(deps.storageDir);

    const createUploadHandler = new CreateUploadCommandHandler(
      deps.uploadRepository,
      fileStorage,
      messagePublisher,
    );
    const getUploadByIdHandler = new GetUploadByIdQueryHandler(deps.uploadRepository);
    const listUploadsHandler = new ListUploadsQueryHandler(deps.uploadRepository);
    const getUploadResultsHandler = new GetUploadResultsQueryHandler(
      deps.uploadRepository,
      deps.activityDataRepository,
    );

    this.createUploadController = new CreateUploadController(createUploadHandler, deps.defaultUserId);
    this.getUploadByIdController = new GetUploadByIdController(getUploadByIdHandler);
    this.listUploadsController = new ListUploadsController(listUploadsHandler);
    this.getUploadResultsController = new GetUploadResultsController(getUploadResultsHandler);
  }
}
