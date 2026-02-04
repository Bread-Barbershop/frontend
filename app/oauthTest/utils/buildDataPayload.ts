export type UploadedImageId = string;

//실제 에디터에서는 json data가 오브젝트로 들어옴. 따라서 업로드 성공한 이미지 id를 바로 머징한 다음에 json으로 변환해서 업로드 하면됨. 그럼 단순해짐. => 나중에 리팩토링할 것.
export async function buildDataPayload(
  dataInput: object | File,
  uploadedImageIds: UploadedImageId[]
): Promise<unknown> {
  let rawData: unknown = dataInput;

  if (dataInput instanceof File) {
    const text = await dataInput.text();
    if (!text.trim()) {
      rawData = {};
    } else {
      try {
        rawData = JSON.parse(text);
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? `Invalid JSON in data file: ${error.message}`
            : 'Invalid JSON in data file'
        );
      }
    }
  }

  if (uploadedImageIds.length === 0) return rawData;

  if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
    return {
      ...(rawData as Record<string, unknown>),
      imageFileIds: uploadedImageIds,
    };
  }

  return { data: rawData, imageFileIds: uploadedImageIds };
}
