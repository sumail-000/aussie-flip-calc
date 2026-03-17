// ============================================================================
// Renovation Budget — Categories, SubCategories & Default Tasks
// Used by the Detailed Renovation Budget spreadsheet component.
// ============================================================================

export interface RenovationTask {
  id: string;
  name: string;
  cost: number;
}

export interface SubCategory {
  id: string;
  name: string;
  tasks: RenovationTask[];
}

export interface RenovationSection {
  id: string;
  name: string;
  color: string;          // left-border accent colour
  subCategories: SubCategory[];
}

let _uid = 0;
export function uid(): string {
  return `t-${++_uid}-${Date.now().toString(36)}`;
}

export function createTask(name = ''): RenovationTask {
  return { id: uid(), name, cost: 0 };
}

// ── Default renovation template ─────────────────────────────────────────────

export const DEFAULT_SECTIONS: RenovationSection[] = [
  {
    id: 'external',
    name: 'External Sections',
    color: '#8b5cf6',
    subCategories: [
      {
        id: 'front-elevation',
        name: 'Front Elevation',
        tasks: [
          { id: uid(), name: 'Clear and Level Front', cost: 0 },
          { id: uid(), name: 'Render Front Facade', cost: 0 },
          { id: uid(), name: 'Paint Front Facade', cost: 0 },
          { id: uid(), name: 'Lights for Pillars', cost: 0 },
          { id: uid(), name: 'Front Door and Hardware', cost: 0 },
        ],
      },
      {
        id: 'backyard',
        name: 'Back Yard and Outside Area',
        tasks: [
          { id: uid(), name: 'Landscaping / Garden Beds', cost: 0 },
          { id: uid(), name: 'Fencing', cost: 0 },
          { id: uid(), name: 'Decking / Patio', cost: 0 },
          { id: uid(), name: 'Outdoor Lighting', cost: 0 },
          { id: uid(), name: 'Driveway / Paths', cost: 0 },
        ],
      },
    ],
  },
  {
    id: 'internal',
    name: 'Internal Sections',
    color: '#10b981',
    subCategories: [
      {
        id: 'hallway',
        name: 'Hall Way',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Replace Skirting Boards', cost: 0 },
        ],
      },
      {
        id: 'lounge',
        name: 'Lounge Room',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Replace Skirting Boards', cost: 0 },
        ],
      },
      {
        id: 'formal-dining',
        name: 'Formal Dining Room',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Replace Skirting Boards', cost: 0 },
        ],
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        tasks: [
          { id: uid(), name: 'New Cabinetry', cost: 0 },
          { id: uid(), name: 'Benchtops', cost: 0 },
          { id: uid(), name: 'Splashback', cost: 0 },
          { id: uid(), name: 'Sink and Tapware', cost: 0 },
          { id: uid(), name: 'Appliances', cost: 0 },
        ],
      },
      {
        id: 'living',
        name: 'Living Room',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Replace Skirting Boards', cost: 0 },
        ],
      },
      {
        id: 'bedroom-1',
        name: 'Bedroom 1',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Built-in Wardrobe', cost: 0 },
        ],
      },
      {
        id: 'bedroom-2',
        name: 'Bedroom 2',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Built-in Wardrobe', cost: 0 },
        ],
      },
      {
        id: 'bedroom-3',
        name: 'Bedroom 3',
        tasks: [
          { id: uid(), name: 'Patch and Repair Walls', cost: 0 },
          { id: uid(), name: 'Built-in Wardrobe', cost: 0 },
        ],
      },
      {
        id: 'ensuite',
        name: 'Ensuite',
        tasks: [
          { id: uid(), name: 'Strip Existing', cost: 0 },
          { id: uid(), name: 'Waterproofing', cost: 0 },
          { id: uid(), name: 'Tiling', cost: 0 },
          { id: uid(), name: 'Vanity and Mirror', cost: 0 },
          { id: uid(), name: 'Tapware and Shower Screen', cost: 0 },
        ],
      },
      {
        id: 'bathroom',
        name: 'Bathroom',
        tasks: [
          { id: uid(), name: 'Strip Existing', cost: 0 },
          { id: uid(), name: 'Waterproofing', cost: 0 },
          { id: uid(), name: 'Tiling', cost: 0 },
          { id: uid(), name: 'Vanity and Mirror', cost: 0 },
          { id: uid(), name: 'Tapware and Shower Screen', cost: 0 },
          { id: uid(), name: 'Bathtub', cost: 0 },
        ],
      },
      {
        id: 'laundry',
        name: 'Laundry',
        tasks: [
          { id: uid(), name: 'Tiling', cost: 0 },
          { id: uid(), name: 'Cabinetry / Tub', cost: 0 },
          { id: uid(), name: 'Tapware', cost: 0 },
        ],
      },
    ],
  },
  {
    id: 'finishes',
    name: 'Finishes & Fittings',
    color: '#3b82f6',
    subCategories: [
      {
        id: 'flooring',
        name: 'Flooring',
        tasks: [
          { id: uid(), name: 'Remove Existing Flooring', cost: 0 },
          { id: uid(), name: 'New Flooring Supply', cost: 0 },
          { id: uid(), name: 'Flooring Installation', cost: 0 },
        ],
      },
      {
        id: 'paint',
        name: 'Paint',
        tasks: [
          { id: uid(), name: 'Interior Paint — Walls', cost: 0 },
          { id: uid(), name: 'Interior Paint — Ceilings', cost: 0 },
          { id: uid(), name: 'Interior Paint — Trim/Doors', cost: 0 },
          { id: uid(), name: 'Exterior Paint', cost: 0 },
        ],
      },
      {
        id: 'light-fittings',
        name: 'Light Fittings',
        tasks: [
          { id: uid(), name: 'Downlights Supply & Install', cost: 0 },
          { id: uid(), name: 'Feature Lights / Pendants', cost: 0 },
          { id: uid(), name: 'Outdoor Lights', cost: 0 },
        ],
      },
      {
        id: 'doors-hardware',
        name: 'Doors and Hardware',
        tasks: [
          { id: uid(), name: 'Internal Doors', cost: 0 },
          { id: uid(), name: 'Door Handles / Hardware', cost: 0 },
          { id: uid(), name: 'Locks', cost: 0 },
        ],
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function sectionTotal(section: RenovationSection): number {
  return section.subCategories.reduce(
    (sum, sub) => sum + sub.tasks.reduce((s, t) => s + (t.cost || 0), 0),
    0,
  );
}

export function subCategoryTotal(sub: SubCategory): number {
  return sub.tasks.reduce((s, t) => s + (t.cost || 0), 0);
}

export function grandTotal(sections: RenovationSection[]): number {
  return sections.reduce((sum, sec) => sum + sectionTotal(sec), 0);
}
