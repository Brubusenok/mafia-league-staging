import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "История" };

export default function HistoryPage() {
  return (
    <PageStub
      title="История клуба"
      subtitle="Все игровые вечера, партии и сезоны в одном месте."
      planned={[
        "Вкладки: вечера, партии, сезоны",
        "Сводка по сезону: вечера, партии, победы красных и чёрных",
        "Протокол каждой партии",
      ]}
    />
  );
}
