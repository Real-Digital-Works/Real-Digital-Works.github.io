import type { Timestamp } from "firebase/firestore";

export type CmsRevisionToken = {
  revision: number;
  updatedAtMs: number | null;
};

export const EMPTY_CMS_REVISION: CmsRevisionToken = {
  revision: 0,
  updatedAtMs: null,
};

export const CMS_STALE_SAVE_COPY = {
  message: "The site was updated in another tab. Reload latest copy?",
  loadLatest: "Load latest",
  cancel: "Cancel",
} as const;

export const CMS_REMOTE_BANNER_COPY = {
  clean: "New version available — Load latest",
  dirty:
    "The site was updated in another tab. Load latest may lose unsaved changes.",
  loadLatest: "Load latest",
  keepEditing: "Keep editing",
} as const;

export class StaleCmsContentError extends Error {
  remote: CmsRevisionToken;

  constructor(remote: CmsRevisionToken) {
    super("STALE_CMS_CONTENT");
    this.name = "StaleCmsContentError";
    this.remote = remote;
  }
}

export function isStaleCmsContentError(error: unknown): error is StaleCmsContentError {
  return (
    error instanceof StaleCmsContentError ||
    (error instanceof Error && error.name === "StaleCmsContentError")
  );
}

function timestampMillis(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as Timestamp).toMillis === "function"
  ) {
    return (value as Timestamp).toMillis();
  }
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number"
  ) {
    const nanos = (value as { nanoseconds?: number }).nanoseconds ?? 0;
    return (value as { seconds: number }).seconds * 1000 + Math.floor(nanos / 1e6);
  }
  return null;
}

export function cmsRevisionFromData(data: Record<string, unknown> | undefined): CmsRevisionToken {
  const revision = typeof data?.revision === "number" ? data.revision : 0;
  return {
    revision,
    updatedAtMs: timestampMillis(data?.updatedAt),
  };
}

export function cmsRevisionsMatch(a: CmsRevisionToken, b: CmsRevisionToken): boolean {
  if (a.revision > 0 || b.revision > 0) return a.revision === b.revision;
  return a.updatedAtMs === b.updatedAtMs;
}
