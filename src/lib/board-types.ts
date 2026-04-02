// ============================================================================
// Board / Workspace Types
// ============================================================================

export type ItemStatus = "not_started" | "working" | "done" | "stuck";
export type ItemPriority = "" | "low" | "medium" | "high" | "critical";

export const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: "Not Started", color: "#797e93", bg: "#797e9322" },
  working:     { label: "Working on it", color: "#fdab3d", bg: "#fdab3d22" },
  done:        { label: "Done",          color: "#00c875", bg: "#00c87522" },
  stuck:       { label: "Stuck",         color: "#e2445c", bg: "#e2445c22" },
};

export const PRIORITY_CONFIG: Record<ItemPriority, { label: string; color: string; bg: string }> = {
  "":       { label: "",        color: "#797e93", bg: "transparent" },
  low:      { label: "Low",     color: "#fdab3d", bg: "#fdab3d22" },
  medium:   { label: "Medium",  color: "#5559df", bg: "#5559df22" },
  high:     { label: "High",    color: "#401694", bg: "#401694cc" },
  critical: { label: "Critical",color: "#333333", bg: "#33333322" },
};

export const GROUP_COLORS = [
  "#579bfc", "#00c875", "#fdab3d", "#e2445c", "#a25ddc",
  "#ff642e", "#037f4c", "#66ccff", "#bb3354", "#7f5347",
];

export interface BoardSubitem {
  id: string;
  item_id: string;
  name: string;
  owner: string;
  status: ItemStatus;
  due_date: string | null;
  budget: number;
  position: number;
}

export interface BoardItem {
  id: string;
  board_id: string;
  group_id: string;
  name: string;
  owner: string;
  status: ItemStatus;
  priority: ItemPriority;
  due_date: string | null;
  notes: string;
  budget: number;
  timeline_start: string | null;
  timeline_end: string | null;
  position: number;
  subitems?: BoardSubitem[];
}

export interface BoardGroup {
  id: string;
  board_id: string;
  name: string;
  color: string;
  position: number;
  collapsed: boolean;
  items?: BoardItem[];
}

export interface Board {
  id: string;
  project_id: string | null;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  groups?: BoardGroup[];
}

export interface BoardActivity {
  id: string;
  board_id: string;
  item_id: string | null;
  subitem_id: string | null;
  user_id: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}
