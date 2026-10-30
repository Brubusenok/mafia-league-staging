import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "Вечера" };

export default function EveningsPage() {
  return (
    <PageStub
      title="Игровые вечера"
      subtitle="Ближайший вечер, список участников и запись."
      planned={[
        "Дата, время и место ближайшего вечера",
        "Кто уже записался (например, 6 из 10)",
        "Кнопка «Записаться на вечер»",
      ]}
    />
  );
}
