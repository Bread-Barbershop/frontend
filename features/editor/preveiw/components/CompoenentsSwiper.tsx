import { weddingComponents } from '@/shared/samples/componentSample';

function CompoenentsSwiper() {
  return (
    <div className="absolute -left-25 -top-10 w-165 overflow-y-auto">
      <ul className="flex gap-3">
        {weddingComponents.map((items, index) => (
          <li
            key={index}
            className="bg-white rounded-md py-2 px-3 shrink-0 shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)]"
          >
            {items.contents}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default CompoenentsSwiper;
