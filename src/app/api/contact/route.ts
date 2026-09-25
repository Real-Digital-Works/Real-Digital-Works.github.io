import { NextResponse } from "next/server";
import { site } from "@/lib/content";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_HITS;
}

function mailtoHref(payload: {
  name: string;
  business: string;
  email: string;
  phone: string;
  need: string;
  message: string;
}) {
  const lines = [
    payload.business ? `Business: ${payload.business}` : null,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.need ? `Need: ${payload.need}` : null,
    payload.email ? `Reply-to: ${payload.email}` : null,
    "",
    payload.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return `${site.emailHref}?subject=${encodeURIComponent(
    `Enquiry from ${payload.name}`
  )}&body=${encodeURIComponent(lines)}`;
}

export async function POST(request: Request) {
  try {
    if (rateLimited(clientIp(request))) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const rec = body as Record<string, unknown>;
    const payload = {
      name: typeof rec.name === "string" ? rec.name.trim() : "",
      business: typeof rec.business === "string" ? rec.business.trim() : "",
      email: typeof rec.email === "string" ? rec.email.trim() : "",
      phone: typeof rec.phone === "string" ? rec.phone.trim() : "",
      need: typeof rec.need === "string" ? rec.need.trim() : "",
      message: typeof rec.message === "string" ? rec.message.trim() : "",
    };

    if (payload.name.length < 2) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(payload.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (payload.message.length < 10) {
      return NextResponse.json({ error: "A sentence or two is plenty." }, { status: 400 });
    }

    const href = mailtoHref(payload);
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ ok: true, mailto: href });
    }

    const { createTransport } = await import("nodemailer");
    const transporter = createTransport({
      host: process.env.SMTP_HOST ?? "send.one.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const text = [
      `Name: ${payload.name}`,
      payload.business ? `Business: ${payload.business}` : null,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      payload.need ? `Need: ${payload.need}` : null,
      "",
      payload.message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    try {
      await transporter.sendMail({
        from: `"Real Digital Works" <${smtpUser}>`,
        to: site.email,
        replyTo: payload.email,
        subject: `Enquiry from ${payload.name}`,
        text,
      });
    } catch {
      return NextResponse.json({ ok: true, mailto: href });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not send the enquiry." }, { status: 500 });
  }
}
