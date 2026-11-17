import { resumableUpload } from './resumableUpload';

export async function uploadFileToDrive(file: File, folderId: string) {
  return resumableUpload(file, folderId);
}
