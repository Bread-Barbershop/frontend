import { FabricObject, Control, controlsUtils, util } from 'fabric';
import { useEffect } from 'react';

import { CORNERS_CONFIG, MOVE_ICON } from '../utils/constants';
import {
  createFabricControlImage,
  getRotatedCursorUrl,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';

const scaleOrResizeTextbox: Control['actionHandler'] = (
  eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;

  const isTextbox =
    typeof target?.isType === 'function'
      ? target.isType('textbox')
      : target?.type === 'textbox';

  // Textbox면: scale 말고 width 변경 (폰트 크기 유지)
  if (isTextbox) {
    return controlsUtils.changeWidth(eventData, transform, x, y);
  }

  // 그 외(이미지 등)는 기존처럼 스케일
  return controlsUtils.scalingEqually(eventData, transform, x, y);
};

export const useSetFabricControls = () => {
  useEffect(() => {
    const img = createFabricControlImage(MOVE_ICON);

    const defaultControls = FabricObject.ownDefaults;

    // 스타일 제거
    const newControls: Record<string, Control> = {};

    // 중앙 컨트롤
    newControls.center = new Control({
      x: 0,
      y: 0,
      actionName: 'centerAction',
      render: (ctx, left, top, _, fabricObject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((fabricObject as any).name === 'crop-zone') return;

        if (!isImageReadyForCanvas(img)) {
          img.onload = () => fabricObject.canvas?.requestRenderAll();
          return;
        }

        const size = 24; // 아이콘 출력 크기
        ctx.save();
        ctx.translate(left, top);

        // 객체가 회전할 때 아이콘도 같이 회전시키려면 아래 주석 해제
        ctx.rotate(util.degreesToRadians(fabricObject.angle));

        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      },
    });

    // 모서리 컨트롤
    CORNERS_CONFIG.forEach(corner => {
      // 모서리 확대/축소 컨트롤
      newControls[corner.id] = new Control({
        x: corner.x,
        y: corner.y,
        // actionHandler: controlsUtils.scalingEqually, // 정비례 확대/축소
        actionHandler: scaleOrResizeTextbox,
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
        sizeX: 10,
        sizeY: 10,
        getVisibility: fabricObject =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (fabricObject as any).name !== 'crop-zone',
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

    // 컨트롤 스타일
    defaultControls.borderColor = '#1F72EF';
    defaultControls.borderScaleFactor = 1;
    defaultControls.cornerStrokeColor = '#1F72EF';
    defaultControls.cornerSize = 10;
    defaultControls.transparentCorners = false;
    defaultControls.cornerColor = '#fff';
  }, []);
};
