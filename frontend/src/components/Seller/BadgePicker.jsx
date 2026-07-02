// Badge text options + the color palette already used across the seeded
// catalog (see sql/schema.sql). Sellers pick a label and a color swatch;
// "None" clears the badge entirely.
export const BADGE_OPTIONS = ["", "BESTSELLER", "FRESH", "SALE", "NEW", "POPULAR"];

export const BADGE_COLORS = [
  { value: "bg-red-500", label: "Red" },
  { value: "bg-leaf-500", label: "Light green" },
  { value: "bg-leaf-600", label: "Green" },
  { value: "bg-leaf-700", label: "Dark green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-soil-500", label: "Amber" },
];

const BadgePicker = ({ badge, badgeColor, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    <select
      value={badge || ""}
      onChange={(e) => onChange({ badge: e.target.value, badgeColor })}
      className="input"
    >
      {BADGE_OPTIONS.map((b) => (
        <option key={b || "none"} value={b}>{b || "No badge"}</option>
      ))}
    </select>
    <div className="flex items-center gap-1.5 flex-wrap">
      {BADGE_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange({ badge, badgeColor: c.value })}
          className={`w-7 h-7 rounded-full ${c.value} transition ring-offset-2 ${badgeColor === c.value ? "ring-2 ring-bark/50" : "opacity-60 hover:opacity-100"}`}
        />
      ))}
    </div>
  </div>
);

export default BadgePicker;
