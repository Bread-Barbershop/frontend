function GalleryTitleBox() {
  return (
    <section
      className="w-fit rounded-4xl border border-white/30 bg-white/15 p-8 text-left backdrop-blur-md"
      style={{
        boxShadow:
          'inset 4px 4px 18px rgba(0, 0, 0, 0.08), inset -4px -4px 18px rgba(255, 255, 255, 0.75)',
      }}
    >
      <p className="text-2xl font-medium">Invitation Designs</p>
      <h1 className="text-[64px] font-black leading-none">초대장 갤러리</h1>
      <p className="mt-4 text-2xl font-medium">
        다양한 디자인을 둘러보고 원하는 초대장으로 시작할 수 있어요.
      </p>
    </section>
  );
}

export default GalleryTitleBox;
