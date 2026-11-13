import { addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  CMS_CONTENT_COLLECTION,
  CMS_CONTENT_DOC_ID,
  cmsVersionsCollection,
  type CmsSaveSource,
  type CmsVersionCreatedBy,
} from "@/lib/cms-versions";
import {
  cmsRevisionFromData,
  cmsRevisionsMatch,
  StaleCmsContentError,
  type CmsRevisionToken,
} from "@/lib/cms-revision";
import { logFirestoreIssue } from "@/lib/firestore-errors";

/** Live document path used by the admin dashboard and the visual editor. */
export function cmsContentDoc() {
  return doc(db(), CMS_CONTENT_COLLECTION, CMS_CONTENT_DOC_ID);
}

/**
 * Writes `cms/content` then an immutable snapshot under `cms/content/versions`.
 * A failed snapshot does not roll back the live document.
 *
 * Default write merges the payload onto the existing live document so Admin
 * cannot drop Live-edit-only fields. Restore uses `replace: true`.
 * Unless `force` is set, the write is blocked when `expectedRevision` does not
 * match the live document.
 */
export async function saveLiveCmsContent(options: {
  payload: Record<string, unknown>;
  source?: CmsSaveSource;
  createdBy?: CmsVersionCreatedBy;
  note?: string;
  expectedRevision: CmsRevisionToken;
  force?: boolean;
  replace?: boolean;
}): Promise<{ liveSaved: boolean; versionSaved: boolean; revision: CmsRevisionToken }> {
  const firestore = db();
  const liveRef = cmsContentDoc();
  const { payload: incoming, expectedRevision, force, replace } = options;

  const { nextPayload, revision } = await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(liveRef);
    const existing = (snap.data() ?? {}) as Record<string, unknown>;
    const remote = cmsRevisionFromData(existing);
    if (!force && snap.exists() && !cmsRevisionsMatch(expectedRevision, remote)) {
      throw new StaleCmsContentError(remote);
    }
    const nextRevision =
      (typeof existing.revision === "number" ? existing.revision : 0) + 1;
    const incomingRest = { ...incoming };
    delete incomingRest.revision;
    delete incomingRest.updatedAt;
    const nextPayload = {
      ...(replace ? {} : existing),
      ...incomingRest,
      revision: nextRevision,
      updatedAt: serverTimestamp(),
    };
    tx.set(liveRef, nextPayload);
    return {
      nextPayload,
      revision: { revision: nextRevision, updatedAtMs: Date.now() } satisfies CmsRevisionToken,
    };
  });

  try {
    await addDoc(cmsVersionsCollection(firestore), {
      createdAt: serverTimestamp(),
      createdBy: options.createdBy ?? { uid: null, email: null },
      source: options.source ?? "save",
      ...(options.note ? { note: options.note } : {}),
      content: nextPayload,
    });
    return { liveSaved: true, versionSaved: true, revision };
  } catch (error) {
    logFirestoreIssue("cms/content/versions snapshot", error);
    return { liveSaved: true, versionSaved: false, revision };
  }
}
