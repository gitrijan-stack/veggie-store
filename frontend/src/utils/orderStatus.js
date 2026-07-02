// Shared order/delivery tracking stages — used by both the admin dashboard
// (to update status) and the customer-facing "My Orders" tracker.
// Keep this the single source of truth so the two views never drift apart.

export const ORDER_STATUSES = [
  "Confirmed",
  "Processing",
  "Handed to Deliverer",
  "Out for Delivery",
  "Delivered",
];

export const CANCELLED = "Cancelled";
export const ALL_STATUSES = [...ORDER_STATUSES, CANCELLED];

export const STATUS_ICON = {
  Confirmed: "🧾",
  Processing: "📦",
  "Handed to Deliverer": "🤝",
  "Out for Delivery": "🚚",
  Delivered: "✅",
  Cancelled: "✕",
};

export const statusColor = (status) => {
  switch (status) {
    case "Delivered": return "bg-leaf-100 text-leaf-700";
    case "Cancelled": return "bg-red-50 text-red-500";
    case "Out for Delivery": return "bg-blue-50 text-blue-600";
    case "Handed to Deliverer": return "bg-indigo-50 text-indigo-600";
    case "Processing": return "bg-soil-100 text-soil-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

// Index of a status within the normal (non-cancelled) flow, for driving
// progress bars / step indicators. Cancelled orders are handled separately.
export const statusStep = (status) => {
  const i = ORDER_STATUSES.indexOf(status);
  return i === -1 ? 0 : i;
};
