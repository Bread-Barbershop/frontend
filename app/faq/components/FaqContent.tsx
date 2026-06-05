'use client';

import { Minus, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import ContactEmailActions from '@/features/contact/components/ContactEmailActions';

import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqCategoryId } from '../data';

function FaqContent() {
  const [selectedCategory, setSelectedCategory] =
    useState<FaqCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedItemId, setOpenedItemId] = useState<string | null>(
    FAQ_ITEMS[0]?.id ?? null
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter(item => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.question} ${item.answer}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full px-5 pb-16 pt-12 text-[#171717] sm:px-8 lg:px-12 lg:pb-20 lg:pt-16">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-black/15 pb-10 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-16 lg:pb-14">
          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.24em] text-black/45">
              HELP CENTER
            </p>
            <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9]">
              Frequently
              <br />
              asked.
            </h1>
            <p className="mt-7 text-base leading-7 text-black/60 sm:whitespace-nowrap sm:text-lg sm:leading-8">
              Invia 이용 중 궁금한 점을 빠르게 찾아보세요. 필요한 답변이 없다면
              언제든 문의를 남겨주세요.
            </p>
          </div>

          <label className="group flex items-center gap-3 border-b border-black/45 py-3 transition-colors focus-within:border-black">
            <Search className="h-5 w-5 shrink-0 text-black/50 transition-colors group-focus-within:text-black" />
            <span className="sr-only">FAQ 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="궁금한 내용을 검색해 보세요"
              className="w-full bg-transparent text-base outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-14">
          <aside>
            <p className="mb-4 text-[13px] font-bold tracking-[0.18em] text-black/40">
              CATEGORY
            </p>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {FAQ_CATEGORIES.map(category => {
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cursor-pointer rounded-full px-3.5 py-2 text-[15px] transition-colors lg:rounded-none lg:px-0 lg:py-1 ${
                      isSelected
                        ? 'bg-black font-semibold text-white lg:bg-transparent lg:text-black'
                        : 'bg-black/5 text-black/55 hover:bg-black/10 hover:text-black lg:bg-transparent lg:hover:bg-transparent'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {category.label}
                      {isSelected && (
                        <span className="hidden h-1.5 w-1.5 rounded-full bg-black lg:block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="mb-3 flex items-end justify-between border-b border-black pb-4">
              <h2 className="text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">
                무엇을 도와드릴까요?
              </h2>
              <span className="text-sm tabular-nums text-black/45">
                {String(filteredItems.length).padStart(2, '0')}
              </span>
            </div>

            {filteredItems.length > 0 ? (
              <div>
                {filteredItems.map((item, index) => {
                  const isOpened = openedItemId === item.id;
                  const answerId = `${item.id}-answer`;

                  return (
                    <article key={item.id} className="border-b border-black/15">
                      <button
                        type="button"
                        aria-expanded={isOpened}
                        aria-controls={answerId}
                        onClick={() =>
                          setOpenedItemId(currentId =>
                            currentId === item.id ? null : item.id
                          )
                        }
                        className="flex w-full cursor-pointer items-start gap-4 py-5 text-left sm:gap-7 sm:py-6"
                      >
                        <span className="pt-0.5 text-xs font-semibold tabular-nums text-black/35">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-base font-semibold leading-6 tracking-[-0.02em] sm:text-lg sm:leading-7">
                          {item.question}
                        </span>
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/20">
                          {isOpened ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>

                      <div
                        id={answerId}
                        aria-hidden={!isOpened}
                        inert={!isOpened ? true : undefined}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                          isOpened
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-6 pl-8 pr-11 text-sm leading-7 text-black/60 sm:pb-7 sm:pl-14 sm:pr-16 sm:text-base sm:leading-7">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center border-b border-black/15 px-4 text-center">
                <p className="text-lg font-semibold">검색 결과가 없습니다.</p>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  다른 검색어를 입력하거나 카테고리를 변경해 보세요.
                </p>
              </div>
            )}
          </div>
        </div>

        <section className="mt-4 grid gap-7 rounded-[2rem] bg-[#171717] px-7 py-8 text-white sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/45">
              STILL CURIOUS?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
              찾는 답변이 없나요?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
              문의를 남겨주시면 확인 후 답변드리겠습니다.
            </p>
          </div>

          <ContactEmailActions />
        </section>
      </section>
    </div>
  );
}

export default FaqContent;
