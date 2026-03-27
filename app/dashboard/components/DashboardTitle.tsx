import {
  DASHBOARD_COPY,
  DASHBOARD_TITLE_CARD_CLASS,
  DASHBOARD_TITLE_SECTION_CLASS,
} from '@/app/dashboard/dashboardConfig';

function DashboardTitle() {
  return (
    <section className={DASHBOARD_TITLE_SECTION_CLASS}>
      <div className={DASHBOARD_TITLE_CARD_CLASS}>
        <p className="select-none text-2xl font-medium text-[#121212]">
          {DASHBOARD_COPY.archiveEyebrow}
        </p>
        <h1 className="select-none text-[64px] font-black leading-tight text-[#121212]">
          {DASHBOARD_COPY.title}
        </h1>
        <p className="select-none whitespace-nowrap text-2xl font-medium text-[#121212]">
          {DASHBOARD_COPY.description}
        </p>
      </div>
    </section>
  );
}

export default DashboardTitle;
