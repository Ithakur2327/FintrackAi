import { createPortal } from "react-dom";

/**
 * Renders children into document.body via a portal.
 *
 * Why this exists: PageTransition wraps every route in a motion.div that
 * animates `transform` (scale/translate) and `filter` (blur). Per the CSS
 * spec, any ancestor with a non-default transform OR filter becomes the
 * containing block for descendants with `position: fixed`. That meant every
 * modal overlay (fixed inset-0) was being positioned relative to that
 * animated page wrapper instead of the viewport — causing modals to render
 * lower/off-center instead of centered on screen.
 *
 * Portaling straight to <body> sidesteps this entirely: the overlay is now
 * a direct child of body (no transformed/filtered ancestors), so
 * `fixed inset-0 flex items-center justify-center` centers correctly in the
 * viewport every time.
 */
export default function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}