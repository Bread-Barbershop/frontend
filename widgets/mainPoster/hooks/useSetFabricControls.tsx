import { FabricObject, Control, controlsUtils, util } from 'fabric';
import { useEffect } from 'react';

import { CORNERS_CONFIG, MOVE_ICON } from '../utils/constants';
import { getRotatedCursorUrl } from '../utils/getRotatedCursorUrl';

export const useSetFabricControls = () => {
  useEffect(() => {
    const img = new Image();
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(MOVE_ICON)));

    const defaultControls = FabricObject.ownDefaults;

    // 스타일 제거
    const newControls: Record<string, Control> = {};

    newControls.center = new Control({
      x: 0,
      y: 0,
      actionName: 'centerAction',
      render: (ctx, left, top, _, fabricObject) => {
        if (!img.complete) return; // 이미지 로드 전에는 그리지 않음

        const size = 24; // 아이콘 출력 크기
        ctx.save();
        ctx.translate(left, top);

        // 객체가 회전할 때 아이콘도 같이 회전시키려면 아래 주석 해제
        ctx.rotate(util.degreesToRadians(fabricObject.angle));

        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      },
    });

    CORNERS_CONFIG.forEach(corner => {
      // 모서리 확대/축소 컨트롤
      newControls[corner.id] = new Control({
        x: corner.x,
        y: corner.y,
        actionHandler: controlsUtils.scalingEqually, // 정비례 확대/축소
        cursorStyleHandler: controlsUtils.scaleCursorStyleHandler, // 확대/축소 커서 적용
        actionName: 'scale',
        render: controlsUtils.renderSquareControl,
      });

      // 모서리 회전 컨트롤
      newControls[`${corner.id}_rotate`] = new Control({
        x: corner.x,
        y: corner.y,
        offsetX: corner.offX,
        offsetY: corner.offY,
        sizeX: 7,
        sizeY: 7,
        actionHandler: controlsUtils.rotationWithSnapping,
        cursorStyleHandler: (_, __, fabricObject) => {
          const totalAngle =
            (fabricObject.getTotalAngle() + corner.angleOffset) % 360;
          return getRotatedCursorUrl(totalAngle);
        },
        actionName: 'rotate',
        render: () => {},
      });
    });

    // 컨트롤 추가
    defaultControls.controls = newControls;

    defaultControls.borderColor = '#1F72EF';
    defaultControls.borderScaleFactor = 1;
    defaultControls.cornerStrokeColor = '#1F72EF';
    defaultControls.cornerSize = 3;
    defaultControls.transparentCorners = false;
    defaultControls.cornerColor = '#fff';
  }, []);
};
