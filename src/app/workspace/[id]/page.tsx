"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
  LayoutGrid,
  MoreHorizontal,
  Clock,
  X,
} from "lucide-react";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  GROUP_COLORS,
  type BoardGroup,
  type BoardItem,
  type BoardSubitem,
  type BoardActivity,
  type ItemStatus,
  type ItemPriority,
} from "@/lib/board-types";

function fmt(n: number): string {
  if (!n) return "";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Inline Cell Components ────────────────────────────────────────────────

function StatusCell({
  value,
  onChange,
}: {
  value: ItemStatus;
  onChange: (v: ItemStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[value];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-2 py-1 rounded text-xs font-semibold text-center cursor-pointer transition-colors"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-surface-1 border border-edge rounded-lg shadow-xl overflow-hidden min-w-[140px]">
            {(Object.entries(STATUS_CONFIG) as [ItemStatus, typeof cfg][]).map(
              ([key, c]) => (
                <button
                  key={key}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-left hover:opacity-80 cursor-pointer transition-opacity"
                  style={{ background: c.bg, color: c.color }}
                >
                  {c.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PriorityCell({
  value,
  onChange,
}: {
  value: ItemPriority;
  onChange: (v: ItemPriority) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY_CONFIG[value];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-2 py-1 rounded text-xs font-semibold text-center cursor-pointer transition-colors min-h-[26px]"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.label || "—"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-surface-1 border border-edge rounded-lg shadow-xl overflow-hidden min-w-[120px]">
            {(
              Object.entries(PRIORITY_CONFIG) as [ItemPriority, typeof cfg][]
            ).map(([key, c]) => (
              <button
                key={key}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-xs font-semibold text-left hover:opacity-80 cursor-pointer transition-opacity"
                style={{ background: c.bg, color: c.color }}
              >
                {c.label || "(none)"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DateCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full bg-transparent border-none text-xs text-tx-secondary text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40 rounded px-1 py-1"
      />
    </div>
  );
}

function EditableText({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft !== value) onChange(draft);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(value);
          }
        }}
        className={`bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-accent/40 rounded px-1 ${className || "text-xs text-tx"}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-text truncate block px-1 ${className || "text-xs text-tx-secondary"} ${!value ? "text-tx-muted/40 italic" : ""}`}
    >
      {value || placeholder || "—"}
    </span>
  );
}

function BudgetCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value || ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const n = parseFloat(draft) || 0;
          if (n !== value) onChange(n);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            const n = parseFloat(draft) || 0;
            if (n !== value) onChange(n);
          }
        }}
        className="w-full bg-input-bg border border-input-border rounded px-2 py-1 text-xs text-tx font-mono text-right focus:outline-none focus:ring-1 focus:ring-accent/40"
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(String(value || ""));
        setEditing(true);
      }}
      className={`cursor-text text-xs font-mono text-right block px-1 ${value ? "text-tx-secondary" : "text-tx-muted/40"}`}
    >
      {value ? fmt(value) : "—"}
    </span>
  );
}

// ── Subitem Row ───────────────────────────────────────────────────────────

function SubitemRow({
  sub,
  onUpdate,
  onDelete,
  groupColor,
}: {
  sub: BoardSubitem;
  onUpdate: (field: string, value: unknown) => void;
  onDelete: () => void;
  groupColor: string;
}) {
  return (
    <tr className="group/sub hover:bg-surface-2/30 transition-colors border-b border-edge/20">
      <td
        className="pl-12 pr-2 py-1.5"
        style={{ borderLeft: `3px solid ${groupColor}30` }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-tx-muted/30 shrink-0" />
          <EditableText
            value={sub.name}
            onChange={(v) => onUpdate("name", v)}
            placeholder="Subitem name..."
            className="text-xs text-tx-secondary"
          />
        </div>
      </td>
      <td className="px-2 py-1.5">
        <EditableText
          value={sub.owner}
          onChange={(v) => onUpdate("owner", v)}
          placeholder="—"
          className="text-xs text-tx-muted"
        />
      </td>
      <td className="px-2 py-1.5 w-[120px]">
        <StatusCell
          value={sub.status as ItemStatus}
          onChange={(v) => onUpdate("status", v)}
        />
      </td>
      <td className="px-2 py-1.5 w-[100px]">
        <DateCell
          value={sub.due_date}
          onChange={(v) => onUpdate("due_date", v)}
        />
      </td>
      {/* Empty cells for Priority, Notes, Timeline */}
      <td />
      <td />
      <td className="px-2 py-1.5 w-[90px]">
        <BudgetCell
          value={sub.budget}
          onChange={(v) => onUpdate("budget", v)}
        />
      </td>
      <td />
      <td className="px-2 py-1 w-8">
        <button
          onClick={onDelete}
          className="p-1 rounded text-tx-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/sub:opacity-100 cursor-pointer transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </td>
    </tr>
  );
}

// ── Item Row ──────────────────────────────────────────────────────────────

function ItemRow({
  item,
  groupColor,
  supabase,
  boardId,
  userId,
  onRefresh,
}: {
  item: BoardItem;
  groupColor: string;
  supabase: ReturnType<typeof createClient>;
  boardId: string;
  userId: string;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const subs = item.subitems || [];

  const updateItem = useCallback(
    async (field: string, value: unknown) => {
      await supabase
        .from("board_items")
        .update({ [field]: value })
        .eq("id", item.id);
      // Log activity
      await supabase.from("board_activity").insert({
        board_id: boardId,
        item_id: item.id,
        user_id: userId,
        field,
        old_value: String((item as unknown as Record<string, unknown>)[field] ?? ""),
        new_value: String(value ?? ""),
      });
      onRefresh();
    },
    [supabase, item, boardId, userId, onRefresh]
  );

  const updateSubitem = useCallback(
    async (subId: string, field: string, value: unknown) => {
      await supabase
        .from("board_subitems")
        .update({ [field]: value })
        .eq("id", subId);
      onRefresh();
    },
    [supabase, onRefresh]
  );

  const addSubitem = useCallback(async () => {
    await supabase.from("board_subitems").insert({
      item_id: item.id,
      name: "",
      position: subs.length,
    });
    setExpanded(true);
    onRefresh();
  }, [supabase, item.id, subs.length, onRefresh]);

  const deleteSubitem = useCallback(
    async (subId: string) => {
      await supabase.from("board_subitems").delete().eq("id", subId);
      onRefresh();
    },
    [supabase, onRefresh]
  );

  const deleteItem = useCallback(async () => {
    await supabase.from("board_items").delete().eq("id", item.id);
    onRefresh();
  }, [supabase, item.id, onRefresh]);

  return (
    <>
      <tr className="group/item hover:bg-surface-2/20 transition-colors border-b border-edge/30">
        <td
          className="pl-3 pr-2 py-2"
          style={{ borderLeft: `3px solid ${groupColor}` }}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 rounded hover:bg-surface-2 cursor-pointer shrink-0"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-tx-muted" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-tx-muted" />
              )}
            </button>
            <EditableText
              value={item.name}
              onChange={(v) => updateItem("name", v)}
              placeholder="Task name..."
              className="text-sm font-medium text-tx"
            />
            {subs.length > 0 && (
              <span className="text-[10px] text-tx-muted bg-surface-2 px-1.5 py-0.5 rounded-full shrink-0">
                {subs.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-2 py-2 w-[90px]">
          <EditableText
            value={item.owner}
            onChange={(v) => updateItem("owner", v)}
            placeholder="—"
          />
        </td>
        <td className="px-2 py-2 w-[120px]">
          <StatusCell
            value={item.status as ItemStatus}
            onChange={(v) => updateItem("status", v)}
          />
        </td>
        <td className="px-2 py-2 w-[100px]">
          <DateCell
            value={item.due_date}
            onChange={(v) => updateItem("due_date", v)}
          />
        </td>
        <td className="px-2 py-2 w-[100px]">
          <PriorityCell
            value={item.priority as ItemPriority}
            onChange={(v) => updateItem("priority", v)}
          />
        </td>
        <td className="px-2 py-2 w-[120px]">
          <EditableText
            value={item.notes}
            onChange={(v) => updateItem("notes", v)}
            placeholder="Notes..."
          />
        </td>
        <td className="px-2 py-2 w-[90px]">
          <BudgetCell
            value={item.budget}
            onChange={(v) => updateItem("budget", v)}
          />
        </td>
        <td className="px-2 py-2 w-[140px]">
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={item.timeline_start || ""}
              onChange={(e) => updateItem("timeline_start", e.target.value || null)}
              className="w-1/2 bg-transparent text-[10px] text-tx-muted focus:outline-none cursor-pointer"
            />
            <span className="text-tx-muted/40 text-[10px]">→</span>
            <input
              type="date"
              value={item.timeline_end || ""}
              onChange={(e) => updateItem("timeline_end", e.target.value || null)}
              className="w-1/2 bg-transparent text-[10px] text-tx-muted focus:outline-none cursor-pointer"
            />
          </div>
        </td>
        <td className="px-2 py-1 w-8">
          <div className="flex gap-0.5">
            <button
              onClick={addSubitem}
              className="p-1 rounded text-tx-muted hover:text-accent hover:bg-accent/10 opacity-0 group-hover/item:opacity-100 cursor-pointer transition-all"
              title="Add subitem"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={deleteItem}
              className="p-1 rounded text-tx-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/item:opacity-100 cursor-pointer transition-all"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
      {/* Subitems */}
      {expanded &&
        subs.map((sub) => (
          <SubitemRow
            key={sub.id}
            sub={sub}
            groupColor={groupColor}
            onUpdate={(f, v) => updateSubitem(sub.id, f, v)}
            onDelete={() => deleteSubitem(sub.id)}
          />
        ))}
      {expanded && (
        <tr>
          <td
            colSpan={9}
            className="pl-12 py-1"
            style={{ borderLeft: `3px solid ${groupColor}20` }}
          >
            <button
              onClick={addSubitem}
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 cursor-pointer font-medium"
            >
              <Plus className="w-3 h-3" /> Add subitem
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Group Section ─────────────────────────────────────────────────────────

function GroupSection({
  group,
  supabase,
  boardId,
  userId,
  onRefresh,
}: {
  group: BoardGroup;
  supabase: ReturnType<typeof createClient>;
  boardId: string;
  userId: string;
  onRefresh: () => void;
}) {
  const [collapsed, setCollapsed] = useState(group.collapsed);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(group.name);
  const items = group.items || [];
  const totalBudget = items.reduce((s, i) => s + (i.budget || 0), 0);

  const updateGroupName = useCallback(async () => {
    if (name.trim() && name !== group.name) {
      await supabase
        .from("board_groups")
        .update({ name: name.trim() })
        .eq("id", group.id);
      onRefresh();
    }
    setEditingName(false);
  }, [name, group, supabase, onRefresh]);

  const addItem = useCallback(async () => {
    await supabase.from("board_items").insert({
      board_id: boardId,
      group_id: group.id,
      name: "",
      position: items.length,
    });
    setCollapsed(false);
    onRefresh();
  }, [supabase, boardId, group.id, items.length, onRefresh]);

  const deleteGroup = useCallback(async () => {
    await supabase.from("board_groups").delete().eq("id", group.id);
    onRefresh();
  }, [supabase, group.id, onRefresh]);

  return (
    <div className="mb-4">
      {/* Group header */}
      <div className="flex items-center gap-2 mb-1 group/grp">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: group.color }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: group.color }} />
          )}
        </button>
        {editingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={updateGroupName}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateGroupName();
              if (e.key === "Escape") {
                setName(group.name);
                setEditingName(false);
              }
            }}
            autoFocus
            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-accent/40 rounded px-1"
            style={{ color: group.color }}
          />
        ) : (
          <span
            onClick={() => setEditingName(true)}
            className="text-lg font-bold cursor-text"
            style={{ color: group.color }}
          >
            {group.name}
          </span>
        )}
        <span className="text-xs text-tx-muted">
          {items.length} {items.length === 1 ? "task" : "tasks"}
        </span>
        <button
          onClick={deleteGroup}
          className="p-1 rounded text-tx-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/grp:opacity-100 cursor-pointer transition-all ml-1"
          title="Delete group"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="text-[11px] text-white uppercase tracking-wider"
                style={{ background: group.color }}
              >
                <th className="pl-3 pr-2 py-2 font-semibold rounded-tl-lg">Task</th>
                <th className="px-2 py-2 font-semibold w-[90px]">Owner</th>
                <th className="px-2 py-2 font-semibold w-[120px]">Status</th>
                <th className="px-2 py-2 font-semibold w-[100px]">Due Date</th>
                <th className="px-2 py-2 font-semibold w-[100px]">Priority</th>
                <th className="px-2 py-2 font-semibold w-[120px]">Notes</th>
                <th className="px-2 py-2 font-semibold w-[90px]">Budget</th>
                <th className="px-2 py-2 font-semibold w-[140px]">Timeline</th>
                <th className="px-2 py-2 w-8 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody className="bg-surface-1">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  groupColor={group.color}
                  supabase={supabase}
                  boardId={boardId}
                  userId={userId}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>

          {/* Add task + summary row */}
          <div
            className="flex items-center justify-between px-3 py-2 border-t border-edge/30 rounded-b-lg"
            style={{ borderLeft: `3px solid ${group.color}`, background: `${group.color}08` }}
          >
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: group.color }}
            >
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
            {totalBudget > 0 && (
              <span className="text-xs font-mono font-semibold text-tx-secondary">
                {fmt(totalBudget)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Collapsed summary */}
      {collapsed && (
        <div
          className="flex items-center gap-4 px-3 py-2 rounded-lg text-xs text-tx-muted"
          style={{ borderLeft: `3px solid ${group.color}`, background: `${group.color}08` }}
        >
          <span>{items.length} tasks</span>
          {totalBudget > 0 && (
            <span className="font-mono font-semibold">{fmt(totalBudget)}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Activity Panel ────────────────────────────────────────────────────────

function ActivityPanel({
  boardId,
  supabase,
  open,
  onClose,
}: {
  boardId: string;
  supabase: ReturnType<typeof createClient>;
  open: boolean;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<BoardActivity[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("board_activity")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setLogs(data);
      });
  }, [open, boardId, supabase]);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 bg-surface-1 border-l border-edge shadow-xl z-30 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge sticky top-0 bg-surface-1">
        <h3 className="text-sm font-bold text-tx">Activity Log</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface-2 cursor-pointer"
        >
          <X className="w-4 h-4 text-tx-muted" />
        </button>
      </div>
      <div className="divide-y divide-edge/30">
        {logs.length === 0 && (
          <p className="text-center py-8 text-xs text-tx-muted">
            No activity yet
          </p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <Clock className="w-3 h-3 text-accent" />
              </div>
              <span className="text-xs font-semibold text-tx capitalize">
                {log.field}
              </span>
            </div>
            <div className="pl-7 text-[11px] text-tx-muted">
              <span className="line-through">{log.old_value || "(empty)"}</span>
              {" → "}
              <span className="text-tx-secondary font-medium">
                {log.new_value || "(empty)"}
              </span>
            </div>
            <p className="pl-7 text-[10px] text-tx-muted/60 mt-0.5">
              {new Date(log.created_at).toLocaleString("en-AU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Board Page ───────────────────────────────────────────────────────

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [groups, setGroups] = useState<BoardGroup[]>([]);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!user) return;
    const boardId = params.id as string;

    // Fetch board
    const { data: board } = await supabase
      .from("boards")
      .select("name")
      .eq("id", boardId)
      .single();
    if (board) setBoardName(board.name);

    // Fetch groups
    const { data: grps } = await supabase
      .from("board_groups")
      .select("*")
      .eq("board_id", boardId)
      .order("position");

    if (!grps) {
      setLoading(false);
      return;
    }

    // Fetch items
    const { data: items } = await supabase
      .from("board_items")
      .select("*")
      .eq("board_id", boardId)
      .order("position");

    // Fetch subitems for all items
    const itemIds = (items || []).map((i) => i.id);
    let subitems: BoardSubitem[] = [];
    if (itemIds.length > 0) {
      const { data: subs } = await supabase
        .from("board_subitems")
        .select("*")
        .in("item_id", itemIds)
        .order("position");
      if (subs) subitems = subs as BoardSubitem[];
    }

    // Nest subitems into items
    const subsByItem = new Map<string, BoardSubitem[]>();
    subitems.forEach((s) => {
      const arr = subsByItem.get(s.item_id) || [];
      arr.push(s);
      subsByItem.set(s.item_id, arr);
    });

    const itemsWithSubs = (items || []).map((i) => ({
      ...i,
      subitems: subsByItem.get(i.id) || [],
    })) as BoardItem[];

    // Nest items into groups
    const itemsByGroup = new Map<string, BoardItem[]>();
    itemsWithSubs.forEach((i) => {
      const arr = itemsByGroup.get(i.group_id) || [];
      arr.push(i);
      itemsByGroup.set(i.group_id, arr);
    });

    const groupsWithItems = grps.map((g) => ({
      ...g,
      items: itemsByGroup.get(g.id) || [],
    })) as BoardGroup[];

    setGroups(groupsWithItems);
    setLoading(false);
  }, [user, params.id, supabase]);

  useEffect(() => {
    if (!authLoading && user) fetchBoard();
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, fetchBoard, router]);

  const addGroup = useCallback(async () => {
    const colorIdx = groups.length % GROUP_COLORS.length;
    await supabase.from("board_groups").insert({
      board_id: params.id as string,
      name: "New Group",
      color: GROUP_COLORS[colorIdx],
      position: groups.length,
    });
    fetchBoard();
  }, [supabase, params.id, groups.length, fetchBoard]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-6">
      {/* Board header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="p-1.5 rounded-lg hover:bg-surface-2 text-tx-muted hover:text-tx transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold text-tx">{boardName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivityOpen(!activityOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
              activityOpen
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-surface-2/50 text-tx-muted border-edge hover:bg-surface-2"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Activity
          </button>
        </div>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <GroupSection
          key={group.id}
          group={group}
          supabase={supabase}
          boardId={params.id as string}
          userId={user!.id}
          onRefresh={fetchBoard}
        />
      ))}

      {/* Add group button */}
      <button
        onClick={addGroup}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-tx-muted hover:text-accent border border-dashed border-edge hover:border-accent/40 rounded-xl cursor-pointer transition-all mt-2"
      >
        <Plus className="w-3.5 h-3.5" /> Add new group
      </button>

      {/* Activity panel */}
      <ActivityPanel
        boardId={params.id as string}
        supabase={supabase}
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
      />
    </div>
  );
}
