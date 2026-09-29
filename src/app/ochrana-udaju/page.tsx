import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Ochrana osobních údajů" };

export default function OchranaUdajuPage() {
  return <LegalPage title="Ochrana osobních údajů" />;
}
