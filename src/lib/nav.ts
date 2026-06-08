/**
 * Robust active-route matching for nav highlighting.
 *
 * With static export + trailingSlash, usePathname() can return "/queue/" while
 * the Link href is "/queue" — so a naive `pathname === href` never matches and
 * no nav item ever appears selected. Normalising trailing slashes fixes that.
 */
function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

export function isActivePath(pathname: string, href: string): boolean {
  return normalize(pathname) === normalize(href);
}
