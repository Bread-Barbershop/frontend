import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

export function getCalendarMessageHtml({
  type,
  props,
}: EditorBlock<'calendar'>) {
  if (props.messageHtml) return props.messageHtml;
  if (props.messageJson) return tiptapJsonToHtmlUniversal(props.messageJson);

  return (
    props.messageHtml ??
    (type === 'wedding'
      ? '<p style="text-align: center;">신랑과 신부의 특별한 약속이 이루어지기까지<br>(D-Day)일이 남았습니다.</p>'
      : '<p style="text-align: center;">(D-Day)일 남았습니다.</p>')
  );
}
