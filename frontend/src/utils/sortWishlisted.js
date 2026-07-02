// Puts hearted (wishlisted) vegetables first, keeping whatever order the
// list was already in (search/filter/sort results) within each group.
// Array.prototype.filter preserves order, so this is a stable partition.
export const sortWishlistedFirst = (list, isWishlisted) => {
  const hearted = list.filter((v) => isWishlisted(v.id));
  const rest = list.filter((v) => !isWishlisted(v.id));
  return [...hearted, ...rest];
};
