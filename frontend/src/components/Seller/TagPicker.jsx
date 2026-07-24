import { useEffect, useRef, useState } from "react";

// Suggested tags pulled from the seeded catalog (see frontend/src/data/vegetables.js)
// plus a few common extras. Sellers can also type any custom tag.
export const TAG_SUGGESTIONS = [
  "Organic", "Local", "Superfood", "Antioxidant-Rich", "Vitamin C",
  "Versatile", "Kitchen Staple", "Immune-Boost", "Fiber-Rich",
  "Low-Calorie", "Seasonal", "Heirloom",
];

/**
 * Dynamic tag picker — shows current tags as removable chips, a searchable
 * dropdown of suggestions (filtered as you type), a "None" option that
 * clears every tag, and lets sellers add their own custom tag.
 */
const TagPicker = ({ tags, onChange }) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;
    onChange([...tags, clean]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const suggestions = TAG_SUGGESTIONS.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.trim().toLowerCase())
  );
  const canAddCustom = input.trim() && !tags.includes(input.trim()) && !TAG_SUGGESTIONS.some((s) => s.toLowerCase() === input.trim().toLowerCase());

  return (
    <div className="relative" ref={wrapRef}>
      <div onClick={() => setOpen(true)} className="input flex flex-wrap items-center gap-1.5 cursor-text">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs font-semibold bg-leaf-50 text-leaf-700 px-2 py-1 rounded-full border border-leaf-100">
            {t}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(t); }}
              className="text-leaf-700/60 hover:text-leaf-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length ? "" : "Tags — search or add (e.g. Organic, Immune-Boost)"}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-leaf-100 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          <button
            type="button"
            onClick={clearAll}
            disabled={tags.length === 0}
            className="w-full text-left px-3 py-2 text-sm font-body text-bark/50 hover:bg-leaf-50 border-b border-leaf-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            None (clear all tags)
          </button>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="w-full text-left px-3 py-2 text-sm font-body text-bark hover:bg-leaf-50"
            >
              {s}
            </button>
          ))}
          {canAddCustom && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="w-full text-left px-3 py-2 text-sm font-body text-leaf-700 hover:bg-leaf-50"
            >
              Add "{input.trim()}"
            </button>
          )}
          {suggestions.length === 0 && !canAddCustom && (
            <p className="px-3 py-2 text-xs text-bark/30">No more suggestions</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TagPicker;
