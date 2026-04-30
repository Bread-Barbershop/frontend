import { TemplateManifest } from './types';

const TEMPLATE_MANIFEST_URL = '/templates/manifest.json';

/**
 * 템플릿 목록(manifest)을 가져옵니다.
 */
export const getTemplateManifest = async (): Promise<TemplateManifest> => {
  const response = await fetch(TEMPLATE_MANIFEST_URL);

  if (!response.ok) {
    throw new Error('템플릿 목록을 불러오지 못했습니다.');
  }

  return response.json();
};

/**
 * 특정 템플릿의 JSON 데이터를 가져옵니다.
 * @param jsonUrl 템플릿 JSON 파일의 경로 (예: /templates/json/sample.v1.json)
 */
export const getTemplateJson = async (jsonUrl: string) => {
  const response = await fetch(jsonUrl);

  if (!response.ok) {
    throw new Error('템플릿 JSON을 불러오지 못했습니다.');
  }

  return response.json();
};
