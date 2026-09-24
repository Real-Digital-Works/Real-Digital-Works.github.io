import { NextResponse } from "next/server";
import { adminAuth, verifyRequest } from "@/lib/firebase-admin";
import { site } from "@/lib/content";

// ── Email sending via nodemailer + one.com SMTP ─────────────────────────────
async function sendInviteEmail(to: string, inviteLink: string) {
  const { createTransport } = await import("nodemailer");

  const transporter = createTransport({
    host: process.env.SMTP_HOST ?? "send.one.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to Real Digital Works</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:#1857EC;border-radius:12px;padding:10px 20px;">
                <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.05em;">RDW</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff08;border:1px solid #ffffff14;border-radius:16px;padding:40px 36px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#ffffff;">
                You've been invited
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#ffffff80;">
                You've been invited to access the <strong style="color:#ffffffb3;">Real Digital Works</strong> admin portal.
                Click the button below to set your password and activate your account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:12px;background:#1857EC;">
                    <a href="${inviteLink}"
                       style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Set your password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#ffffff40;">
                This link expires in 1 hour. If you weren't expecting this, you can ignore it.
              </p>
              <p style="margin:0;font-size:12px;color:#ffffff30;word-break:break-all;">
                Or copy this URL: ${inviteLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#ffffff25;">
                Real Digital Works · Kennington, London
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"Real Digital Works" <${process.env.SMTP_USER ?? "noreply@realdigitalworks.com"}>`,
    to,
    subject: "You've been invited to Real Digital Works",
    html,
    text: `You've been invited to access the Real Digital Works admin portal.\n\nSet your password here (link expires in 1 hour):\n${inviteLink}`,
  });
}

// ── POST /api/admin/invite ───────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Verify the caller is an authenticated admin
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const auth = await adminAuth();

    // 2. Create the user (they will set their own password via the invite link)
    let uid: string;
    try {
      const user = await auth.createUser({ email, emailVerified: false, disabled: false });
      uid = user.uid;
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "auth/email-already-exists") {
        const existing = await auth.getUserByEmail(email);
        uid = existing.uid;
      } else {
        throw err;
      }
    }

    // 3. Generate the invite link and rewrite to our branded /auth/action page
    const firebaseLink = await auth.generatePasswordResetLink(email, {
      url: `${site.url}/admin/login`,
    });
    const inviteLink = firebaseLink.replace(
      /https:\/\/[^/]+\/__\/auth\/action/,
      `${site.url}/auth/action`
    );

    void uid;

    // 4. Send the invite email (non-blocking — we still return the link if email fails)
    let emailSent = false;
    let emailError: string | null = null;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendInviteEmail(email, inviteLink);
        emailSent = true;
      } catch (err) {
        console.error("[invite] Email send failed:", err);
        emailError = err instanceof Error ? err.message : "Unknown email error";
      }
    } else {
      console.warn("[invite] SMTP_USER or SMTP_PASS not set — skipping email send");
    }

    return NextResponse.json({ inviteLink, emailSent, emailError });
  } catch (err) {
    console.error("[invite] Error:", err);
    return NextResponse.json(
      { error: "Failed to create invite. Check server logs." },
      { status: 500 }
    );
  }
}
