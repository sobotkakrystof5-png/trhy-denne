import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

/**
 * Společný rám transakčních e-mailů. Papírový jazyk webu v mezích toho,
 * co e-mailoví klienti umí: krémové pozadí, černý rám, černé tlačítko.
 * Písma webu se do e-mailu nevkládají, zůstávají systémová.
 */
const colors = { ink: "#0C0C0A", cream: "#F9F3E5", paper: "#FFFBF0", mute: "#6B665A" };
const font = "Helvetica, Arial, sans-serif";

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "32px 12px", backgroundColor: colors.cream, fontFamily: font }}>
        <Container
          style={{
            maxWidth: 520,
            backgroundColor: colors.paper,
            border: `3px solid ${colors.ink}`,
            borderRadius: 12,
            padding: "28px 28px 20px",
          }}
        >
          <Text style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: colors.ink }}>
            {site.name}
          </Text>
          {children}
          <Hr style={{ borderColor: colors.ink, borderWidth: "2px 0 0", margin: "28px 0 16px" }} />
          <Text style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: colors.mute }}>
            Nejde o investiční doporučení.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "24px", color: colors.ink }}>
      {children}
    </Text>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: "0 0 12px", fontSize: 14, lineHeight: "21px", color: colors.mute }}>
      {children}
    </Text>
  );
}

export function ActionButton({ href, children }: { href: string; children: string }) {
  return (
    <Section style={{ margin: "8px 0 24px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: colors.ink,
          color: colors.cream,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "16px 24px",
          borderRadius: 8,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
