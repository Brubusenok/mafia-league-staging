import { Suspense, type ReactNode } from "react";
import { HistoryTabs, TabList } from "@/app/history/history-tabs";
import { PageHero } from "@/components/ui";

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHero title="История клуба" subtitle="Все игровые вечера, партии и сезоны в одном месте.">
        {/* Вкладки читают адрес страницы, на динамических адресах это нужно делать в Suspense. */}
        <Suspense fallback={<TabList pathname={null} />}>
          <HistoryTabs />
        </Suspense>
      </PageHero>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">{children}</div>
    </>
  );
}
