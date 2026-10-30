import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "Игроки" };

export default function PlayersPage() {
  return (
    <PageStub
      title="Игроки клуба"
      subtitle="Люди, с которыми мы играем, соревнуемся и развиваемся."
      planned={[
        "Карточки игроков с поиском",
        "Фильтр: все / игроки клуба / новички",
        "Переход в профиль игрока",
      ]}
    />
  );
}
