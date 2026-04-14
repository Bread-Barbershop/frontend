import { Trash2 } from 'lucide-react';

import { dashboardCarouselLayout } from '../../carouselLayout';

function DeleteButton() {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white transition-colors hover:bg-[#E5E7EB]"
      style={{
        width: dashboardCarouselLayout.sideActionSize,
        height: dashboardCarouselLayout.sideActionSize,
        boxShadow: dashboardCarouselLayout.sideActionShadow,
      }}
    >
      <Trash2
        size={dashboardCarouselLayout.sideActionIconSize}
        strokeWidth={1.5}
        color="#F32E2E"
      />
    </div>
  );
}

export default DeleteButton;
