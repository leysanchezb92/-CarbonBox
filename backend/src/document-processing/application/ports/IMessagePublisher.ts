export interface FileUploadedMessage {
  uploadId: string;
  fileUrl: string;
}

export interface IMessagePublisher {
  publish(message: FileUploadedMessage): Promise<void>;
}
