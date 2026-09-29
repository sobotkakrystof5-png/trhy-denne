import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Obchodní podmínky" };

export default function PodminkyPage() {
  return <LegalPage title="Obchodní podmínky" />;
}
