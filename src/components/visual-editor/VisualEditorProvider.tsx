"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, firebaseConfigured } from "@/lib/firebase";
import seedContent, { type Content } from "@/lib/content";
import { cmsContentDoc, saveLiveCmsContent } from "@/lib/cms-save";
import type { CmsSaveSource } from "@/lib/cms-versions";
import { logFirestoreIssue } from "@/lib/firestore-errors";
import {
  clearVisualDevBypass,
  clearVisualEditorFlag,
  getCmsText,
  hydrateVisualDraft,
  readVisualDevBypass,
  readVisualEditorFlag,
  setCmsText,
  validateDraftHtml,
  VISUAL_EDITOR_EXIT_HREF,
  VISUAL_HIDDEN_KEY,
  visualSavePayload,
} from "@/lib/visual-editor";
import { isVisualChromeEvent, pickCmsHit } from "./hit-test";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export type VisualSelection =
  | { kind: "text"; path: string }
  | { kind: "link"; id: string }
  | { kind: "nav"; id: string }
  | { kind: "popup"; id: string };

type VisualEditorContextValue = {
  enabled: boolean;
  isDevBypass: boolean;
  user: User | null;
  draft: Content;
  dirty: boolean;
  status: SaveStatus;
  statusMessage: string;
  selectedPath: string | null;
  selection: VisualSelection | null;
  selectPath: (path: string | null) => void;
  selectLink: (id: string) => void;
  selectNav: (id: string) => void;
  selectPopup: (id: string) => void;
  activePopup: string | null;
  openPopup: (id: string) => void;
  getText: (path: string) => string;
  setText: (path: string, value: string) => void;
  patchDraft: (next: Content) => void;
  save: (source?: CmsSaveSource) => Promise<boolean>;
  deploy: () => Promise<boolean>;
  exit: () => void;
};

const VisualEditorContext = createContext<VisualEditorContextValue | null>(null);

export function useVisualEditorOptional() {
  return useContext(VisualEditorContext);
}

export function useVisualEditor() {
  const ctx = useContext(VisualEditorContext);
  if (!ctx) throw new Error("useVisualEditor must be used inside VisualEditorProvider");
  return ctx;
}

