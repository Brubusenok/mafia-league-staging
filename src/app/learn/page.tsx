import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "Учиться" };

export default function LearnPage() {
  return (
    <PageStub
      title="Научись играть в Мафию"
      subtitle="Никогда не играл? Начни с основ — мы поможем."
      planned={[
        "Путь новичка: четыре коротких урока",
        "Как устроен игровой стол",
        "Правила, роли и частые вопросы",
      ]}
    />
  );
}
