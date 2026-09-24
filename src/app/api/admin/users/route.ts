import { NextResponse } from "next/server";
import { adminAuth, verifyRequest } from "@/lib/firebase-admin";

// GET — list all users
export async function GET(request: Request) {
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const auth = await adminAuth();
  const result = await auth.listUsers(100);

  const users = result.users.map((u) => ({
    uid: u.uid,
    email: u.email,
    displayName: u.displayName ?? null,
    disabled: u.disabled,
    emailVerified: u.emailVerified,
    createdAt: u.metadata.creationTime,
    lastSignIn: u.metadata.lastSignInTime ?? null,
  }));

  return NextResponse.json({ users });
}

// DELETE — remove a user by uid
export async function DELETE(request: Request) {
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { uid } = await request.json();
  if (!uid) {
    return NextResponse.json({ error: "uid is required" }, { status: 400 });
  }

  const auth = await adminAuth();
  await auth.deleteUser(uid);
  return NextResponse.json({ success: true });
}
