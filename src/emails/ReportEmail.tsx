import { Hr, Section, Text } from "@react-email/components";
import { EmailLayout, Paragraph } from "./Layout";
import { directionOf, formatDate, formatPercentChange, formatUsd } from "@/lib/format";
import type { ReportRow } from "@/lib/reports";

/**
 * Report do schránky (zadání 5.6, jedna šablona pro web i e-mail). Čísla i
 * věty o příčinách přicházejí hotové z pipeline, šablona je jen skládá.
 * Položka bez výrazného pohybu dostane šablonovou větu (zadání 1.3).
 */
export type ReportType = "morning" | "afternoon" | "weekly" | "weekly_outlook";

const titles: Record<ReportType, string> = {
  morning: "Ranní přehled",
  afternoon: "Odpolední přehled",
  weekly: "Týdenní přehled",
  weekly_outlook: "Výhled na týden",
};

export const reportTitle = (type: ReportType) => titles[type];

const colors = { ink: "#0C0C0A", mute: "#6B665A", gain: "#1F7A4D", loss: "#B3392E" };
const arrow = { up: "▲", down: "▼", flat: "" } as const;

function changeColor(change: number) {
  const direction = directionOf(change);
  return direction === "up" ? colors.gain : direction === "down" ? colors.loss : colors.ink;
}

function Row({ row }: { row: ReportRow }) {
  const hasNumbers = row.price !== null && row.changePct !== null;
  return (
    <Section style={{ padding: "12px 0", borderTop: `2px solid ${colors.ink}` }}>
      <Text style={{ margin: 0, fontSize: 16, fontWeight: 700, color: colors.ink }}>
        {row.name}{" "}
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.mute }}>{row.ticker}</span>
      </Text>
      {hasNumbers ? (
        <Text style={{ margin: "2px 0 0", fontSize: 15, color: colors.ink }}>
          {formatUsd(row.price!)}
          {"  "}
          <span style={{ fontWeight: 700, color: changeColor(row.changePct!) }}>
            {arrow[directionOf(row.changePct!)]} {formatPercentChange(row.changePct!)}
          </span>
        </Text>
      ) : (
        <Text style={{ margin: "2px 0 0", fontSize: 14, color: colors.mute }}>
          Za tento den nemáme data.
        </Text>
      )}
      {hasNumbers ? (
        <Text style={{ margin: "6px 0 0", fontSize: 14, lineHeight: "21px", color: colors.ink }}>
          {row.significant && row.summaryText ? row.summaryText : "Bez výrazného pohybu."}
        </Text>
      ) : null}
    </Section>
  );
}

export function ReportEmail({
  type,
  reportDate,
  sp500ChangePct,
  rows,
}: {
  type: ReportType;
  /** RRRR-MM-DD, obchodní den, za který report je. */
  reportDate: string;
  sp500ChangePct: number | null;
  rows: ReportRow[];
}) {
  const date = formatDate(new Date(`${reportDate}T12:00:00Z`));
  return (
    <EmailLayout preview={`${titles[type]}, ${date}`}>
      <Text style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: colors.ink }}>
        {titles[type]}
      </Text>
      <Text style={{ margin: "0 0 16px", fontSize: 14, color: colors.mute }}>{date}</Text>
      {sp500ChangePct !== null ? (
        <Paragraph>
          Index S&amp;P 500 skončil dne{" "}
          <span style={{ fontWeight: 700, color: changeColor(sp500ChangePct) }}>
            {formatPercentChange(sp500ChangePct)}
          </span>
          .
        </Paragraph>
      ) : null}
      {rows.map((row) => (
        <Row key={row.ticker} row={row} />
      ))}
      <Hr style={{ borderColor: colors.ink, borderWidth: "2px 0 0", margin: "0" }} />
    </EmailLayout>
  );
}
