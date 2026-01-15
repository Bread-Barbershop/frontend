function WeddingDay() {
  return (
    <div className="border w-[375px]">
      <div className=" py-[13.5px] flex flex-col gap-1 items-center ">
        <h2>예식 일시</h2>
        <div className="w-full flex">
          <label htmlFor="" className="px-[10px] py-0.5 mr-2 text-sm">
            예식일
          </label>
          <input
            type="text"
            className="w-[270px] h-8 bg-[#EAEAEA] rounded-lg text-center text-[13px]"
            placeholder="2025-11-27"
          />
        </div>
        <div className="w-full flex">
          <label className="px-1 py-0.5 mr-2 text-sm" htmlFor="">
            예식시간
          </label>
          <input
            type="text"
            className="w-[270px] h-8 bg-[#EAEAEA] rounded-lg text-center text-[13px]"
            placeholder="오후 1:00"
          />
        </div>
        <div className="flex w-full">
          <p className="px-1 py-0.5 mr-2 text-sm">추가기능</p>
          <div className="flex gap-2 flex-1">
            <div>
              <input type="checkbox" name="" id="" />
              <label htmlFor="" className="text-[#838383] text-[13px]">
                캘린더
              </label>
            </div>
            <div>
              <input type="checkbox" name="" id="" />
              <label htmlFor="" className="text-[#838383] text-[13px]">
                디데이&카운트다운
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default WeddingDay;
