// A newly picked file has its own identity, even if its name matches an earlier track.
const savedFiles = new WeakMap<File, Map<string, string>>();

export function getSavedAudioFileId(file: File | null, folderId: string) {
  return file ? (savedFiles.get(file)?.get(folderId) ?? null) : null;
}

export function rememberSavedAudioFile(
  file: File,
  folderId: string,
  fileId: string
) {
  const folders = savedFiles.get(file) ?? new Map<string, string>();
  folders.set(folderId, fileId);
  savedFiles.set(file, folders);
}
