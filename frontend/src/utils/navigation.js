/**
 * Check if a navigation item is active based on current path
 * @param {string} currentPath - Current location pathname
 * @param {string} itemPath - Navigation item path
 * @returns {boolean} True if the item should be active
 *
 * Test cases:
 * - Dashboard: /admin/dashboard -> active for /admin/dashboard
 * - Products: /admin/products/create -> active for /admin/products
 * - Products: /admin/products/123 -> active for /admin/products
 * - Ingredients: /admin/ingredients/create -> active for /admin/ingredients
 * - Ingredients: /admin/ingredients/123/edit -> active for /admin/ingredients
 * - Orders: /admin/orders/create -> active for /admin/orders
 * - Orders: /admin/orders/123 -> active for /admin/orders
 * - Orders: /admin/orders/123/edit -> active for /admin/orders
 * - Shipper: /admin/shippers/create -> active for /admin/shippers
 * - Shipper: /admin/shippers/123 -> active for /admin/shippers
 * - Shipper: /admin/shippers/123/edit -> active for /admin/shippers
 */
export const isNavItemActive = (currentPath, itemPath) => {
  // Exact match
  if (currentPath === itemPath) {
    return true;
  }

  // Special case for dashboard - handle both /admin and /admin/dashboard
  if (itemPath === "/admin/dashboard") {
    return currentPath === "/admin" || currentPath === "/admin/dashboard";
  }

  // Check if current path starts with item path (for subpaths)
  // But exclude cases where item path is just a prefix of another main route
  if (currentPath.startsWith(itemPath + "/")) {
    return true;
  }

  // Special cases for specific routes
  // Products: /admin/products/create, /admin/products/:id
  if (itemPath === "/admin/products") {
    return currentPath.startsWith("/admin/products/");
  }

  // Ingredients: /admin/ingredients/create, /admin/ingredients/:id/edit
  if (itemPath === "/admin/ingredients") {
    return currentPath.startsWith("/admin/ingredients/");
  }

  // Orders: /admin/orders/create, /admin/orders/:id, /admin/orders/:id/edit
  if (itemPath === "/admin/orders") {
    return currentPath.startsWith("/admin/orders/");
  }

  // Shipper: /admin/shippers/create, /admin/shippers/:id, /admin/shippers/:id/edit
  if (itemPath === "/admin/shippers") {
    return currentPath.startsWith("/admin/shippers/");
  }

  return false;
};

/**
 * Check if a navigation item is active (exact match only)
 * @param {string} currentPath - Current location pathname
 * @param {string} itemPath - Navigation item path
 * @returns {boolean} True if the item should be active
 */
export const isNavItemActiveExact = (currentPath, itemPath) => {
  return currentPath === itemPath;
};
