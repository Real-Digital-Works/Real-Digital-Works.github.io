"use client";

import {
  CMS_REMOTE_BANNER_COPY,
  CMS_STALE_SAVE_COPY,
} from "@/lib/cms-revision";

export function CmsRemoteVersionBanner({
  dirty,
  onLoadLatest,
  onKeepEditing,
}: {
  dirty: boolean;
  onLoadLatest: () => void;
  onKeepEditing: () => void;
}) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-100"
    >
      <p className="min-w-0 flex-1">
        {dirty ? CMS_REMOTE_BANNER_COPY.dirty : CMS_REMOTE_BANNER_COPY.clean}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onLoadLatest}
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900"
        >
          {CMS_REMOTE_BANNER_COPY.loadLatest}
        </button>
        {dirty ? (
          <button
            type="button"
            onClick={onKeepEditing}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80"
          >
            {CMS_REMOTE_BANNER_COPY.keepEditing}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CmsStaleSaveModal({
  onLoadLatest,
  onCancel,
}: {
  onLoadLatest: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <p className="text-base font-semibold leading-snug">{CMS_STALE_SAVE_COPY.message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
          >
            {CMS_STALE_SAVE_COPY.cancel}
          </button>
          <button
            type="button"
            onClick={onLoadLatest}
            className="rounded-xl bg-[#1857EC] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            {CMS_STALE_SAVE_COPY.loadLatest}
          </button>
        </div>
      </div>
    </div>
  );
}
