"use client";

/**
 * NavEditor — drag-and-drop navigation tree editor.
 *
 * Features:
 *   • Reorder top-level items via drag & drop
 *   • Reorder sub-nav items within their parent
 *   • Add / remove / hide items at both levels
 *   • Select an existing page or enter a custom path
 *   • Jump to that page’s CMS editor
 *
 * Uses @dnd-kit/core + @dnd-kit/sortable
 */

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isServicesNavItem, type NavItem } from "@/lib/content";

export type NavPageOption = {
  label: string;
  href: string;
  group: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function PagePicker({
  href,
  options,
  onChange,
}: {
  href: string;
  options: NavPageOption[];
  onChange: (href: string, label?: string) => void;
}) {
  const matched = options.find((o) => o.href === href);
  const selectValue = matched ? matched.href : "__custom__";
  const groups = useMemo(() => {
    const map = new Map<string, NavPageOption[]>();
    for (const option of options) {
      const list = map.get(option.group) ?? [];
      list.push(option);
      map.set(option.group, list);
    }
    return [...map.entries()];
  }, [options]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center">
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "__custom__") {
            onChange(href === matched?.href ? "/" : href);
            return;
          }
          const option = options.find((o) => o.href === next);
          onChange(next, option?.label);
        }}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-[#1857EC] sm:max-w-[220px]"
      >
        {groups.map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((item) => (
              <option key={`${group}-${item.href}`} value={item.href}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value="__custom__">Custom path…</option>
      </select>
      {(selectValue === "__custom__" || !matched) && (
        <input
          type="text"
          value={href}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/path"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white/70 placeholder-white/20 outline-none focus:border-[#1857EC]"
        />
      )}
    </div>
  );
}

function SubItemRow({
  item,
  options,
  onUpdate,
  onRemove,
  onEditPage,
}: {
  item: NavItem;
  options: NavPageOption[];
  onUpdate: (updated: NavItem) => void;
  onRemove: () => void;
  onEditPage?: (href: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="ml-8 flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-white/25 hover:text-white/50 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
          <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
          <circle cx="3" cy="13" r="1.5" /><circle cx="9" cy="13" r="1.5" />
        </svg>
      </button>

      <input
        type="text"
        value={item.label}
        onChange={(e) => onUpdate({ ...item, label: e.target.value })}
        placeholder="Label"
        className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-white/20 outline-none focus:border-[#1857EC]"
      />
      <PagePicker
        href={item.href}
        options={options}
        onChange={(href, label) =>
          onUpdate({
            ...item,
            href,
            ...(label && (item.label === "New link" || item.label === "New page") ? { label } : {}),
          })
        }
      />

      {onEditPage && (
        <button
          type="button"
          onClick={() => onEditPage(item.href)}
          className="text-[11px] text-[#60a5fa] hover:underline"
        >
          Edit page
        </button>
      )}

      <button
        type="button"
        title={item.hidden ? "Hidden — click to show" : "Visible — click to hide"}
        onClick={() => onUpdate({ ...item, hidden: !item.hidden })}
        className={`text-sm transition ${item.hidden ? "text-white/20 hover:text-white/50" : "text-white/50 hover:text-white/80"}`}
      >
        {item.hidden ? "🙈" : "👁"}
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="text-xs text-red-400/50 hover:text-red-400"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

function TopItemRow({
  item,
  options,
  onUpdate,
  onRemove,
  onEditPage,
}: {
  item: NavItem;
  options: NavPageOption[];
  onUpdate: (updated: NavItem) => void;
  onRemove: () => void;
  onEditPage?: (href: string) => void;
}) {
  const [expanded, setExpanded] = useState(
    () => isServicesNavItem(item) || (item.children?.length ?? 0) > 0,
  );
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isMegaMenu = isServicesNavItem(item);
  const subSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleSubDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const children = item.children ?? [];
    const oldIdx = children.findIndex((c) => c.id === active.id);
    const newIdx = children.findIndex((c) => c.id === over.id);
    onUpdate({ ...item, children: arrayMove(children, oldIdx, newIdx) });
  }, [item, onUpdate]);

  const addChild = () => {
    const children = item.children ?? [];
    onUpdate({ ...item, children: [...children, { id: uid(), label: "New link", href: "/" }] });
    setExpanded(true);
  };

  const updateChild = (idx: number, updated: NavItem) => {
    const children = [...(item.children ?? [])];
    children[idx] = updated;
    onUpdate({ ...item, children });
  };

  const removeChild = (idx: number) => {
    const children = (item.children ?? []).filter((_, i) => i !== idx);
    onUpdate({ ...item, children });
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1.5">
      <div
        className={`flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 ${
          item.hidden
            ? "border-white/5 bg-white/2 opacity-50"
            : "border-white/10 bg-white/5"
        }`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-white/30 hover:text-white/60 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" /><circle cx="9" cy="13" r="1.5" />
          </svg>
        </button>

        <input
          type="text"
          value={item.label}
          onChange={(e) => onUpdate({ ...item, label: e.target.value })}
          placeholder="Label"
          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm font-medium text-white placeholder-white/20 outline-none focus:border-[#1857EC]"
        />
        <PagePicker
          href={item.href}
          options={options}
          onChange={(href, label) =>
            onUpdate({
              ...item,
              href,
              ...(label && (item.label === "New page" || item.label === "New link") ? { label } : {}),
            })
          }
        />

        {isMegaMenu && (
          <span className="rounded-full bg-[#1857EC]/25 px-2 py-0.5 text-[10px] font-semibold text-blue-300 whitespace-nowrap">
            Services menu
          </span>
        )}

        {onEditPage && (
          <button
            type="button"
            onClick={() => onEditPage(item.href)}
            className="text-[11px] text-[#60a5fa] hover:underline"
          >
            Edit page
          </button>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? "Collapse sub-nav" : "Expand sub-nav"}
          className="text-xs text-white/30 hover:text-white/70"
        >
          {(item.children?.length ?? 0) > 0 ? (
            <span className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
          ) : (
            <span className="text-[10px]">sub</span>
          )}
          {(item.children?.length ?? 0) > 0 && (
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
              {item.children!.length}
            </span>
          )}
        </button>

        <button
          type="button"
          title={item.hidden ? "Hidden — click to show" : "Visible — click to hide"}
          onClick={() => onUpdate({ ...item, hidden: !item.hidden })}
          className={`text-base transition ${item.hidden ? "text-white/20 hover:text-white/50" : "text-white/50 hover:text-white/80"}`}
        >
          {item.hidden ? "🙈" : "👁"}
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-400/40 hover:text-red-400"
          title="Remove item"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="space-y-1.5 pb-1">
          {isMegaMenu && (
            <p className="ml-8 text-[11px] text-blue-300/70">
              Nested links here become the desktop mega menu and the mobile accordion.
              Adding a service can offer to append one item — it will not duplicate the whole list on save.
            </p>
          )}
          <DndContext
            sensors={subSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSubDragEnd}
          >
            <SortableContext
              items={(item.children ?? []).map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {(item.children ?? []).map((child, idx) => (
                <SubItemRow
                  key={child.id}
                  item={child}
                  options={options}
                  onUpdate={(u) => updateChild(idx, u)}
                  onRemove={() => removeChild(idx)}
                  onEditPage={onEditPage}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={addChild}
            className="ml-8 text-xs text-white/35 hover:text-white/60"
          >
            + Add nested link
          </button>
        </div>
      )}
    </div>
  );
}

export function NavEditor({
  items,
  onChange,
  pageOptions,
  onEditPage,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  pageOptions: NavPageOption[];
  onEditPage?: (href: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, oldIdx, newIdx));
  };

  const updateItem = (idx: number, updated: NavItem) => {
    const next = [...items];
    next[idx] = updated;
    onChange(next);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    onChange([...items, { id: uid(), label: "New page", href: "/" }]);
  };

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-white/40">
          Drag rows to reorder. Click ▶ / “sub” to manage nested dropdowns. Pick a page or type a custom path.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-white/35">
          <span>👁 visible</span>
          <span>🙈 hidden</span>
        </div>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/40">
          No menu items. The public header will be empty until you add one.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, idx) => (
            <TopItemRow
              key={item.id}
              item={item}
              options={pageOptions}
              onUpdate={(u) => updateItem(idx, u)}
              onRemove={() => removeItem(idx)}
              onEditPage={onEditPage}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-2xl border border-dashed border-white/15 py-3.5 text-sm text-white/40 transition hover:border-white/30 hover:text-white/60"
      >
        + Add top-level link
      </button>
    </div>
  );
}
