// Converts a vegetable row from the backend API (snake_case, DB column
// names) into the camelCase shape the UI components were built against.
// Keeping this in one place means every page/component gets the exact
// same fields regardless of which endpoint the data came from — so a
// vegetable added or edited in the admin dashboard looks identical to
// the customer as one of the original seeded items.
export const normalizeVeg = (v) => {
  const stockQty = v.stock_qty != null ? Number(v.stock_qty) : null;
  const rawInStock = v.in_stock === undefined ? true : !!v.in_stock;

  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    category: v.category,
    emoji: v.emoji,
    price: Number(v.price),
    originalPrice: v.original_price != null ? Number(v.original_price) : null,
    unit: v.unit,
    rating: v.rating != null ? Number(v.rating) : 0,
    reviews: v.review_count ?? 0,
    badge: v.badge,
    badgeColor: v.badge_color || "bg-leaf-600",
    isFeatured: !!v.is_featured,
    createdAt: v.created_at || null,
    restockedAt: v.restocked_at || null,
    stockQty,
    // A vegetable is only really "in stock" if the manual toggle says so
    // AND there's actual quantity left — so a listing with 0 units always
    // shows as out of stock, even if nobody flipped the separate toggle.
    inStock: rawInStock && (stockQty === null || stockQty > 0),
    organic: !!v.is_organic,
    pesticidesUsed: v.pesticides_used || null,
    description: v.description,
    // findRelated() on the backend doesn't select tags, so default to []
    // rather than letting components crash on .slice()/.map() of undefined.
    tags: v.tags || [],
    image: v.image_url,
  };
};
