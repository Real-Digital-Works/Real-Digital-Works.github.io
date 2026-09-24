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
    const auth = adminAuth();

    // 2. Create the user with a random password they will never use
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
    // The action URL points to our branded /auth/action page (set in Firebase Console)
    const inviteLink = await auth.generatePasswordResetLink(email, {
      url: `${site.url}/admin/login`,
    });

    void uid; // uid created above, used if needed

    return NextResponse.json({ inviteLink });
  } catch (err) {
    console.error("[invite] Error:", err);
    return NextResponse.json(
      { error: "Failed to create invite. Check server logs." },
      { status: 500 }
    );
  }
}
