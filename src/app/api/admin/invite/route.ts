import { NextResponse } from "next/server";
import { adminAuth, verifyRequest } from "@/lib/firebase-admin";
import { site } from "@/lib/content";

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
      const user = await auth.createUser({
        email,
        emailVerified: false,
        disabled: false,
      });
      uid = user.uid;
    } catch (err: unknown) {
      // If user already exists, get their uid to resend the invite
      if ((err as { code?: string }).code === "auth/email-already-exists") {
        const existing = await auth.getUserByEmail(email);
        uid = existing.uid;
      } else {
        throw err;
      }
    }

    // 3. Generate a password reset link (acts as the "set your password" invite link)
    const firebaseLink = await auth.generatePasswordResetLink(email, {
      url: `${site.url}/admin/login`,
    });

    // Firebase generates a link pointing to its own domain (firebaseapp.com).
    // We rewrite it to our branded /auth/action page — the oobCode works on any domain.
    const inviteLink = firebaseLink.replace(
      /https:\/\/[^/]+\/__\/auth\/action/,
      `${site.url}/auth/action`
    );

    void uid;

    return NextResponse.json({ inviteLink });
  } catch (err) {
    console.error("[invite] Error:", err);
    return NextResponse.json(
      { error: "Failed to create invite. Check server logs." },
      { status: 500 }
    );
  }
}
