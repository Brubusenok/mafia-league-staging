import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "Рейтинг" };

export default function RatingPage() {
  return (
    <PageStub
      title="Рейтинг игроков"
      subtitle="Оценка долгосрочного уровня игры."
      planned={[
        "Таблица игроков по рейтингу",
        "Выбор сезона и периода",
        "Объяснение, как считается рейтинг",
      ]}
    />
  );
}
