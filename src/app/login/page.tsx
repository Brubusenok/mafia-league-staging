import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <PageStub
      title="Вход"
      subtitle="Вход для игроков и организаторов клуба."
    />
  );
}
