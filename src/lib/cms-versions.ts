/**
 * Immutable CMS snapshots. Live copy stays at cms/content.
 * Builds (fetch-content.js) must keep reading only that live doc.
 */
import {
  collection,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

export const CMS_CONTENT_COLLECTION = "cms";
export const CMS_CONTENT_DOC_ID = "content";
export const CMS_VERSIONS_SUBCOLLECTION = "versions";

/** Firestore path: cms/content/versions/{autoId} */
export function cmsVersionsCollection(firestore: Firestore) {
  return collection(
    firestore,
    CMS_CONTENT_COLLECTION,
    CMS_CONTENT_DOC_ID,
    CMS_VERSIONS_SUBCOLLECTION,
  );
}

export type CmsSaveSource = "save" | "save-and-deploy" | "restore";

export interface CmsVersionCreatedBy {
  uid: string | null;
  email: string | null;
}

export interface CmsVersionRow {
  id: string;
  createdAt: Date | null;
  createdBy: CmsVersionCreatedBy;
  source: string;
  note?: string;
  content: DocumentData;
}

function asTimestamp(value: unknown): Timestamp | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return value as Timestamp;
  }
  return null;
}

export function mapCmsVersionDoc(docSnap: QueryDocumentSnapshot<DocumentData>): CmsVersionRow {
  const data = docSnap.data();
  const createdByRaw = data.createdBy as CmsVersionCreatedBy | undefined;
  return {
    id: docSnap.id,
    createdAt: asTimestamp(data.createdAt)?.toDate() ?? null,
    createdBy: {
      uid: createdByRaw?.uid ?? null,
      email: createdByRaw?.email ?? null,
    },
    source: typeof data.source === "string" ? data.source : "save",
    note: typeof data.note === "string" ? data.note : undefined,
    content: (data.content as DocumentData) ?? {},
  };
}
