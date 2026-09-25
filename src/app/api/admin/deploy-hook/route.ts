import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/firebase-admin";
import {
  firestoreDeployHook,
  isValidDeployHookUrl,
  maskDeployHook,
  resolveDeployHook,
  saveFirestoreDeployHook,
  triggerVercelDeploy,
} from "@/lib/deploy-hook";

export const dynamic = "force-dynamic";

// GET — shared hook status for every signed-in admin (never returns the env secret)
export async function GET(request: Request) {
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const override = await firestoreDeployHook();
    const resolved = await resolveDeployHook(override);

    return NextResponse.json({
      configured: resolved.source !== "none",
      source: resolved.source,
      override: override && isValidDeployHookUrl(override) ? override : "",
      displayUrl:
        resolved.source === "env"
          ? maskDeployHook(resolved.url)
          : resolved.source === "firestore"
            ? override
            : "",
    });
  } catch (err) {
    console.error("[deploy-hook] GET failed:", err);
    return NextResponse.json({ error: "Failed to load deploy hook." }, { status: 500 });
  }
}

// POST — optionally persist a Firestore override, then deploy from the server
export async function POST(request: Request) {
  try {
    await verifyRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: { deployHook?: unknown; deploy?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const rawOverride = typeof body.deployHook === "string" ? body.deployHook.trim() : "";
  const shouldDeploy = body.deploy !== false;

  try {
    if (rawOverride) {
      if (!isValidDeployHookUrl(rawOverride)) {
        return NextResponse.json(
          {
            error:
              "That does not look like a Vercel deploy hook. Use the https://api.vercel.com/v1/integrations/deploy/… URL.",
          },
          { status: 400 }
        );
      }
      await saveFirestoreDeployHook(rawOverride);
    }

    const resolved = await resolveDeployHook();

    if (!shouldDeploy) {
      return NextResponse.json({
        ok: true,
        saved: Boolean(rawOverride),
        configured: resolved.source !== "none",
        source: resolved.source,
      });
    }

    if (!resolved.url) {
      return NextResponse.json(
        {
          error:
            "No shared deploy hook is configured. Add DEPLOY_HOOK_URL in Vercel, or paste a hook URL in the Deploy tab.",
        },
        { status: 400 }
      );
    }

    await triggerVercelDeploy(resolved.url);

    return NextResponse.json({
      ok: true,
      deployed: true,
      source: resolved.source,
    });
  } catch (err) {
    console.error("[deploy-hook] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to save or trigger deploy. Check server logs." },
      { status: 500 }
    );
  }
}
