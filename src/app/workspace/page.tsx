"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  MapPin,
  Clock,
  Trash2,
  Layers,
} from "lucide-react";

interface BoardSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  saved_projects: { property_address: string | null } | null;
  _group_count?: number;
  _item_count?: number;
}

export default function WorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("boards")
      .select("id, name, created_at, updated_at, project_id, saved_projects(property_address)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setBoards(data as unknown as BoardSummary[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && user) fetchBoards();
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, fetchBoards, router]);

  const handleDelete = async (id: string) => {
    await supabase.from("boards").delete().eq("id", id);
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-4 py-4 sm:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tx flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-accent" />
            Workspace
          </h1>
          <p className="text-sm text-tx-muted mt-0.5">
            {boards.length} project {boards.length === 1 ? "board" : "boards"}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-accent to-cyan-500 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Link>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-20">
          <Layers className="w-14 h-14 mx-auto mb-4 text-tx-muted/30" />
          <p className="text-tx-muted font-medium">No project boards yet</p>
          <p className="text-tx-muted text-sm mt-1 mb-4">
            Save a calculator project with renovation data to auto-create a board.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((b) => {
            const address =
              b.saved_projects && typeof b.saved_projects === "object"
                ? (b.saved_projects as { property_address: string | null }).property_address
                : null;
            return (
              <Link
                key={b.id}
                href={`/workspace/${b.id}`}
                className="group bg-surface-1 border border-edge rounded-2xl p-5 hover:border-accent/30 transition-all"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-white">
                    <LayoutGrid className="w-4.5 h-4.5" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(b.id);
                    }}
                    className="p-1.5 rounded-lg text-tx-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-tx truncate">{b.name}</h3>
                {address && (
                  <p className="text-xs text-tx-muted flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {address}
                  </p>
                )}
                <p className="text-[11px] text-tx-muted flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3" />
                  {new Date(b.updated_at).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