const seedDraft = hydrateVisualDraft(seedContent, null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDevBypass, setIsDevBypass] = useState(false);
  const [liveEditOn, setLiveEditOn] = useState(false);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [draft, setDraft] = useState<Content>(seedDraft);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selection, setSelection] = useState<VisualSelection | null>(null);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const bypass = readVisualDevBypass();
    const flag = readVisualEditorFlag();
    setIsDevBypass(bypass);
    setLiveEditOn(flag);
    try {
      setHidden(!bypass && !flag && window.sessionStorage.getItem(VISUAL_HIDDEN_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth(), (next) => {
      setUser(next);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const enabled = authReady && !hidden && ((Boolean(user) && liveEditOn) || isDevBypass);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-rdw-visual");
      return;
    }
    document.documentElement.setAttribute("data-rdw-visual", isDevBypass && !user ? "dev" : "on");
    return () => document.documentElement.removeAttribute("data-rdw-visual");
  }, [enabled, isDevBypass, user]);

  useEffect(() => {
    if (!enabled || !firebaseConfigured || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(cmsContentDoc());
        if (cancelled || !snap.exists()) return;
        setDraft(hydrateVisualDraft(seedContent, snap.data()));
      } catch (error) {
        logFirestoreIssue("visual editor cms/content read", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, user]);

  const getText = useCallback((path: string) => getCmsText(draft, path), [draft]);

  const setText = useCallback((path: string, value: string) => {
    setDraft((current) => setCmsText(current, path, value));
    setDirty(true);
    setStatus("idle");
  }, []);

  const selectPath = useCallback((path: string | null) => {
    setSelectedPath(path);
    setSelection(path ? { kind: "text", path } : null);
  }, []);

  const selectLink = useCallback((id: string) => {
    setSelection({ kind: "link", id });
    setSelectedPath(`cta.${id}`);
  }, []);

  const selectNav = useCallback((id: string) => {
    setSelection({ kind: "nav", id });
    setSelectedPath(`nav.${id}`);
  }, []);

  const selectPopup = useCallback((id: string) => {
    setSelection({ kind: "popup", id });
    setSelectedPath(`popup.${id}`);
  }, []);

  const openPopup = useCallback(
    (id: string) => {
      setActivePopup(id);
      selectPopup(id);
    },
    [selectPopup],
  );

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isVisualChromeEvent(event.target)) return;
      const hit = pickCmsHit(event.clientX, event.clientY);
      if (!hit) return;
      if (hit.kind === "text") selectPath(hit.id);
      else if (hit.kind === "link") selectLink(hit.id);
      else if (hit.kind === "nav") selectNav(hit.id);
      else selectPopup(hit.id);
      event.stopPropagation();
      if (hit.kind === "text" && !hit.html) {
        queueMicrotask(() => hit.el.focus());
      } else {
        event.preventDefault();
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [enabled, selectPath, selectLink, selectNav, selectPopup]);

  const patchDraft = useCallback((next: Content) => {
    setDraft(next);
    setDirty(true);
    setStatus("idle");
  }, []);

  const save = useCallback(
    async (source: CmsSaveSource = "save") => {
      if (!firebaseConfigured) {
        setStatus("error");
        setStatusMessage("Firebase is not configured. Preview only — nothing was saved.");
        return false;
      }
      if (!user) {
        setStatus("error");
        setStatusMessage("Sign in at /admin/login to save. Dev preview cannot write production CMS.");
        return false;
      }
      const htmlError = validateDraftHtml(draft);
      if (htmlError) {
        setStatus("error");
        setStatusMessage(htmlError);
        return false;
      }
      setStatus("saving");
      setStatusMessage(source === "save-and-deploy" ? "Saving…" : "Saving to cms/content…");
      try {
        const result = await saveLiveCmsContent({
          payload: visualSavePayload(draft),
          source,
          createdBy: { uid: user?.uid ?? null, email: user?.email ?? null },
          note: "visual-editor",
        });
        setDirty(false);
        setStatus("saved");
        setStatusMessage(
          result.versionSaved
            ? "Saved to Firestore (cms/content + version snapshot)."
            : "Saved to cms/content. Version snapshot skipped (permissions).",
        );
        window.setTimeout(() => {
          setStatus((s) => (s === "saved" ? "idle" : s));
        }, 3200);
        return true;
      } catch (error) {
        logFirestoreIssue("visual editor cms/content write", error);
        setStatus("error");
        setStatusMessage(error instanceof Error ? error.message : "Save failed");
        return false;
      }
    },
    [draft, user],
  );

  const deploy = useCallback(async () => {
    const ok = await save("save-and-deploy");
    if (!ok) return false;
    if (!user) {
      setStatus("error");
      setStatusMessage("Saved locally to Firestore if permitted, but deploy needs an admin session.");
      return false;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/deploy-hook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deploy: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Deploy failed");
      setStatus("saved");
      setStatusMessage("Saved and deploy hook fired. The live site updates after the build.");
      return true;
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Deploy failed");
      return false;
    }
  }, [save, user]);

  const exit = useCallback(() => {
    clearVisualDevBypass();
    clearVisualEditorFlag();
    setIsDevBypass(false);
    setLiveEditOn(false);
    setHidden(true);
    document.documentElement.removeAttribute("data-rdw-visual");
    window.location.assign(VISUAL_EDITOR_EXIT_HREF);
  }, []);

  const value = useMemo<VisualEditorContextValue>(
    () => ({
      enabled,
      isDevBypass,
      user,
      draft,
      dirty,
      status,
      statusMessage,
      selectedPath,
      selection,
      selectPath,
      selectLink,
      selectNav,
      selectPopup,
      activePopup,
      openPopup,
      getText,
      setText,
      patchDraft,
      save,
      deploy,
      exit,
    }),
    [
      enabled,
      isDevBypass,
      user,
      draft,
      dirty,
      status,
      statusMessage,
      selectedPath,
      selection,
      selectPath,
      selectLink,
      selectNav,
      selectPopup,
      activePopup,
      openPopup,
      getText,
      setText,
      patchDraft,
      save,
      deploy,
      exit,
    ],
  );

  return <VisualEditorContext.Provider value={value}>{children}</VisualEditorContext.Provider>;
}

