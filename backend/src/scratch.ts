import { FileName } from './document-processing/domain/value-objects/FileName';
import { Upload } from './document-processing/domain/entities/Upload';

const malo = FileName.create('datos.txt');
console.log('1)', malo.isLeft() ? `ERROR: ${malo.value.message}` : 'OK');

const bueno = FileName.create('sample-data.csv');
if (bueno.isLeft()) throw bueno.value;

const upload = Upload.create({ fileName: bueno.value, fileUrl: 'storage/x.csv', userId: 'user-123' });
console.log('2)', upload.status.value);

const saltoInvalido = upload.complete({ totalRows: 1, processedRows: 1, failedRows: 0 });
console.log('3)', saltoInvalido.isLeft() ? `ERROR: ${saltoInvalido.value.message}` : 'OK');

upload.startProcessing();
upload.complete({ totalRows: 50, processedRows: 48, failedRows: 2 });
console.log('4)', upload.status.value, upload.processedRows);
