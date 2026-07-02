import { useState, useRef, useEffect } from "react";

// A curated set of emoji relevant to a vegetable/produce store. Kept as a
// flat list (not a full emoji library) since that's all this admin form
// needs, and it avoids pulling in a heavy picker dependency.
const EMOJI_OPTIONS = [
  "🥕", "🥦", "🥬", "🥒", "🍅", "🌶️", "🫑", "🧄", "🧅", "🥔",
  "🍠", "🌽", "🥑", "🍆", "🫐", "🌰", "🫛", "🥗", "🌿", "🍄",
  "🎃", "🥝", "🍋", "🍇", "🍓", "🍊", "🍎", "🍏", "🥭", "🌾",
];

const EmojiPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-left"
      >
        <span className="text-lg">{value || "Pick an emoji"}</span>
        <span className="text-bark/30 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 bg-white border border-leaf-100 rounded-xl shadow-lg p-2 grid grid-cols-6 gap-1 w-64">
          {EMOJI_OPTIONS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => { onChange(em); setOpen(false); }}
              className={`text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-leaf-50 transition ${em === value ? "bg-leaf-100 ring-1 ring-leaf-400" : ""}`}
            >
              {em}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
