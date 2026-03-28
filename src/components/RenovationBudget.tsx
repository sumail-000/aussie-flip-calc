"use client";

import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Layers,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type {
  RenovationSection,
  SubCategory,
} from "@/lib/renovation-categories";
import {
  createTask,
  createSubCategory,
  createSection,
  subCategoryTotal,
  sectionTotal,
  grandTotal,
} from "@/lib/renovation-categories";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  sections: RenovationSection[];
  onChange: (sections: RenovationSection[]) => void;
}

export default function RenovationBudget({ sections, onChange }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSub = useCallback((id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ── Section (Category) operations ──

  const addSection = useCallback(() => {
    const sec = createSection();
    onChange([...sections, sec]);
    setExpandedSections((prev) => new Set(prev).add(sec.id));
  }, [sections, onChange]);

  const removeSection = useCallback(
    (sectionId: string) => {
      onChange(sections.filter((s) => s.id !== sectionId));
    },
    [sections, onChange]
  );

  const updateSectionName = useCallback(
    (sectionId: string, name: string) => {
      onChange(sections.map((s) => (s.id === sectionId ? { ...s, name } : s)));
    },
    [sections, onChange]
  );

  const startEditSection = (sectionId: string, currentName: string) => {
    setEditingSectionId(sectionId);
    setEditingSectionName(currentName);
  };

  const commitEditSection = () => {
    if (editingSectionId && editingSectionName.trim()) {
      updateSectionName(editingSectionId, editingSectionName.trim());
    }
    setEditingSectionId(null);
    setEditingSectionName("");
  };

  // ── SubCategory operations ──

  const addSubCategory = useCallback(
    (sectionId: string) => {
      const sub = createSubCategory();
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, subCategories: [...sec.subCategories, sub] };
      });
      onChange(next);
      setExpandedSubs((prev) => new Set(prev).add(sub.id));
    },
    [sections, onChange]
  );

  const removeSubCategory = useCallback(
    (sectionId: string, subId: string) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, subCategories: sec.subCategories.filter((s) => s.id !== subId) };
      });
      onChange(next);
    },
    [sections, onChange]
  );

  const updateSubCategoryName = useCallback(
    (sectionId: string, subId: string, name: string) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          subCategories: sec.subCategories.map((sub) =>
            sub.id === subId ? { ...sub, name } : sub
          ),
        };
      });
      onChange(next);
    },
    [sections, onChange]
  );

  // ── Task operations ──

  const updateTaskCost = useCallback(
    (sectionId: string, subId: string, taskId: string, cost: number) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          subCategories: sec.subCategories.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              tasks: sub.tasks.map((t) =>
                t.id === taskId ? { ...t, cost } : t
              ),
            };
          }),
        };
      });
      onChange(next);
    },
    [sections, onChange]
  );

  const updateTaskName = useCallback(
    (sectionId: string, subId: string, taskId: string, name: string) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          subCategories: sec.subCategories.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              tasks: sub.tasks.map((t) =>
                t.id === taskId ? { ...t, name } : t
              ),
            };
          }),
        };
      });
      onChange(next);
    },
    [sections, onChange]
  );

  const addTask = useCallback(
    (sectionId: string, subId: string) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          subCategories: sec.subCategories.map((sub) => {
            if (sub.id !== subId) return sub;
            return { ...sub, tasks: [...sub.tasks, createTask()] };
          }),
        };
      });
      onChange(next);
      setExpandedSubs((prev) => new Set(prev).add(subId));
    },
    [sections, onChange]
  );

  const removeTask = useCallback(
    (sectionId: string, subId: string, taskId: string) => {
      const next = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          subCategories: sec.subCategories.map((sub) => {
            if (sub.id !== subId) return sub;
            return { ...sub, tasks: sub.tasks.filter((t) => t.id !== taskId) };
          }),
        };
      });
      onChange(next);
    },
    [sections, onChange]
  );

  const total = grandTotal(sections);

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isOpen = expandedSections.has(section.id);
        const secTotal = sectionTotal(section);
        const taskCount = section.subCategories.reduce(
          (n, s) => n + s.tasks.length,
          0
        );
        const isEditing = editingSectionId === section.id;

        return (
          <div key={section.id} className="rounded-xl border border-edge overflow-hidden">
            {/* Section Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 bg-surface-2/60 hover:bg-surface-2"
              style={{ borderLeft: `4px solid ${section.color}` }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="shrink-0 cursor-pointer"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-tx-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-tx-muted" />
                )}
              </button>

              {isEditing ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEditSection();
                      if (e.key === "Escape") setEditingSectionId(null);
                    }}
                    autoFocus
                    className="flex-1 bg-input-bg border border-input-border rounded-md py-1 px-2 text-sm font-semibold text-tx focus:outline-none focus:ring-1 focus:ring-input-focus/40"
                  />
                  <button onClick={commitEditSection} className="p-1 rounded hover:bg-green-500/20 text-green-500 cursor-pointer" title="Save">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingSectionId(null)} className="p-1 rounded hover:bg-red-500/20 text-red-500 cursor-pointer" title="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="font-semibold text-sm text-tx flex-1 text-left cursor-pointer"
                >
                  {section.name}
                </button>
              )}

              {!isEditing && (
                <button
                  onClick={(e) => { e.stopPropagation(); startEditSection(section.id, section.name); }}
                  className="p-1 rounded hover:bg-surface-3 text-tx-muted hover:text-tx-secondary cursor-pointer shrink-0"
                  title="Rename category"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}

              <span className="text-[11px] text-tx-muted mr-1 shrink-0 hidden sm:inline">
                {taskCount} {taskCount === 1 ? "Item" : "Items"} /{" "}
                {section.subCategories.length} SubCategories
              </span>
              <span
                className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md shrink-0"
                style={{
                  color: section.color,
                  background: `color-mix(in srgb, ${section.color} 12%, transparent)`,
                }}
              >
                {fmt(secTotal)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                className="p-1 rounded hover:bg-red-500/10 text-tx-muted hover:text-red-500 cursor-pointer shrink-0"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SubCategories */}
            {isOpen && (
              <div className="divide-y divide-edge/50">
                {section.subCategories.map((sub) => (
                  <SubCategoryRow
                    key={sub.id}
                    sub={sub}
                    sectionColor={section.color}
                    isExpanded={expandedSubs.has(sub.id)}
                    onToggle={() => toggleSub(sub.id)}
                    onCostChange={(taskId, cost) =>
                      updateTaskCost(section.id, sub.id, taskId, cost)
                    }
                    onNameChange={(taskId, name) =>
                      updateTaskName(section.id, sub.id, taskId, name)
                    }
                    onAddTask={() => addTask(section.id, sub.id)}
                    onRemoveTask={(taskId) =>
                      removeTask(section.id, sub.id, taskId)
                    }
                    onSubNameChange={(name) =>
                      updateSubCategoryName(section.id, sub.id, name)
                    }
                    onRemoveSub={() => removeSubCategory(section.id, sub.id)}
                  />
                ))}

                {/* Add SubCategory button */}
                <div
                  className="px-5 py-2"
                  style={{ borderLeft: `4px solid ${section.color}25` }}
                >
                  <button
                    onClick={() => addSubCategory(section.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent/80 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add SubCategory
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Category button */}
      <button
        onClick={addSection}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-edge hover:border-accent/40 hover:bg-accent/5 text-tx-muted hover:text-accent text-xs font-medium cursor-pointer transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Category
      </button>

      {/* Grand Total Bar */}
      <div
        className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-accent/30"
        style={{
          background: "color-mix(in srgb, var(--accent) 8%, var(--surface-1))",
        }}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-tx">
            Grand Total — Detailed Renovation
          </span>
        </div>
        <span className="text-lg font-bold text-accent font-mono">
          {fmt(total)}
        </span>
      </div>
    </div>
  );
}

/* ── SubCategory Row ─────────────────────────────────────────────────────── */

function SubCategoryRow({
  sub,
  sectionColor,
  isExpanded,
  onToggle,
  onCostChange,
  onNameChange,
  onAddTask,
  onRemoveTask,
  onSubNameChange,
  onRemoveSub,
}: {
  sub: SubCategory;
  sectionColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  onCostChange: (taskId: string, cost: number) => void;
  onNameChange: (taskId: string, name: string) => void;
  onAddTask: () => void;
  onRemoveTask: (taskId: string) => void;
  onSubNameChange: (name: string) => void;
  onRemoveSub: () => void;
}) {
  const subtotal = subCategoryTotal(sub);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(sub.name);

  const commitEdit = () => {
    if (editName.trim()) onSubNameChange(editName.trim());
    setEditing(false);
  };

  return (
    <div>
      {/* SubCategory header */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface-2/40 group/sub"
        style={{ borderLeft: `4px solid ${sectionColor}40` }}
      >
        <button onClick={onToggle} className="shrink-0 cursor-pointer">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-tx-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-tx-muted" />
          )}
        </button>

        {editing ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
              className="flex-1 bg-input-bg border border-input-border rounded-md py-0.5 px-2 text-sm font-medium text-tx focus:outline-none focus:ring-1 focus:ring-input-focus/40"
            />
            <button onClick={commitEdit} className="p-0.5 rounded hover:bg-green-500/20 text-green-500 cursor-pointer">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setEditing(false)} className="p-0.5 rounded hover:bg-red-500/20 text-red-500 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button onClick={onToggle} className="text-sm font-medium text-tx flex-1 text-left cursor-pointer">
            {sub.name}
          </button>
        )}

        {!editing && (
          <button
            onClick={() => { setEditName(sub.name); setEditing(true); }}
            className="p-0.5 rounded hover:bg-surface-3 text-tx-muted hover:text-tx-secondary opacity-0 group-hover/sub:opacity-100 cursor-pointer shrink-0"
            title="Rename subcategory"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        )}

        <span className="text-[11px] text-tx-muted mr-1 shrink-0">
          {sub.tasks.length} {sub.tasks.length === 1 ? "item" : "items"}
        </span>
        <span className="text-xs font-semibold font-mono text-tx-secondary shrink-0">
          {fmt(subtotal)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemoveSub(); }}
          className="p-0.5 rounded hover:bg-red-500/10 text-tx-muted hover:text-red-500 opacity-0 group-hover/sub:opacity-100 cursor-pointer shrink-0"
          title="Delete subcategory"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Tasks */}
      {isExpanded && (
        <div
          className="bg-surface-2/20 px-5 pb-3 pt-1"
          style={{ borderLeft: `4px solid ${sectionColor}25` }}
        >
          {/* Table header */}
          <div className="flex items-center gap-2 py-1.5 mb-1 border-b border-edge/40">
            <span className="flex-1 text-[11px] font-semibold text-tx-muted uppercase tracking-wider pl-1">
              Item
            </span>
            <span className="w-28 text-[11px] font-semibold text-tx-muted uppercase tracking-wider text-right">
              Budget
            </span>
            <span className="w-8" />
          </div>

          {/* Task rows */}
          {sub.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 py-1 group"
            >
              <input
                type="text"
                value={task.name}
                onChange={(e) => onNameChange(task.id, e.target.value)}
                placeholder="Task name..."
                className="flex-1 bg-transparent border-none text-sm text-tx placeholder:text-tx-muted/50 focus:outline-none py-1 pl-1"
              />
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-tx-muted text-xs pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  value={task.cost || ""}
                  onChange={(e) =>
                    onCostChange(task.id, parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  min={0}
                  step={100}
                  className="w-full bg-input-bg border border-input-border rounded-md py-1 pl-6 pr-2 text-xs text-tx font-mono text-right focus:outline-none focus:ring-1 focus:ring-input-focus/40"
                />
              </div>
              <button
                onClick={() => onRemoveTask(task.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-tx-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                title="Remove task"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add task + Subtotal row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-edge/30">
            <button
              onClick={onAddTask}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent/80 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Task
            </button>
            <div className="text-xs font-semibold text-tx-secondary font-mono">
              Sub Total: {fmt(subtotal)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
