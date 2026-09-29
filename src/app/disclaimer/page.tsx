import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Upozornění k obsahu" };

export default function DisclaimerPage() {
  return <LegalPage title="Upozornění k obsahu" />;
}
