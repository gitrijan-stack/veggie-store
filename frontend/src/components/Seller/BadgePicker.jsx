// Badge text options, each with its own fixed color so sellers just pick a
// label — no separate color step. "None" clears the badge entirely.
export const BADGE_OPTIONS = ["", "BESTSELLER", "FRESH", "SALE", "NEW", "POPULAR"];

// One unique color per badge (kept in sync with the palette already used
// across the seeded catalog — see sql/schema.sql).
export const BADGE_COLOR_MAP = {
  BESTSELLER: "bg-soil-500",
  FRESH: "bg-leaf-500",
  SALE: "bg-red-500",
  NEW: "bg-purple-500",
  POPULAR: "bg-leaf-700",
};

const BadgePicker = ({ badge, onChange }) => (
  <select
    value={badge || ""}
    onChange={(e) => {
      const nextBadge = e.target.value;
      onChange({ badge: nextBadge, badgeColor: BADGE_COLOR_MAP[nextBadge] || "" });
    }}
    className="input"
  >
    {BADGE_OPTIONS.map((b) => (
      <option key={b || "none"} value={b}>{b || "No badge"}</option>
    ))}
  </select>
);

export default BadgePicker;
