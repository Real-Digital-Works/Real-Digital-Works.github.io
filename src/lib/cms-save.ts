import { addDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  CMS_CONTENT_COLLECTION,
  CMS_CONTENT_DOC_ID,
  cmsVersionsCollection,
  type CmsSaveSource,
  type CmsVersionCreatedBy,
} from "@/lib/cms-versions";
import { logFirestoreIssue } from "@/lib/firestore-errors";

/** Live document path used by the admin dashboard and the visual editor. */
export function cmsContentDoc() {
  return doc(db(), CMS_CONTENT_COLLECTION, CMS_CONTENT_DOC_ID);
}

/**
 * Writes `cms/content` then an immutable snapshot under `cms/content/versions`.
 * A failed snapshot does not roll back the live document.
 */
export async function saveLiveCmsContent(options: {
  payload: Record<string, unknown>;
  source?: CmsSaveSource;
  createdBy?: CmsVersionCreatedBy;
  note?: string;
}): Promise<{ liveSaved: boolean; versionSaved: boolean }> {
  const payload = {
    ...options.payload,
    updatedAt: serverTimestamp(),
  };
  await setDoc(cmsContentDoc(), payload);
  try {
    await addDoc(cmsVersionsCollection(db()), {
      createdAt: serverTimestamp(),
      createdBy: options.createdBy ?? { uid: null, email: null },
      source: options.source ?? "save",
      ...(options.note ? { note: options.note } : {}),
      content: payload,
    });
    return { liveSaved: true, versionSaved: true };
  } catch (error) {
    logFirestoreIssue("cms/content/versions snapshot", error);
    return { liveSaved: true, versionSaved: false };
  }
}
