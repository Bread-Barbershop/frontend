import Edit from './Edit';

function LeftPanel() {
  return (
    <div className="w-93.75 ml-15 flex flex-col gap-4">
      <div className="flex-center h-11 relative bg-white rounded-lg shadow-edit font-semibold border border-black/5">
        <p>일괄 편집</p>
        <button className="absolute right-6">
          <svg
            width="14"
            height="7"
            viewBox="0 0 14 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L7 6L13 1"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-center h-fit bg-white rounded-lg shadow-edit font-semibold  border border-black/5">
        <Edit />
      </div>
    </div>
  );
}
export default LeftPanel;
