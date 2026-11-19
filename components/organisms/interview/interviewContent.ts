import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';

import {
  DEFAULT_INTERVIEW_QUESTION,
  type InterviewQuestion,
} from './interviewList';

// 이전 편집기가 '빈 항목 추가'에서 저장한 답변 전체와 대조한다.
const legacyAnswerText =
  '신랑\n"내용을 입력해 주세요"\n신부\n"내용을 입력해 주세요"';

function answerText(html: string) {
  return html
    .replace(/<\/p>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:nbsp|#160|#xa0);/gi, ' ')
    .replace(/&(?:quot|#34|#x22);/gi, '"')
    .trim()
    .replace(/\n+/g, '\n');
}

export function getInterviewAnswerHtml(answer?: InterviewQuestion['answer']) {
  let html =
    answer?.messageHtml ?? tiptapJsonToHtmlUniversal(answer?.messageJson);
  let text = answerText(html);
  if (
    text === legacyAnswerText &&
    answer?.messageHtml &&
    answer.messageJson &&
    !isLegacyInterviewAnswer(answer.messageJson)
  ) {
    // 오래된 HTML 스냅샷과 달리 편집 원본에 실제 답변이 있을 수 있다.
    html = tiptapJsonToHtmlUniversal(answer.messageJson);
    text = answerText(html);
  }
  return text && text !== legacyAnswerText ? html : '';
}

export function getInterviewTitle(title?: string) {
  return title === DEFAULT_INTERVIEW_QUESTION ? '' : (title ?? '');
}

export function getInterviewCard(question: InterviewQuestion) {
  const title = getInterviewTitle(question.question);
  const answerHtml = getInterviewAnswerHtml(question.answer);
  if (!title.trim() && !answerHtml && !question.image?.[0]) return null;
  return { ...question, question: title, answerHtml };
}

export function isLegacyInterviewAnswer(
  json: InterviewQuestion['answer']['messageJson']
) {
  const paragraphs = json?.content;
  if (paragraphs?.length !== 5) return false;
  const lines = paragraphs.map(
    paragraph => paragraph.content?.map(node => node.text ?? '').join('') ?? ''
  );
  return lines.filter(Boolean).join('\n') === legacyAnswerText;
}
