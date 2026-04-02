import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RenoTask {
  id: string;
  name: string;
  cost: number;
}

interface RenoSubCategory {
  id: string;
  name: string;
  tasks: RenoTask[];
}

interface RenoSection {
  id: string;
  name: string;
  color: string;
  subCategories: RenoSubCategory[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, projectName, renoSections } = (await req.json()) as {
      projectId: string;
      projectName: string;
      renoSections: RenoSection[];
    };

    // Check if board already exists for this project
    const { data: existing } = await supabase
      .from("boards")
      .select("id")
      .eq("project_id", projectId)
      .single();

    if (existing) {
      return NextResponse.json({ boardId: existing.id });
    }

    // Create board
    const { data: board, error: boardErr } = await supabase
      .from("boards")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: projectName || "Untitled Board",
      })
      .select("id")
      .single();

    if (boardErr || !board) {
      return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
    }

    // Create groups from renovation sections + a "Completed" group
    const groupInserts = renoSections.map((sec, i) => ({
      board_id: board.id,
      name: sec.name,
      color: sec.color || "#579bfc",
      position: i,
      collapsed: false,
    }));

    // Add a "Completed" group at the end
    groupInserts.push({
      board_id: board.id,
      name: "Completed",
      color: "#00c875",
      position: renoSections.length,
      collapsed: true,
    });

    const { data: groups, error: groupErr } = await supabase
      .from("board_groups")
      .insert(groupInserts)
      .select("id, position");

    if (groupErr || !groups) {
      return NextResponse.json({ error: "Failed to create groups" }, { status: 500 });
    }

    // Map position back to group id
    const groupIdByPos = new Map(groups.map((g) => [g.position, g.id]));

    // Create items (subcategories) and collect for subitems
    const itemInserts: {
      board_id: string;
      group_id: string;
      name: string;
      budget: number;
      position: number;
    }[] = [];

    const subitemMap: Map<number, RenoTask[]> = new Map(); // itemIndex -> tasks

    let itemIdx = 0;
    renoSections.forEach((sec, secIdx) => {
      const gid = groupIdByPos.get(secIdx);
      if (!gid) return;

      sec.subCategories.forEach((sub, subIdx) => {
        const totalBudget = sub.tasks.reduce((s, t) => s + (t.cost || 0), 0);
        itemInserts.push({
          board_id: board.id,
          group_id: gid,
          name: sub.name,
          budget: totalBudget,
          position: subIdx,
        });
        if (sub.tasks.length > 0) {
          subitemMap.set(itemIdx, sub.tasks);
        }
        itemIdx++;
      });
    });

    const { data: items, error: itemErr } = await supabase
      .from("board_items")
      .insert(itemInserts)
      .select("id");

    if (itemErr || !items) {
      return NextResponse.json({ error: "Failed to create items" }, { status: 500 });
    }

    // Create subitems
    const subitemInserts: {
      item_id: string;
      name: string;
      budget: number;
      position: number;
    }[] = [];

    items.forEach((item, idx) => {
      const tasks = subitemMap.get(idx);
      if (!tasks) return;
      tasks.forEach((t, tIdx) => {
        subitemInserts.push({
          item_id: item.id,
          name: t.name,
          budget: t.cost || 0,
          position: tIdx,
        });
      });
    });

    if (subitemInserts.length > 0) {
      await supabase.from("board_subitems").insert(subitemInserts);
    }

    return NextResponse.json({ boardId: board.id });
  } catch (error) {
    console.error("Board creation error:", error);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
