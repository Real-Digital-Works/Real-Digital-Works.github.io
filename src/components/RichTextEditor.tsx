"use client";

/**
 * RichTextEditor — TipTap wrapper used across the admin for blog posts,
 * custom pages, and any long-form content field.
 *
 * Props:
 *   content  — current HTML string
 *   onChange — called with new HTML on every change
 *   placeholder — optional placeholder text
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef, useState } from "react";
import { BLOG_IMAGE_ACCEPT, uploadBlogImage } from "@/lib/blog-image-upload";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Live-edit allowlist: B/I/U, headings, lists, links. No code or quotes. */
  strict?: boolean;
  /** When set, toolbar shows Insert image and uploads to S3 under this post slug. */
  imageSlug?: string;
}

// ── Toolbar button ─────────────────────────────────────────────────────────

function Btn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`rounded px-2 py-1 text-[13px] font-medium transition ${
        active
          ? "bg-[#1857EC] text-white"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-white/15 self-center" />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function RichTextEditor({ content, onChange, placeholder, minHeight = "240px", strict = false, imageSlug }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const canInsertImage = Boolean(imageSlug?.trim());

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        strike: strict ? false : undefined,
        blockquote: strict ? false : undefined,
        codeBlock: strict ? false : undefined,
        code: strict ? false : undefined,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#60a5fa] underline" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rdw-rte-image" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
        style: `min-height: ${minHeight}; padding: 16px;`,
      },
    },
  });

  // Sync external content changes (e.g. when loading from Firestore)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(async (file: File) => {
    if (!editor || !imageSlug?.trim()) return;
    setImageError("");
    setImageBusy(true);
    try {
      const url = await uploadBlogImage(file, imageSlug, "inline");
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[a-z0-9]+$/i, "") }).run();
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setImageBusy(false);
    }
  }, [editor, imageSlug]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-white/3 px-2 py-1.5">
        {/* Text style */}
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <strong>B</strong>
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <em>I</em>
        </Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span className="underline">U</span>
        </Btn>
        {strict ? null : (
          <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <span className="line-through">S</span>
          </Btn>
        )}

        <Divider />

        {/* Headings */}
        <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          H2
        </Btn>
        <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          H3
        </Btn>
        <Btn active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="Heading 4">
          H4
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          • List
        </Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1. List
        </Btn>

        <Divider />

        {strict ? null : (
          <>
            <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
              ❝
            </Btn>
            <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
              {"</>"}
            </Btn>
          </>
        )}
        <Btn active={editor.isActive("link")} onClick={setLink} title="Link">
          🔗
        </Btn>
        {canInsertImage ? (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept={BLOG_IMAGE_ACCEPT}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void insertImage(file);
              }}
            />
            <Btn
              active={false}
              onClick={() => {
                if (imageBusy) return;
                imageInputRef.current?.click();
              }}
              title={imageBusy ? "Uploading image…" : "Insert image"}
            >
              {imageBusy ? "…" : "🖼"}
            </Btn>
          </>
        ) : null}

        <Divider />

        {/* Undo/redo */}
        <Btn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↩
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↪
        </Btn>

        <Divider />

        {/* Clear */}
        <Btn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          ✕ Clear
        </Btn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
      {imageError ? <p className="px-3 py-2 text-[11px] text-red-400/90">{imageError}</p> : null}
    </div>
  );
}
