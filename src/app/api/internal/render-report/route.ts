import { z } from "zod";
import { accountsReady, internalRoutesReady } from "@/lib/env";
import { verifyInternalRequest } from "@/lib/internal-auth";
import { renderReportHtml } from "@/lib/report-email";
import { loadReportData } from "@/lib/reports";

/**
 * Vykreslení reportu pro dávku uživatelů (zadání 5.6). Volá ji jen n8n,
 * podepsaně (HMAC nad tělem a časovou značkou, platnost 5 minut). HTML se
 * jen vrací, do outboxu ho ukládá n8n. Nic tu nevolá jazykový model.
 */
const bodySchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reportType: z.enum(["morning", "afternoon", "weekly", "weekly_outlook"]),
  userIds: z.array(z.uuid()).min(1).max(100),
});

export async function POST(request: Request) {
  if (!internalRoutesReady() || !accountsReady()) {
    return Response.json({ error: "not_ready" }, { status: 503 });
  }

  const raw = await request.text();
  if (raw.length > 16_000) return Response.json({ error: "payload_too_large" }, { status: 413 });
  if (!verifyInternalRequest(request.headers, raw)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const { reportDate, reportType, userIds } = parsed.data;
  const data = await loadReportData([...new Set(userIds)], reportDate);
  if (!data.ready) return Response.json({ error: "report_not_ready" }, { status: 409 });

  const reports = await Promise.all(
    data.recipients.map(async ({ userId, rows }) => ({
      userId,
      html: await renderReportHtml({
        type: reportType,
        reportDate,
        sp500ChangePct: data.sp500ChangePct,
        rows,
      }),
    })),
  );

  return Response.json({ reports, skipped: data.skipped });
}
