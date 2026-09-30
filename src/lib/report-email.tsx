import "server-only";
import { render } from "@react-email/render";
import { ReportEmail, type ReportType } from "@/emails/ReportEmail";
import type { ReportRow } from "@/lib/reports";

export async function renderReportHtml(props: {
  type: ReportType;
  reportDate: string;
  sp500ChangePct: number | null;
  rows: ReportRow[];
}): Promise<string> {
  return render(<ReportEmail {...props} />);
}
