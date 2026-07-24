/**
 * ConfirmModal — styled replacement for window.confirm().
 *
 * Native `window.confirm` renders as a browser-chrome dialog (e.g.
 * "localhost:5173 says ...") which looks broken/unprofessional inside a
 * designed app. This renders an in-app modal instead, matching the rest
 * of the UI (see Login.jsx for the same backdrop/card pattern).
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null);
 *   setConfirmState({
 *     title: "Remove vegetable?",
 *     message: `Remove "${veg.name}"? This can't be undone.`,
 *     confirmLabel: "Remove",
 *     onConfirm: () => doDelete(veg),
 *   });
 *   ...
 *   {confirmState && (
 *     <ConfirmModal {...confirmState} onCancel={() => setConfirmState(null)} />
 *   )}
 */
const ConfirmModal = ({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-bark/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-3xl shadow-2xl w-full max-w-sm p-7 relative border border-leaf-100"
      >
        <h2 className="font-display font-bold text-bark text-xl mb-2">{title}</h2>
        {message && <p className="font-body text-bark/60 text-sm mb-6">{message}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full text-sm font-body font-semibold text-bark/60 hover:bg-leaf-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-sm font-body font-semibold text-white transition ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-leaf-600 hover:bg-leaf-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
