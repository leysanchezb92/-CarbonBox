import { FileUploadedMessage } from './IMessagePublisher';

export interface QueueMessage {
  id: string;
  body: FileUploadedMessage;
}

export interface IMessageConsumer {
  poll(): Promise<QueueMessage | null>;
  acknowledge(messageId: string): Promise<void>;
  reject(messageId: string): Promise<void>;
}
